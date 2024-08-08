declare const gas: import("express-serve-static-core").Express;
export interface CheckEmailResult {
    success: boolean;
    message: string;
    domain?: string;
    code?: number;
}
export default gas;
