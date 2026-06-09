/**
 * @fileoverview Google Apps Script integration and email caching system.
 * Core module for code redemption logic, email validation, and domain assignment.
 *
 * @module gas
 *
 * @description
 * **Architecture**:
 * - Email Cache: Map with 500 most recent entries, refreshed every 24 hours
 * - Request Queue: FIFO queue with duplicate detection (prevents race conditions)
 * - Squarespace Queue: Background automation for newsletter signups (5-second delay)
 * - Binary search optimization: Master sheet sorted every 100 submissions
 *
 * **Main Components**:
 * 1. **Email Caching** (lines 33-358):
 *    - Preloaded on startup from Google Sheets "Master" tab
 *    - Auto-refresh every 24 hours
 *    - Manual refresh via special email: refreshcache@emails.com
 *    - Stores: email, domain, success status
 *
 * 2. **Request Queue** (lines 428-501):
 *    - Single-threaded processing to prevent Google Sheets race conditions
 *    - Duplicate detection via `${email}-${code}` keys
 *    - Delays: 500ms (queue <3) or 1000ms (queue ≥3)
 *
 * 3. **Validation** (lines 375-426):
 *    - Email: validator.js regex
 *    - Code: Environment variable regex patterns by book type
 *    - Library inputs: Letters, spaces, dashes, apostrophes only
 *
 * 4. **Google Apps Script Communication** (lines 123-313, 511-688):
 *    - POST to AS_LINK webhook with API key
 *    - Handles all code/domain assignment logic
 *    - Error mapping to user-friendly messages
 *
 * 5. **Squarespace Integration** (lines 690-728):
 *    - Queue emails after successful signup
 *    - Puppeteer automation in puppet.ts (async, non-blocking)
 *
 * **Special Email Commands**:
 * - `process@emails.com`: Triggers CSV export from Apps Script
 * - `refreshcache@emails.com`: Manually refreshes email cache
 *
 * **Routes**:
 * - `POST /api/gas/check-email` - Check if email exists
 * - `POST /api/gas/:code` - Redeem code and assign domain
 *
 * **Environment Variables**:
 * - Required: GOOGLE_APPLICATION_CREDENTIALS, SPREADSHEET_ID, AS_LINK, API_KEY
 * - Regex patterns: REGEX_PHYSICAL_COPY, REGEX_DIGITAL_COPY, REGEX_ADVANCE_READER_COPY
 * - Special emails: EMAIL_PROCESSING, CACHE_REFRESH
 */
declare const gas: import("express-serve-static-core").Express;
declare const emailCache: Map<string, CheckEmailResult>;
/**
 * Interface representing the result of an email check.
 */
export interface CheckEmailResult {
    success: boolean;
    message: string;
    domain?: string;
    code?: number;
    email?: string;
    statusCode?: number;
    details?: string;
    error?: string;
}
/**
 * Validates a state or library input string.
 *
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is valid, false otherwise.
 */
export declare const isValidInput: (input: string) => boolean;
/**
 * Handles a successful signup by adding email to the Squarespace queue.
 * This is called just before sending a response to the user.
 * @param {string} email - The user's email.
 */
export declare const handleSuccessfulSignup: (email: string) => void;
/**
 * Retrieves the next email from the queue.
 * If queue is empty, returns `null`.
 */
export declare const getNextSquarespaceEmail: () => string | null;
export { emailCache, gas };
