import { CheckEmailResult } from "./gas";
/**
 * Calculate the approximate memory usage of the cache object.
 * @param emailCache Cache object containing emails and their respective data.
 * @returns The approximate size of the cache in bytes.
 */
export declare const calculateCacheSize: (emailCache: {
    [email: string]: CheckEmailResult;
}) => number;
/**
 * Log the memory usage of the cache and process to the console.
 * @param emailCache Cache object to measure.
 */
export declare const logMemoryUsage: (emailCache: {
    [email: string]: CheckEmailResult;
}) => void;
