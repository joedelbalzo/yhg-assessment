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
export { emailCache, gas };
