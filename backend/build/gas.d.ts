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
