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
export { emailCache, gas };
