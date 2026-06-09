/**
 * @fileoverview Centralized response messages for all API endpoints.
 * Provides consistent status codes and user-friendly error/success messages.
 *
 * @module sendStatuses
 *
 * @description
 * All API responses use the SendStatus interface for consistency.
 * customResponse object contains predefined responses for all scenarios.
 *
 * **Usage**:
 * ```typescript
 * import { customResponse } from './sendStatuses';
 * res.send(customResponse.USED_EMAIL);
 * res.send({ ...customResponse.SUCCESS, domain: assignedDomain });
 * ```
 *
 * **Status Codes**:
 * - 200: Success (SUCCESS, CSV_SUCCESS, CACHE_SUCCESS)
 * - 400: Client errors (INVALID_*, USED_*, CODE_LIMIT, etc.)
 * - 404: Not found (NOT_FOUND_*, NO_DATABASE_CONNECTION)
 * - 500: Server errors (INTERNAL_SERVER_ERROR, UNKNOWN_ERROR)
 */
/**
 * Interface for standardized API responses.
 *
 * @interface SendStatus
 * @property {boolean} success - Indicates if the operation was successful
 * @property {number} statusCode - HTTP status code (200, 400, 404, 500)
 * @property {string} message - Short status message
 * @property {string} details - Detailed user-facing message with instructions
 * @property {string} [domain] - Assigned assessment URL (only for successful redemptions)
 */
export interface SendStatus {
    success: boolean;
    statusCode: number;
    message: string;
    details: string;
    domain?: string;
}
/**
 * Interface defining all possible API response types.
 * Ensures type safety when using customResponse object.
 *
 * @interface SendStatusCodes
 */
export interface SendStatusCodes {
    SUCCESS: SendStatus;
    CSV_SUCCESS: SendStatus;
    CACHE_SUCCESS: SendStatus;
    NO_DATABASE_CONNECTION: SendStatus;
    ERROR: SendStatus;
    INVALID_INPUT_FORMAT: SendStatus;
    INVALID_CODE_FORMAT: SendStatus;
    INVALID_EMAIL_FORMAT: SendStatus;
    USED_CODE: SendStatus;
    USED_EMAIL: SendStatus;
    NOT_FOUND_CODE: SendStatus;
    NOT_FOUND_EMAIL: SendStatus;
    MAXIMUM_DIGITAL_BOOKS: SendStatus;
    NO_DOMAINS: SendStatus;
    CODE_LIMIT: SendStatus;
    CSV_FAIL: SendStatus;
    DUPLICATE_REQUEST_DETECTED: SendStatus;
    LIBRARY_AS_PURCHASED: SendStatus;
    PURCHASED_AS_LIBRARY: SendStatus;
    UNKNOWN_ERROR: SendStatus;
    INTERNAL_SERVER_ERROR: SendStatus;
}
/**
 * Centralized response object with all predefined API responses.
 * Each response includes user-facing details with support email (info@yourhiddengenius.com).
 *
 * @constant {SendStatusCodes} customResponse
 *
 * @description
 * **Success Responses** (200):
 * - SUCCESS: Code redeemed successfully
 * - CSV_SUCCESS: CSV export completed
 * - CACHE_SUCCESS: Email cache refreshed
 *
 * **Client Errors** (400):
 * - INVALID_EMAIL_FORMAT: Email failed regex validation
 * - INVALID_CODE_FORMAT: Code doesn't match expected pattern
 * - INVALID_INPUT_FORMAT: Library state/name contains invalid characters
 * - USED_CODE: Code already redeemed
 * - USED_EMAIL: Email already has assigned domain
 * - DUPLICATE_REQUEST_DETECTED: Same request submitted multiple times
 * - MAXIMUM_DIGITAL_BOOKS: Digital code limit reached
 * - CODE_LIMIT: Code exceeded max uses
 * - LIBRARY_AS_PURCHASED: Can't redeem library code as purchased
 * - PURCHASED_AS_LIBRARY: Can't convert purchased to library borrow
 *
 * **Not Found Errors** (404):
 * - NOT_FOUND_CODE: Code doesn't exist in database
 * - NOT_FOUND_EMAIL: Email not in system
 * - NO_DOMAINS: Domain pool exhausted
 * - NO_DATABASE_CONNECTION: Google Apps Script unreachable
 * - ERROR: Generic error (instructs recovery via email lookup)
 * - CSV_FAIL: CSV export failed
 *
 * **Server Errors** (500):
 * - INTERNAL_SERVER_ERROR: Unexpected server error
 * - UNKNOWN_ERROR: Catch-all for unexpected situations
 */
export declare const customResponse: SendStatusCodes;
