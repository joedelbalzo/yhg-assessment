# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Your Hidden Genius** is a monorepo containing a code redemption system for a book assessment platform. Users redeem codes from physical/digital books or library copies to access a personalized assessment at a unique URL generated through Google Sheets automation.

**Tech Stack:**
- **Frontend**: React 18 + TypeScript, Vite, Framer Motion, Google reCAPTCHA v2/v3
- **Backend**: Node.js + Express + TypeScript, Puppeteer for automation, Google Sheets API
- **Database**: Google Sheets (via Google Apps Script webhook)
- **Deployment**: Render.com (backend + frontend static hosting)

---

## Commands

### Root-Level Commands
```bash
# Install all dependencies (root, frontend, backend)
npm run install-all-three

# Build both frontend and backend
npm run build

# Start development (both servers concurrently)
npm start

# Production build from scratch
npm run build:prod

# Production start (backend serves frontend dist)
npm run start:prod
```

### Backend Commands
```bash
cd backend

# Development mode with hot reload
npm run dev

# Build TypeScript to ./build
npm run build

# Clean build artifacts
npm run clean

# Production start (installs Chrome for Puppeteer, runs built code)
npm start
```

### Frontend Commands
```bash
cd frontend

# Development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve
```

---

## Architecture

### Submission Flow (Critical Path)

1. **User enters code** in frontend form → validates format via regex (physical/digital/ARC codes)
2. **Frontend sends POST** to `/api/gas/:code` with email, bookType, purchasedOrBorrowed
3. **Backend checks email cache** (2500 most recent entries from Google Sheets, refreshed every 24hrs)
4. **If email unused**:
   - Backend POSTs to Google Apps Script webhook (`AS_LINK` env var)
   - Apps Script checks code validity, assigns unique assessment domain from available pool
   - Returns domain to backend → backend caches email → returns success to frontend
5. **If email used**: Returns existing domain from cache
6. **Success**: User receives unique URL (e.g., `potential-123456.yourhiddengenius.com`)
7. **Post-success automation**: Email added to Squarespace queue (5-second delay) → Puppeteer submits email to Squarespace form for newsletter signup

### Key Architectural Patterns

**Email Caching System** (`backend/gas.ts:33-358`)
- Map-based cache with 2500 entry limit (FIFO eviction)
- Preloaded on startup, refreshed every 24 hours
- Special command emails: `process@emails.com` (trigger CSV export), `refreshcache@emails.com` (manual cache refresh)

**Request Queue** (`backend/gas.ts:428-501`)
- FIFO queue with duplicate request detection (`${email}-${code}` key)
- Single-threaded processing to prevent race conditions with Google Sheets
- Delay between requests: 500ms (queue <3) or 1000ms (queue ≥3)

**Puppeteer Automation** (`backend/puppet.ts`)
- Headless Chrome with stealth plugin to bypass bot detection
- Submits emails to Squarespace newsletter form post-signup
- Hardcoded Chrome path for Render.com deployment: `/opt/render/.cache/puppeteer/chrome/linux-133.0.6943.98/chrome-linux64/chrome`
- Email obfuscation in logs: `email.slice(0,5) + '*****' + domain`

**Code Validation** (`backend/gas.ts:400-426`)
- Regex patterns from environment variables:
  - `REGEX_PHYSICAL_COPY`: `^([12349]\d{3}|[12349]\d{5})$`
  - `REGEX_DIGITAL_COPY`: `^(999999|[A-Za-z0-9]{7})$`
  - `REGEX_ADVANCE_READER_COPY`: `^([123]\d{3}|[123]\d{4}|[123]\d{5})$`
- Library borrows use special code `999999` (hardcoded, not validated)

**Google Sheets Integration**
- Service account authentication via JSON keyfile (`GOOGLE_APPLICATION_CREDENTIALS`)
- Spreadsheet ID: `1iE0mqWwUtLUPh0NOEMoM1q87Kt7OBzS-OVzSkM1gvl4`
- Cache refresh reads "Master" sheet, sorts by date column (index 7), takes 2500 most recent

**Security**
- Rate limiting: 1000 requests/15 minutes per IP
- CORS whitelist: `yourhiddengenius.com`, `yhg-code-redemption.onrender.com`, localhost:3000
- Helmet.js with CSP disabled (needed for reCAPTCHA)
- API key verification for Google Apps Script calls (`API_KEY` env var)

---

## Critical Environment Variables

