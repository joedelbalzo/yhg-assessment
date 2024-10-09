export interface SendStatus {
    success: boolean;
    statusCode: number;
    message: string;
    details: string;
    domain?: string;
}
export interface SendStatusCodes {
    SUCCESS: SendStatus;
    CSV_SUCCESS: SendStatus;
    CACHE_SUCCESS: SendStatus;
    NO_DATABASE_CONNECTION: SendStatus;
    ERROR: SendStatus;
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
export declare const customResponse: SendStatusCodes;
