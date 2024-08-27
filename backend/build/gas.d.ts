import { Response } from "express";
declare const gas: import("express-serve-static-core").Express;
export interface CheckEmailResult {
    success: boolean;
    message: string;
    domain?: string;
    code?: number;
    error?: string;
    email?: string;
}
export declare const errorHandler: (err: Error, res: Response) => void;
export default gas;
