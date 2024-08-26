declare const gas: import("express-serve-static-core").Express;
export interface CheckEmailResult {
    success: boolean;
    message: string;
    domain?: string;
    code?: number;
    error?: string;
}
export default gas;