**Must be set** (backend validates on startup):
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account JSON for Sheets API
- `SPREADSHEET_ID`: Google Sheets ID for email cache
- `AS_LINK`: Google Apps Script webhook URL
- `API_KEY`: Shared secret for Apps Script authentication
- `EMAIL_PROCESSING`, `CACHE_REFRESH`: Special command emails
- `REGEX_PHYSICAL_COPY`, `REGEX_DIGITAL_COPY`, `REGEX_ADVANCE_READER_COPY`: Code validation patterns

**Frontend** (Vite env vars):
- `VITE_API_ENV`: `"development"` | `"production"` (determines API base URL)
- `VITE_V2_SITE_KEY`, `VITE_V3_SITE_KEY`: reCAPTCHA public keys
- `VITE_LIBRARY_CODE`: Hardcoded library code (`999999`)

---

## File Structure Notes

**Backend Entry Points:**
- `index.ts` → `app.ts` (Express setup) → routes: `/api/gas/*` (gas.ts), `/api/recaptcha/*` (recaptcha.ts)
- Static frontend served from `../../frontend/dist` (production)

**Frontend State Management:**
- `BookContext.tsx`: Global state via React Context (email, code, bookType, currentContent, etc.)
- `AppJDB.tsx`: Main component, handles submission flow and content transitions
- `contentMap.tsx`: Maps content states to form components (e.g., "enterEmail" → EmailForm)

**Custom Response System:**
- `sendStatuses.ts`: Centralized response objects (success/error messages, status codes)
- All API responses use `SendStatus` interface for consistency

**Frontend Content Flow States:**
```
physicalOrDigital → purchasedOrBorrowed → [enterPhysicalCode | enterDigitalCode | enterARCCode] → enterEmail → success/error
                  ↘ checkEmailAddress (forgot link)
```

---

## Development Workflow

1. **Local Development:**
   - Run `npm start` from root (starts both servers)
   - Frontend: `localhost:5173` (Vite dev server)
   - Backend: `localhost:5000` (Express API)
   - Frontend proxies API calls to backend in dev mode

2. **Building for Production:**
   - `npm run build:prod` (installs deps + builds both)
   - Backend serves frontend static files from `frontend/dist`
   - Single deployment artifact (backend bundle includes frontend)

3. **Deployment (Render.com):**
   - Build command: `npm run build:prod`
   - Start command: `npm run start:prod`
   - Environment variables must be set in Render dashboard
   - Puppeteer requires `npx puppeteer browsers install chrome` (in start script)

---

## Google Apps Script Integration

The backend communicates with a Google Apps Script (GAS) web app via HTTP POST to `AS_LINK`. The GAS manages:
- Code inventory (physical/digital/ARC codes with usage limits)
- Domain assignment (pool of subdomains like `potential-123456.yourhiddengenius.com`)
- Master sheet updates (appends new redemptions with timestamp)
- Response format: `{ success: boolean, message: string, domain?: string, code?: number }`

**Request Payload to GAS:**
```json
{
  "email": "user@example.com",
  "code": "12345",
  "apiKey": "f54af88b-1774-4cf5-8538-751f23a4e6be",
  "bookType": "physicalCopy",
  "purchasedOrBorrowed": "purchased",
  "libraryState": "California",  // optional, for library borrows
  "libraryName": "SF Public Library"  // optional
}
```

**GAS Error Messages** (mapped to frontend responses in `gas.ts:636-645`):
- "Maximum number of codes reached."
- "Code already used"
- "Email already used"
- "Code not found"
- "No available domains"
- "This code has reached its usage limit."
- "Cannot use a library book code as a purchased book"
- "Cannot convert a purchased book to a library book after it has been used."

---

## Testing Considerations

- **Special emails** trigger non-standard behavior (CSV export, cache refresh)
- **Library code validation**: Frontend hardcodes `999999`, backend doesn't validate it
- **Race conditions**: Queue system prevents concurrent Google Sheets writes
- **Cache staleness**: Email cache refreshes every 24 hours; manual refresh available via special email
- **Puppeteer failures**: Logged but don't block user flow (Squarespace submission is async)

---

## Common Pitfalls

1. **Puppeteer Chrome path**: Hardcoded for Render; fails on other platforms without adjustment
2. **CORS errors**: Whitelist doesn't include trailing slash variants consistently (check `app.ts:16-27`)
3. **reCAPTCHA**: V3 executes automatically, V2 requires user interaction (both verified on backend via `/api/recaptcha`)
4. **Env var leakage**: Logs redact email/API key but must be careful with new logging
5. **Library input validation**: `isValidInput` allows only `[A-Za-z' -]+`, fails on numbers/special chars
6. **Frontend/backend book type mismatch**: Ensure `physicalCopy`/`digitalCopy`/`advanceReaderCopy` strings match exactly
