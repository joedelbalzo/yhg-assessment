# Your Hidden Genius - Code Redemption System

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Submission Process Flow](#submission-process-flow)
4. [Installation & Setup](#installation--setup)
5. [Development](#development)
6. [Deployment](#deployment)
7. [Environment Variables](#environment-variables)
8. [Google Apps Script Integration](#google-apps-script-integration)
9. [API Documentation](#api-documentation)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Your Hidden Genius** is a full-stack TypeScript application that manages code redemption for a book assessment platform. Users who purchase or borrow the book receive unique codes that grant access to personalized assessments hosted on dynamically assigned subdomains.

### Key Features

- **Code Validation**: Validates physical copy, digital copy, and advance reader copy codes
- **Email Caching**: Maintains a 2500-entry cache of used emails, refreshed every 24 hours
- **Domain Assignment**: Automatically assigns unique assessment URLs from a Google Sheets inventory
- **Library Support**: Special handling for library borrows with custom codes
- **Automated Newsletter Signup**: Puppeteer-based automation for Squarespace newsletter form submission
- **Security**: Rate limiting, CORS protection, reCAPTCHA v2/v3 integration

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Framer Motion, Axios
- **Backend**: Node.js, Express, TypeScript, Puppeteer, Google Sheets API
- **Database**: Google Sheets (via Google Apps Script webhook)
- **Hosting**: Render.com (monolithic deployment)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│  User enters code in frontend form                              │
│         ↓                                                       │
│  Frontend validates code format (regex)                         │
│         ↓                                                       │
│  POST /api/gas/:code (email, bookType, purchasedOrBorrowed)     │
│         ↓                                                       │
│  Backend checks email cache (2500 recent entries)               │
│         ↓                                                       │
│  If NEW: Queue request → POST to Google Apps Script             │
│         ↓                                                       │
│  Apps Script: Validate code → Assign domain → Update sheet      │
│         ↓                                                       │
│  Backend caches email → Returns domain to frontend              │
│         ↓                                                       │
│  User receives unique URL (e.g., account.youscience.com/code)   │
│         ↓                                                       │
│  Background: Puppeteer submits email to Squarespace form        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Frontend (`frontend/`)

- **AppJDB.tsx**: Main application component, manages submission flow
- **BookContext.tsx**: Global state management via React Context
- **FormComponent.tsx**: Multi-step form with validation
- **ReCaptchaComponent.tsx**: reCAPTCHA v2/v3 integration
- **contentMap.tsx**: Maps content states to form components

#### Backend (`backend/`)

- **index.ts**: Server entry point
- **app.ts**: Express configuration, middleware, routes
- **gas.ts**: Google Apps Script communication, email caching, request queue
- **puppet.ts**: Puppeteer automation for Squarespace form submission
- **recaptcha.ts**: reCAPTCHA token verification
- **sendStatuses.ts**: Centralized response messages
- **utils.ts**: Utility functions

---

## Submission Process Flow

### Step-by-Step Breakdown

#### 1. User Interaction (Frontend)

**Files**: `AppJDB.tsx`, `FormComponent.tsx`, `BookContext.tsx`

1. User selects book type: Physical Copy, Digital Copy, or Advance Reader Copy
2. If Physical/Digital: User selects "Purchased" or "Borrowed from Library"
3. User enters code (validated by regex patterns)
4. User enters email address
5. If library borrow: User enters library state and name
6. reCAPTCHA v3 executes automatically in background

**Code References**:

- Book type selection: `AppJDB.tsx:104-114`
- Code validation: `hooks/inputValiditiy.ts`
- Form submission handler: `AppJDB.tsx:136-215`

#### 2. API Request (Frontend → Backend)

**Endpoint**: `POST /api/gas/:code`

**Request Payload**:

```json
{
  "email": "user@example.com",
  "bookType": "physicalCopy",
  "purchasedOrBorrowed": "purchased",
  "libraryState": "California", // optional
  "libraryName": "SF Public Library" // optional
}
```

**File**: `AppJDB.tsx:173-199`

#### 3. Request Validation (Backend)

**File**: `gas.ts:791-861`

1. Validate email format (validator.js): `gas.ts:375-381`
2. Validate code format (regex): `gas.ts:400-426`
3. Validate library inputs (if applicable): `gas.ts:389-392`
4. Add to processing queue: `gas.ts:440-468`

**Code Validation Patterns**:

- **Physical Copy**: `^([12349]\d{3}|[12349]\d{5})$` (4 or 6 digits, starting with 1-4, 9)
- **Digital Copy**: `^(999999|[A-Za-z0-9]{7})$` (7 alphanumeric or special library code)
- **Advance Reader Copy**: `^([123]\d{3}|[123]\d{4}|[123]\d{5})$` (4-6 digits, starting with 1-3)

#### 4. Email Cache Check (Backend)

**File**: `gas.ts:123-313`

1. Check if email exists in cache (Map with 2500 entries): `gas.ts:126-134`
2. If cached: Return existing domain immediately
3. If not cached: Proceed to database query

**Special Email Handlers**:

- `process@emails.com`: Triggers CSV export from Apps Script (`gas.ts:136-179`)
- `refreshcache@emails.com`: Manually refreshes email cache (`gas.ts:181-190`)

#### 5. Request Queue Processing (Backend)

**File**: `gas.ts:428-501`

**Why a queue?** Google Sheets API has rate limits and concurrent writes can cause race conditions. The queue ensures serial processing with controlled delays.

1. Request added to FIFO queue with unique key: `${email}-${code}`
2. Duplicate detection prevents multiple submissions: `gas.ts:450-467`
3. Single request processed at a time: `gas.ts:473-501`
4. Delay between requests: 500ms (queue <3) or 1000ms (queue ≥3)

#### 6. Google Apps Script Call (Backend → GAS)

**File**: `gas.ts:580-687`

**Request to Apps Script**:

```json
{
  "email": "user@example.com",
  "code": "12345",
  "apiKey": "f54af88b-1774-4cf5-8538-751f23a4e6be",
  "bookType": "physicalCopy",
  "purchasedOrBorrowed": "purchased",
  "libraryState": "California",
  "libraryName": "SF Public Library"
}
```

**Apps Script Processing** (see [Google Apps Script Integration](#google-apps-script-integration)):

1. Verify API key
2. Check if code exists and hasn't exceeded usage limit
3. Assign available domain from pool
4. Update Master sheet with new redemption
5. Return success + domain OR error message

**Response from Apps Script**:

```json
{
  "success": true,
  "message": "Code redeemed successfully",
  "domain": "https://potential-123456.yourhiddengenius.com"
}
```

**Error Handling**: `gas.ts:636-656`

- "Maximum number of codes reached."
- "Code already used"
- "Email already used"
- "Code not found"
- "No available domains"
- "This code has reached its usage limit."
- "Cannot use a library book code as a purchased book"
- "Cannot convert a purchased book to a library book after it has been used."

#### 7. Cache Update & Response (Backend)

**File**: `gas.ts:612-634`

1. Add email to cache with domain: `gas.ts:613-618`
2. Add email to Squarespace automation queue: `gas.ts:630-631`
3. Return success response to frontend

**Cache Update Logic**:

```typescript
emailCache.set(email, {
  success: true,
  message: "Used Email",
  email,
  domain: response.data.domain,
});
```

#### 8. Background Automation (Backend)

**File**: `puppet.ts:18-93`

**Squarespace Queue Processing** (5-second delay):

1. Email added to queue: `gas.ts:697-709`
2. Puppeteer launches headless Chrome: `puppet.ts:28-38`
3. Navigates to Squarespace newsletter form
4. Simulates human behavior (random scrolling, mouse movement)
5. Types email with realistic delays
6. Submits form
7. Success/failure logged (doesn't block user flow)

**Render.com Chrome Path**: `/opt/render/.cache/puppeteer/chrome/linux-133.0.6943.98/chrome-linux64/chrome`

**Email Obfuscation in Logs**: `${email.slice(0,5)}*****${email.split('@')[1]}`

#### 9. User Receives Domain (Frontend)

**File**: `AppJDB.tsx:272-294`

1. Frontend receives response with `domain` field
2. Displays success message + clickable link
3. User clicks "Continue to website" button
4. Domain cached in frontend state for future reference

---

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Platform project with Sheets API enabled
- Google Apps Script deployed as web app
- reCAPTCHA v2 and v3 site keys
- Squarespace account (for newsletter integration)

### Local Development Setup

```bash
# Clone repository
git clone <repo-url>
cd Your-Hidden-Genius

# Install all dependencies (root, frontend, backend)
npm run install-all-three

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# Start development servers (both frontend and backend)
npm start

# Frontend will run on http://localhost:5173
# Backend will run on http://localhost:5000
```

### Frontend-Only Development

```bash
cd frontend
npm install
npm run dev
```

### Backend-Only Development

```bash
cd backend
npm install
npm run dev
```

---

## Development

### Project Structure

```
Your-Hidden-Genius/
├── backend/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts               # Server entry point
│   ├── gas.ts                 # Google Apps Script integration
│   ├── puppet.ts              # Puppeteer automation
│   ├── recaptcha.ts           # reCAPTCHA verification
│   ├── sendStatuses.ts        # Response messages
│   ├── utils.ts               # Utility functions
│   ├── build/                 # Compiled JavaScript (gitignored)
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── AppJDB.tsx         # Main component
│   │   ├── BookContext.tsx    # Global state
│   │   ├── index.tsx          # React entry point
│   │   ├── types.tsx          # TypeScript interfaces
│   │   ├── components/
│   │   │   ├── FormComponent.tsx
│   │   │   ├── ReCaptchaComponent.tsx
│   │   │   ├── LoadingComponent.tsx
│   │   │   └── ...
│   │   ├── content/
│   │   │   └── contentMap.tsx  # Form state mapping
│   │   ├── hooks/
│   │   │   ├── inputValiditiy.ts
│   │   │   ├── useRecaptchaV2.ts
│   │   │   ├── useRecaptchaV3.ts
│   │   │   ├── LibrarySearch.ts
│   │   │   └── libraryData/    # US library database
│   │   └── styles/
│   │       ├── Big-Styles.tsx  # Desktop styles
│   │       └── Small-Styles.tsx # Mobile styles
│   ├── dist/                   # Production build (gitignored)
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                # Root package (monorepo scripts)
├── tsconfig.json               # Shared TypeScript config
├── .env                        # Environment variables (gitignored)
├── prepForDeployment.js        # Build script
└── README.md
```

### Development Workflow

#### Making Changes to Backend

1. Edit TypeScript files in `backend/`
2. `ts-node-dev` will auto-recompile and restart server
3. Test via frontend at `http://localhost:5173`

#### Making Changes to Frontend

1. Edit React components in `frontend/src/`
2. Vite HMR will hot-reload changes instantly
3. API calls automatically proxy to `http://localhost:5000`

#### Adding New Form States

1. Add content key to `contentMap.tsx`
2. Create component in `components/`
3. Update state transitions in `AppJDB.tsx:handleReset`

#### Testing Code Validation

Use regex patterns from `.env`:

```typescript
// Physical: 12345 or 123456 (must start with 1,2,3,4,9)
// Digital: abc1234 or 999999 (library code)
// ARC: 1234, 12345, or 123456 (must start with 1,2,3)
```

---

## Deployment

### Render.com Configuration

**Service Type**: Web Service

**Build Command**:

```bash
npm run build:prod
```

**Start Command**:

```bash
npm run start:prod
```

**Environment**: Node 18+

**Environment Variables**: See [Environment Variables](#environment-variables) section

### Build Process

1. `npm run build:prod` runs:

   - `npm install` (root dependencies)
   - `cd frontend && npm install`
   - `cd backend && npm install`
   - `cd frontend && npm run build` (creates `frontend/dist`)
   - `cd backend && npm run build` (creates `backend/build`)

2. `npm run start:prod` runs:

   - `npx puppeteer browsers install chrome` (downloads Chrome for Puppeteer)
   - `node backend/build/index.js` (starts Express server)

3. Express serves:
   - API routes: `/api/gas/*`, `/api/recaptcha/*`
   - Static files: `frontend/dist` for all other routes

### Post-Deployment Checklist

- [ ] Verify all environment variables are set in Render dashboard
- [ ] Test code redemption flow end-to-end
- [ ] Check logs for Puppeteer Chrome installation success
- [ ] Verify email cache populates on startup (check logs: "Email cache contains X entries")
- [ ] Test reCAPTCHA v2 and v3 functionality
- [ ] Confirm CORS whitelist includes production domain
- [ ] Test special email commands (`process@emails.com`, `refreshcache@emails.com`)

---

## Environment Variables

Contact Joe

### Environment Variable Security Notes

- **Never commit `.env`** to version control (already in `.gitignore`)
- **Service account JSON files** are also gitignored (`bw-ae-db-*.json`, `yhg-apis-*.json`)
- **Logs redact sensitive data**: API keys show only first 13 chars, emails are obfuscated
- **Render deployment**: Set env vars in Render dashboard, not in code

---

## Google Apps Script Integration

> **IMPORTANT NOTE**: The Google Apps Script files are located in `frontend/AppsScripts/` for **REFERENCE ONLY**. These files are NOT imported or used by the Node.js backend—they run independently on Google's servers. Do NOT attempt to import or execute these files in the Node.js application.

**Google Apps Script** (GAS) acts as the database layer, managing code inventory and domain assignment via Google Sheets.

### Apps Script Endpoint

**URL**: Stored in `AS_LINK` environment variable
**Method**: POST
**Authentication**: API key in request body

### Request Format

```json
{
  "email": "user@example.com",
  "code": "12345",
  "apiKey": "f54af88b-1774-4cf5-8538-751f23a4e6be",
  "bookType": "physicalCopy",
  "purchasedOrBorrowed": "purchased",
  "libraryState": "California", // optional
  "libraryName": "SF Public Library" // optional
}
```

### Response Format

**Success**:

```json
{
  "success": true,
  "message": "Code redeemed successfully",
  "domain": "https://potential-123456.yourhiddengenius.com",
  "code": 200
}
```

**Failure**:

```json
{
  "success": false,
  "message": "Code already used",
  "code": 400
}
```

### Google Sheets Structure

The Google Sheet (`SPREADSHEET_ID`) should have the following tabs:

#### 1. Master Sheet

**Purpose**: Records all code redemptions
**Columns** (0-indexed):

- [0] Email
- [1] Code
- [2] Book Type
- [3] Purchased/Borrowed
- [4] Library State (optional)
- [5] Library Name (optional)
- [6] Assigned Domain
- [7] Timestamp (used for cache sorting)

#### 2. Code Inventory Sheets

**Purpose**: Track code usage and limits

- Physical Codes
- Digital Codes
- ARC Codes

Each with columns:

- Code
- Usage Count
- Max Uses
- Status (Active/Inactive)

#### 3. Domain Pool Sheet

**Purpose**: Available assessment URLs

- Domain URL
- Status (Available/Assigned)
- Assigned Email (if assigned)

### Apps Script Code

**Location**: `frontend/AppsScripts/` (reference only, not executed by Node.js)

The Google Apps Script project consists of three files:

#### 1. `Code.js` - Main Logic

**Primary Functions**:

- **`doPost(e)`** - Main webhook handler (lines 1-102)

  - Validates API key from backend
  - Routes requests to appropriate processor based on book type
  - Handles special email commands (`process@emails.com` for CSV export)
  - Auto-sorts Master sheet every 100 submissions

- **`processPhysicalBook()`** - Processes physical/ARC codes (lines 104-216)

  - Uses binary search to find code in "Physical" sheet (O(log n) performance)
  - Special codes: `2018`, `100000`, `200000`, `300000`, `10001`, `999999` (rows 2-7)
  - Validates code usage limits (uses < maxUses)
  - Assigns domain from "YSCs" sheet
  - Updates Master sheet and email_csv sheet
  - For purchased books: Records email + domain in Physical sheet

- **`processDigitalBook()`** - Processes digital codes (lines 218-365)
  - **Purchased Path**: Checks "Digital_Purchased" sheet
    - Validates "unlock" cell (E5) is TRUE (max codes not reached)
    - Prevents duplicate codes
    - Appends code, email, domain to sheet
  - **Borrowed Path**: Checks "Digital_Borrowed" sheet
    - Validates "unlock" cell (D5) is TRUE
    - No code validation (uses library code 999999)
    - Appends email, domain to sheet
  - Both paths update Master sheet and email_csv

**Code Routing Logic**:

```javascript
switch (bookType) {
  case "advanceReaderCopy":
  case "physicalCopy":
    return processPhysicalBook(...);
  case "digitalCopy":
    return processDigitalBook(...);
}
```

#### 2. `UtilityFunctions.js` - Helper Functions

- **`checkEmailInSheet(email, sheet)`** - Binary search for email in Master sheet (lines 1-34)

  - Returns existing domain if email found
  - Returns `{success: false, message: "Email not found"}` if new
  - Used by backend for email cache misses

- **`binarySearchSheet(sheet, code, startRow, endRow, codeColumn)`** - Binary search for code (lines 36-54)

  - Searches sorted code column in Physical sheet
  - Returns row number or -1 if not found

- **`sortMasterSheetByEmail()`** - Sorts Master sheet alphabetically by email (lines 56-61)

  - Called every 100 submissions for efficient binary search
  - Sorts ascending by column 1 (Email)

- **`emailCSV()`** - Exports email_csv sheet and emails it (lines 63-90)

  - Triggered by `process@emails.com` special command
  - Sends CSV attachment to `joe@thefutureofagency.com`
  - Clears email_csv sheet after sending

- **`convertSheetToCsv(sheet)`** - Converts sheet to CSV string (lines 92-106)

- **`logToSheet(message)`** - Appends error logs to "error_logging" sheet (lines 108-112)

#### 3. `appscripts.json` - Configuration

```json
{
  "timeZone": "America/New_York",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

**Key Settings**:

- Runs as deploying user (requires Sheets access permissions)
- Accessible anonymously (backend authenticates via API key)
- Uses V8 runtime (modern JavaScript support)

### Google Sheets Structure (Detailed)

#### Sheet: "Master"

**Purpose**: Complete redemption log (sorted by email every 100 entries)

| Column | Name      | Type    | Description                                 |
| ------ | --------- | ------- | ------------------------------------------- |
| A (0)  | Email     | String  | User email (sorted for binary search)       |
| B (1)  | Physical  | Boolean | TRUE if physical/ARC code                   |
| C (2)  | Digital   | Boolean | TRUE if digital code                        |
| D (3)  | Purchased | Boolean | TRUE if purchased                           |
| E (4)  | Borrowed  | Boolean | TRUE if library borrow                      |
| F (5)  | Code      | String  | Redemption code (null for digital borrowed) |
| G (6)  | Domain    | String  | Assigned URL                                |
| H (7)  | Timestamp | Date    | ISO date string (used by backend cache)     |

**Cell J1**: Submission counter (triggers sort at multiples of 100)

#### Sheet: "Physical"

**Purpose**: Physical & ARC code inventory (sorted by code for binary search)

| Column | Name           | Type    | Description                    |
| ------ | -------------- | ------- | ------------------------------ |
| A      | Library Status | Boolean | TRUE if library code           |
| B      | Code           | Number  | Numeric code (sorted)          |
| C      | Uses           | Number  | Current usage count            |
| D      | Max Uses       | Number  | Maximum allowed uses           |
| E      | Still Valid    | Boolean | FALSE if deprecated            |
| F      | Email          | String  | Last redeemer (purchased only) |
| G      | Domain         | String  | Last domain (purchased only)   |

**Special Code Rows** (hardcoded, rows 2-7):

- Row 2: Code `2018`
- Row 3: Code `100000`
- Row 4: Code `200000`
- Row 5: Code `300000`
- Row 6: Code `10001`
- Row 7: Code `999999` (library code)

#### Sheet: "Digital_Purchased"

**Purpose**: Digital purchased code tracking

| Column | Name   | Type   | Description              |
| ------ | ------ | ------ | ------------------------ |
| A      | Code   | String | 7-character alphanumeric |
| B      | Email  | String | Redeemer email           |
| C      | Domain | String | Assigned URL             |

**Cell E5**: "unlock" cell - must be "TRUE" to allow new redemptions (max limit check)

#### Sheet: "Digital_Borrowed"

**Purpose**: Digital library borrow tracking

| Column | Name   | Type   | Description    |
| ------ | ------ | ------ | -------------- |
| A      | Email  | String | Redeemer email |
| B      | Domain | String | Assigned URL   |

**Cell D5**: "unlock" cell - must be "TRUE" to allow new redemptions

#### Sheet: "YSCs" (YouScience Codes)

**Purpose**: Available domain pool

| Column | Name   | Type   | Description                                                      |
| ------ | ------ | ------ | ---------------------------------------------------------------- |
| A      | Status | String | "USED" or blank (available)                                      |
| B      | Domain | String | Full URL (e.g., `https://potential-123456.yourhiddengenius.com`) |

**Domain Assignment**: First available row (where column A ≠ "USED")

#### Sheet: "email_csv"

**Purpose**: Temporary email collection for daily export

| Column | Name  | Type   |
| ------ | ----- | ------ |
| A      | Email | String |

**Lifecycle**: Appended on each redemption, cleared after CSV export

#### Sheet: "error_logging"

**Purpose**: Apps Script error and event logging

| Column | Name      | Type   |
| ------ | --------- | ------ |
| A      | Timestamp | Date   |
| B      | Message   | String |

### Apps Script Deployment

1. Create Google Apps Script project at `script.google.com`
2. Paste code into editor
3. Deploy as Web App:
   - Execute as: Me (your account)
   - Who has access: Anyone (anonymous)
4. Copy deployment URL to `AS_LINK` environment variable
5. Set `API_KEY` to match backend

### Testing Apps Script

```bash
curl -X POST "<AS_LINK>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": null,
    "apiKey": "<API_KEY>",
    "bookType": null,
    "purchasedOrBorrowed": null
  }'
```

Expected response: `{ "success": false, "message": "Email not found in database" }`

---

## API Documentation

### Backend Endpoints

#### POST `/api/gas/:code`

**Description**: Redeem a code and assign assessment domain

**Parameters**:

- `:code` (path) - The redemption code

**Body**:

```json
{
  "email": "user@example.com",
  "bookType": "physicalCopy" | "digitalCopy" | "advanceReaderCopy",
  "purchasedOrBorrowed": "purchased" | "borrowed",
  "libraryState": "California",       // optional, required if borrowed
  "libraryName": "SF Public Library"  // optional, required if borrowed
}
```

**Response** (Success):

```json
{
  "success": true,
  "message": "Code redeemed successfully",
  "domain": "https://potential-123456.yourhiddengenius.com",
  "statusCode": 200
}
```

**Response** (Error):

```json
{
  "success": false,
  "message": "Invalid code format",
  "statusCode": 400
}
```

**File**: `gas.ts:791-861`

---

#### POST `/api/gas/check-email`

**Description**: Check if an email has already been used

**Body**:

```json
{
  "email": "user@example.com"
}
```

**Response** (Used):

```json
{
  "success": true,
  "message": "Used Email",
  "domain": "https://potential-123456.yourhiddengenius.com"
}
```

**Response** (Not Used):

```json
{
  "success": false,
  "message": "Email not found in database"
}
```

**File**: `gas.ts:735-785`

---

#### POST `/api/recaptcha/verify`

**Description**: Verify reCAPTCHA token (v2 or v3)

**Body**:

```json
{
  "token": "03AGdBq24...",
  "version": "v2" | "v3"
}
```

**Response**:

```json
{
  "success": true,
  "score": 0.9 // v3 only
}
```

**File**: `recaptcha.ts`

---

### Error Codes

| Status Code | Message                                            | Meaning                                        |
| ----------- | -------------------------------------------------- | ---------------------------------------------- |
| 200         | Success                                            | Request completed successfully                 |
| 400         | Invalid email format                               | Email failed regex validation                  |
| 400         | Invalid code format                                | Code doesn't match expected pattern            |
| 400         | Invalid input format                               | Library state/name contains invalid characters |
| 400         | Code already used                                  | This code has been redeemed                    |
| 400         | Email already used                                 | Email already has an assigned domain           |
| 400         | Code not found                                     | Code doesn't exist in database                 |
| 400         | Maximum number of codes reached                    | Digital code limit exceeded                    |
| 400         | This code has reached its usage limit              | Code used max times                            |
| 400         | Cannot use a library book code as a purchased book | Invalid book type combination                  |
| 400         | Cannot convert a purchased book to a library book  | Redemption type mismatch                       |
| 404         | No available domains                               | Domain pool exhausted                          |
| 500         | Internal server error                              | Unexpected server error                        |
| 500         | No database connection                             | Google Apps Script unreachable                 |

**File**: `sendStatuses.ts`

---

## Troubleshooting

### Common Issues

#### 1. Puppeteer Chrome Not Found

**Error**: `Error: Could not find Chrome`

**Solution**: Ensure Chrome is installed for Puppeteer

```bash
npx puppeteer browsers install chrome
```

**Render.com**: Chrome path is hardcoded in `puppet.ts:30`. Update if Render changes cache location.

---

#### 2. Email Cache Not Populating

**Error**: `Email cache contains 0 entries after refresh`

**Solutions**:

1. Verify `GOOGLE_APPLICATION_CREDENTIALS` points to valid service account JSON
2. Check service account has Sheets API access
3. Verify `SPREADSHEET_ID` is correct
4. Ensure "Master" sheet exists with data
5. Check date column (index 7) has valid dates

**Manual Refresh**:

```bash
curl -X POST "http://localhost:5000/api/gas/check-email" \
  -H "Content-Type: application/json" \
  -d '{"email": "refreshcache@emails.com"}'
```

---

#### 3. CORS Errors

**Error**: `Access-Control-Allow-Origin` blocked

**Solution**: Add origin to whitelist in `app.ts:16-27`

```typescript
const whitelist: string[] = [
  "https://yourhiddengenius.com",
  "https://www.yourhiddengenius.com",
  "http://localhost:3000",
  // Add your origin here
];
```

---

#### 4. Google Apps Script Timeout

**Error**: `Error querying database` or `Navigation timeout`

**Solutions**:

1. Check Apps Script deployment is published as web app
2. Verify `AS_LINK` environment variable is correct
3. Test Apps Script directly via URL
4. Check Apps Script execution logs in Google Cloud Console
5. Increase timeout in `gas.ts` axios call (currently 60s)

---

#### 5. reCAPTCHA Failing

**Error**: `reCAPTCHA verification failed`

**Solutions**:

1. Verify `VITE_V2_SITE_KEY` and `VITE_V3_SITE_KEY` match frontend
2. Verify `GOOGLE_RECAPTCHA_V2_SECRET` and `GOOGLE_RECAPTCHA_V3_SECRET` match backend
3. Check domain is registered in Google reCAPTCHA console
4. For localhost, ensure `localhost` is in allowed domains

---

#### 6. Code Validation Failing

**Error**: `Invalid code format`

**Debug**:

```javascript
// Test regex patterns in Node.js console
const physicalRegex = new RegExp(process.env.REGEX_PHYSICAL_COPY);
console.log(physicalRegex.test("12345")); // Should be true

const digitalRegex = new RegExp(process.env.REGEX_DIGITAL_COPY);
console.log(digitalRegex.test("abc1234")); // Should be true
console.log(digitalRegex.test("999999")); // Should be true (library)

const arcRegex = new RegExp(process.env.REGEX_ADVANCE_READER_COPY);
console.log(arcRegex.test("12345")); // Should be true
```

**File**: `gas.ts:400-426`, `frontend/src/hooks/inputValiditiy.ts`

---

#### 7. Squarespace Automation Failing

**Error**: `squarespace_submission_failed`

**Solutions**:

1. Check Squarespace form URL is still valid: `puppet.ts:46`
2. Verify email input selector: `input[type="email"]`
3. Check submit button selector: `button[type="submit"]`
4. Review Puppeteer logs for detailed error
5. Test manually in browser to ensure form structure hasn't changed

**Note**: Squarespace automation failure does NOT block user flow—it's logged but the user still receives their domain.

---

### Logging

#### Backend Logs (JSON Format)

All logs use structured JSON for easy parsing:

```json
{
  "email": "user@*****example.com",
  "ev": "email_check_result",
  "result": "Email not found",
  "success": false
}
```

**Key Events**:

- `email_cache_hit` / `email_cache_miss`
- `added_to_queue`
- `processing_queue_head`
- `db_query_success` / `db_query_fail`
- `squarespace_submission_success` / `squarespace_submission_failed`

**Email Obfuscation**: `gas.ts:94-99`, `puppet.ts:11-16`

#### Frontend Logs

```javascript
console.log(response.success, response.message);
```

Enable verbose logging by uncommenting lines in `AppJDB.tsx` and `gas.ts`.

---

### Support Contacts

- **Technical Issues**: [Your contact info]
- **Google Cloud/Sheets**: [GCP admin contact]
- **Squarespace**: [Squarespace admin contact]

---

## License

[Specify license here]

---

## Change Log

### Version 2.0.0 (Current)

- Monorepo architecture with shared TypeScript config
- Puppeteer automation for Squarespace newsletter signup
- Email caching with 24-hour refresh cycle
- Request queue to prevent race conditions
- reCAPTCHA v2 and v3 support
- Library borrow workflow

### Version 1.0.0

- Initial code redemption system
- Google Sheets integration
- Basic form validation
