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
export const customResponse: SendStatusCodes = {
  SUCCESS: {
    success: true,
    statusCode: 200,
    message: "Success!",
    details:
      "Success! This is your unique URL to get started with YouScience. Within a few hours, you'll receive an email with some instructions and some tips for what to do with your results. If you navigate from this page without your unique domain, don't worry! You can always come back here and retrieve it with your email address. Remember to relax and have fun!",
    domain: "insert domain url",
  },
  CSV_SUCCESS: { success: true, statusCode: 200, message: "CSV success", details: "CSV has been downloaded.", domain: "" },
  CACHE_SUCCESS: { success: true, statusCode: 200, message: "Cache Refreshed", details: "Email cache has been refreshed.", domain: "" },
  NO_DATABASE_CONNECTION: {
    success: false,
    statusCode: 404,
    message: "No database connection.",
    details:
      "The server has disconnected from the database. Please try again, and if you're still having an issue please email us at info@yourhiddengenius.com and we'll fix it right away! Thank you!",
    domain: "",
  },
  INTERNAL_SERVER_ERROR: {
    success: false,
    statusCode: 500,
    message: "An unexpected error occurred.",
    details:
      "The server has disconnected from the database. Please try again, and if you're still having an issue please email us at info@yourhiddengenius.com and we'll fix it right away! Thank you!",
    domain: "",
  },
  ERROR: {
    success: false,
    statusCode: 404,
    message: "Error.",
    details:
      "You've reached a generic error response. It's likely that your code and email worked, so please go back to the beginning, click 'Signed up, but forgot your unique link? Click here.', and try to recover your domain using your email address. If that doesn't work, please email us at info@yourhiddengenius.com and we'll fix this right away! Thank you!",
    domain: "",
  },

  INVALID_INPUT_FORMAT: {
    success: false,
    statusCode: 404,
    message: "Submitted an invalid input.",
    details:
      "You have an invalid input. Please make sure your code is correct, your email is correct, and if you selected a state and a library that you have input no special characters. If you're having trouble, please email us at info@yourhiddengenius.com. Thank you!",
    domain: "",
  },
  INVALID_CODE_FORMAT: {
    success: false,
    statusCode: 404,
    message: "Submitted an invalid code format.",
    details:
      "Your code's format is incorrect. Please double check that you are only entering numerical digits for your code and no spaces, letters, or other symbols. Thank you!",
    domain: "",
  },
  INVALID_EMAIL_FORMAT: {
    success: false,
    statusCode: 404,
    message: "Submitted an invalid email format.",
    details:
      "Your email format is incorrect. Please go back and confirm that you're entering a standard email@emailprovider.com email address. Please try this again, but if you're still having trouble, please email us at info@yourhiddengenius.com with a photo or screenshot of your receipt and we'll get it straightened out. Thank you!",
    domain: "",
  },
  USED_CODE: {
    success: false,
    statusCode: 409,
    message: "Code already applied.",
    details:
      "This code has already been used. If you are having issues with your YouScience dashboard, please go to https://www.youscience.com/login/ and contact YouScience support. If this is a library book and you're seeing this message, email us at info@yourhiddengenius.com with a photo or screenshot of your receipt or the library sticker on the book and we'll get you straightened out immediately. Thank you!",
    domain: "",
  },
  USED_EMAIL: {
    success: false,
    statusCode: 409,
    message: "Email already used!",
    details: `The unique domain attached to the email address you submitted is above! For any issues with your YouScience dashboard, please go to https://www.youscience.com/login/ and contact YouScience support. Thank you!`,
    domain: "",
  },
  NOT_FOUND_CODE: {
    success: false,
    statusCode: 404,
    message: "Cannot find code.",
    details:
      "That code is either invalid or does not exist in our system. Please double check that you are only entering numerical digits for your code and no spaces, letters, or other symbols. Thank you!",
    domain: "",
  },
  NOT_FOUND_EMAIL: {
    success: false,
    statusCode: 404,
    message: "Cannot find email.",
    details:
      "We don't have that email in our database. Please try a different email address. If you're positive it was that one, please reach out to info@yourhiddengenius.com and include a picture or screenshot of your purchase receipt. Thank you!",
    domain: "",
  },
  MAXIMUM_DIGITAL_BOOKS: {
    success: false,
    statusCode: 404,
    message: "Maximum Digital Books",
    details:
      "We have distributed more unique domains than we have sold copies. This is likely due to outdated sales information not received by our database. Please reach out to info@yourhiddengenius.com and include a picture or screenshot of your purchase receipt. Thank you!",
    domain: "",
  },
  NO_DOMAINS: {
    success: false,
    statusCode: 404,
    message: "No domains remaining.",
    details:
      "Our system shows there are no available tests. That can't be right! Please try again. If you're having trouble, please email us at info@yourhiddengenius.com. Thank you!",
    domain: "",
  },
  CODE_LIMIT: {
    success: false,
    statusCode: 404,
    message: "Code Limit Surpassed",
    details:
      "We limit code usage on library books per the publisher's recommendations. It seems like this library book has been used too many times. Please try this again, but if you're still having trouble, please email us at info@yourhiddengenius.com. Thank you!",
    domain: "",
  },
  CSV_FAIL: {
    success: false,
    statusCode: 404,
    message: "CSV Export Failed",
    details:
      "Check the database for further error messages, but it's likely that there have just been no new emails since this report was last run. Thank you!",
    domain: "",
  },
  DUPLICATE_REQUEST_DETECTED: {
    success: false,
    statusCode: 409,
    message: "Duplicate Request Detected",
    details:
      "Our system detected that this was a duplicated request. Most likely, your initial request was processed, so please go to the  beginning, click 'Signed up, but forgot your unique link? Click here.', and try to recover your domain using your email address. If that doesn't work, please go through the process of redeeming your code again. If you're still having issues, please reach out to info@yourhiddengenius.com, include a picture or screenshot of your purchase receipt, and we'll get back as soon as possible. Thank you!",
    domain: "",
  },
  LIBRARY_AS_PURCHASED: {
    success: false,
    statusCode: 403,
    message: "This book belongs to a Library.",
    details:
      "Our records state that this book belongs to a library and that you attempted to submit your code as a purchase code instead of a library code. Please go back and try again! If you continue to have trouble, please email info@yourhiddengenius.com with a photo or screenshot of your purchase receipt. Thank you!",
    domain: "",
  },
  PURCHASED_AS_LIBRARY: {
    success: false,
    statusCode: 403,
    message: "The owner of this book has already used this code.",
    details:
      "Our records show that this book was purchased and that the owner already used this code. If you borrowed this book from your local library, please email us at info@yourhiddengenius.com with a photo or screenshot of your receipt and/or the library's stamp inside of the book so we can make sure it's corrected in our database. Thank you!",
    domain: "",
  },
  // UNKNOWN_ERROR: {
  //   success: false,
  //   statusCode: 404,
  //   message: "Unknown Error",
  //   details:
  //     "Unknown Error. Please try again. If you're still having issues, please reach out to info@yourhiddengenius.com, include a picture or screenshot of your purchase receipt, and we'll get back as soon as possible.",
  //   domain: "",
  // },
  UNKNOWN_ERROR: {
    success: false,
    statusCode: 404,
    message: "Unknown Error",
    details:
      "Unknown Error. Please try again. If you're still having issues, please reach out to info@yourhiddengenius.com, include a picture or screenshot of your purchase receipt, and we'll get back as soon as possible.",
    domain: "",
  },
};
