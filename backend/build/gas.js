"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gas = exports.emailCache = exports.isValidInput = void 0;
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const validator_1 = __importDefault(require("validator"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const gas = (0, express_1.default)();
exports.gas = gas;
gas.use(express_1.default.json());
const sendStatuses_1 = require("./sendStatuses");
const requiredVars = [
    "GOOGLE_APPLICATION_CREDENTIALS",
    "SPREADSHEET_ID",
    "AS_LINK",
    "EMAIL_PROCESSING",
    "CACHE_REFRESH",
    "API_KEY",
    "REGEX_PHYSICAL_COPY",
    "REGEX_DIGITAL_COPY",
    "REGEX_ADVANCE_READER_COPY",
];
const missingVars = requiredVars.filter((v) => !process.env[v]);
if (missingVars.length) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}. Check .env file.`);
    process.exit(1);
}
const emailCache = new Map();
exports.emailCache = emailCache;
/**
 * Authenticates with Google Sheets API using service account credentials.
 * @returns {Promise<sheets_v4.Sheets>} A promise that resolves to the authenticated Google Sheets client.
 */
const authenticateGoogleSheets = () => __awaiter(void 0, void 0, void 0, function* () {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = yield auth.getClient();
    const googleSheets = googleapis_1.google.sheets({ version: "v4", auth: client });
    return googleSheets;
});
/**
 * Fetches data from a specified range in a Google Sheet.
 * @param {sheets_v4.Sheets} googleSheets - The authenticated Google Sheets client.
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {string} range - The cell range to fetch data from.
 * @returns {Promise<any[][]>} A promise that resolves to the data fetched from the sheet.
 */
const fetchDataFromSheet = (googleSheets, spreadsheetId, range) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values || [];
});
/**
 * Obfuscates email for the sake of extensive error logging
 * @param {string} email - The email address to cache.
 */
function obfuscatedEmail(email) {
    if (!email || typeof email !== "string")
        return "invalid_email";
    if (!email.includes("@"))
        return email;
    if (email.length < 4)
        return email;
    return `${email.slice(0, 4)}***@${email.split('@')[1]}`;
}
/**
 * Adds an email and its result to the cache.
 * Limits the cache size to 5000 entries.
 * @param {string} email - The email address to cache.
 * @param {CheckEmailResult} result - The result of checking the email.
 */
const addToEmailCache = (email, result) => {
    emailCache.set(email, result);
    if (emailCache.size > 5000) {
        const oldestKey = emailCache.keys().next().value;
        if (oldestKey !== undefined) {
            emailCache.delete(oldestKey);
        }
    }
};
/**
 * Checks if an email has been used or is a special command.
 * @param {string} email - The email address to check.
 * @param {boolean} newSubmission - Indicates if it's a new submission.
 * @returns {Promise<CheckEmailResult>} The result of the email check.
 */
const checkEmail = (email, newSubmission) => __awaiter(void 0, void 0, void 0, function* () {
    const obEmail = obfuscatedEmail(email);
    if (emailCache.has(email)) {
        console.log(JSON.stringify({
            email: obEmail,
            ev: "email_cache_hit",
            time: new Date().toLocaleString(),
        }));
        return emailCache.get(email);
    }
    if (email === process.env.EMAIL_PROCESSING) {
        console.log(JSON.stringify({
            email: obEmail,
            ev: "email_processing_request",
            time: new Date().toLocaleString(),
        }));
        const data = JSON.stringify({
            email,
            code: "123",
            apiKey: process.env.API_KEY,
            bookType: "book type",
        });
        try {
            const r = yield axios_1.default.post(process.env.AS_LINK, data, { headers: { "Content-Type": "application/json" } });
            if (r.data.success && r.status === 200) {
                console.log(JSON.stringify({
                    email: obEmail,
                    ev: "csv_success",
                    time: new Date().toLocaleString(),
                }));
                return sendStatuses_1.customResponse.CSV_SUCCESS;
            }
            else {
                console.log(JSON.stringify({
                    email: obEmail,
                    ev: "csv_fail",
                    time: new Date().toLocaleString(),
                }));
                return sendStatuses_1.customResponse.CSV_FAIL;
            }
        }
        catch (_a) {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "csv_fail",
                time: new Date().toLocaleString(),
            }));
            return sendStatuses_1.customResponse.CSV_FAIL;
        }
    }
    if (email === process.env.CACHE_REFRESH) {
        console.log(JSON.stringify({
            email: obEmail,
            ev: "cache_refresh",
            time: new Date().toLocaleString(),
        }));
        yield refreshEmailCache();
        return sendStatuses_1.customResponse.CACHE_SUCCESS;
    }
    console.log(JSON.stringify({
        email: obEmail,
        ev: "email_cache_miss",
        time: new Date().toLocaleString(),
    }));
    console.log(JSON.stringify({
        email: obEmail,
        ev: "new_submission_check",
        newSubmission,
        time: new Date().toLocaleString(),
    }));
    const requestData = JSON.stringify({
        email: email,
        code: null,
        apiKey: process.env.API_KEY,
        purchasedOrBorrowed: null,
        bookType: null,
    });
    let gasResult = null;
    try {
        const r = yield axios_1.default.post(process.env.AS_LINK, requestData, { headers: { "Content-Type": "application/json" } });
        if (r.data.success) {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "db_query_success",
                time: new Date().toLocaleString(),
            }));
            addToEmailCache(email, r.data);
            gasResult = r.data;
        }
        else if (!r.data.success && r.data.message === "Email not found in database" && newSubmission) {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "email_not_found",
                time: new Date().toLocaleString(),
            }));
            gasResult = { success: false, message: "Email not found in database" };
        }
        else if (r.data.message === "Invalid API key") {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "invalid_api_key",
                time: new Date().toLocaleString(),
            }));
            gasResult = { success: false, message: "Invalid API key" };
        }
        else {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "unknown_db_error",
                message: r.data.message || "Unknown error from GAS",
                time: new Date().toLocaleString(),
            }));
            gasResult = { success: false, message: r.data.message || "Unknown error from GAS" };
        }
    }
    catch (_b) {
        console.log(JSON.stringify({
            email: obEmail,
            ev: "db_query_fail",
            time: new Date().toLocaleString(),
        }));
        gasResult = { success: false, message: "Error querying database" };
    }
    if (gasResult) {
        return gasResult;
    }
    console.log(JSON.stringify({
        email: obEmail,
        ev: "email_not_found_final",
        time: new Date().toLocaleString(),
    }));
    return sendStatuses_1.customResponse.NOT_FOUND_EMAIL;
});
/**
 * Refreshes the email cache by fetching the latest entries from Google Sheets.
 */
const refreshEmailCache = () => __awaiter(void 0, void 0, void 0, function* () {
    const googleSheets = yield authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    // Fetch all rows from the "Master" sheet
    const rows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "Master");
    if (rows.length > 1) {
        const header = rows.shift();
        if (!header) {
            console.error("No header row found. Skipping cache refresh.");
            return;
        }
        rows.sort((a, b) => {
            const dateA = new Date(a[7]);
            const dateB = new Date(b[7]);
            return dateB.getTime() - dateA.getTime();
        });
        const recentRows = rows.slice(0, 2500);
        emailCache.clear();
        recentRows.forEach((row) => {
            var _a;
            const email = (_a = row[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            if (email) {
                emailCache.set(email, {
                    success: true,
                    message: "Used Email",
                    domain: row[6],
                    code: row[5],
                });
            }
        });
        console.log(`Email cache contains ${emailCache.size} entries after refresh.`);
    }
    else {
        console.error("No rows found in the Master sheet.");
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Preloading email cache...");
    yield refreshEmailCache();
}))();
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Refreshing email cache due to 24-hour interval...");
    yield refreshEmailCache();
}), 24 * 60 * 60 * 1000);
/**
 * Validates an email address.
 * @param {string} email - The email address to validate.
 * @returns {{ success: boolean; message: string }} The validation result.
 */
const isValidEmail = (email) => {
    const result = validator_1.default.isEmail(email);
    return {
        success: result,
        message: result ? "Email passes Regex" : "Email failed Regex",
    };
};
/**
 * Validates a state or library input string.
 *
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is valid, false otherwise.
 */
const isValidInput = (input) => {
    const inputRegex = /^[A-Za-z' -]+$/; // Allows only letters, spaces, dashes, and apostrophes
    return inputRegex.test(input.trim());
};
exports.isValidInput = isValidInput;
/**
 * Validates a code based on the book type using regex patterns from environment variables.
 * @param {string} code - The code to validate.
 * @param {string} bookType - The type of the book.
 * @returns {{ success: boolean; message: string }} The validation result.
 */
const isValidCode = (code, bookType) => {
    let result = false;
    let regexPattern = "";
    // console.log("code and bookType:", code, bookType);
    switch (bookType) {
        case "physicalCopy":
            regexPattern = process.env.REGEX_PHYSICAL_COPY || "";
            break;
        case "digitalCopy":
            regexPattern = process.env.REGEX_DIGITAL_COPY || "";
            break;
        case "advanceReaderCopy":
            regexPattern = process.env.REGEX_ADVANCE_READER_COPY || "";
            break;
        default:
            result = false;
    }
    if (regexPattern) {
        const regex = new RegExp(regexPattern);
        result = regex.test(code);
    }
    return {
        success: result,
        message: result ? "Code passes validation" : "Invalid code format",
    };
};
const queue = [];
let processing = false;
const pendingRequests = new Set();
/**
 * Adds a request to the processing queue.
 * @param {string} email - The email address.
 * @param {string} code - The code to redeem.
 * @param {string} bookType - The type of the book.
 * @param {string} purchasedOrBorrowed - Indicates if the book was purchased or borrowed.
 * @param {Response} res - The Express response object.
 */
const addToQueue = (email, code, bookType, purchasedOrBorrowed, res) => {
    const obEmail = obfuscatedEmail(email);
    console.log(JSON.stringify({
        email: obEmail,
        ev: "added_to_queue",
        time: new Date().toLocaleString(),
    }));
    const requestKey = `${email}-${code}`;
    if (!pendingRequests.has(requestKey)) {
        queue.push({ email, code, bookType, purchasedOrBorrowed, res });
        pendingRequests.add(requestKey);
        processQueue();
        console.log(JSON.stringify({
            email: obEmail,
            ev: "leaving_queue",
            time: new Date().toLocaleString(),
        }));
    }
    else {
        console.log(JSON.stringify({
            email: obEmail,
            ev: "duplicate_request",
            time: new Date().toLocaleString(),
        }));
        res.send(sendStatuses_1.customResponse.DUPLICATE_REQUEST_DETECTED);
    }
};
/**
 * Processes requests in the queue one at a time.
 */
const processQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    if (queue.length > 0 && !processing) {
        processing = true;
        const { email, code, bookType, purchasedOrBorrowed, res } = queue.shift();
        const obEmail = obfuscatedEmail(email);
        console.log(JSON.stringify({
            email: obEmail,
            ev: "processing_queue_head",
            time: new Date().toLocaleString(),
        }));
        const requestKey = `${email}-${code}`;
        try {
            yield handleRequest(email, code, bookType, purchasedOrBorrowed, res);
        }
        finally {
            pendingRequests.delete(requestKey);
            processing = false;
            console.log(JSON.stringify({
                email: obEmail,
                ev: "finished_queue_processing",
                time: new Date().toLocaleString(),
            }));
            const delay = queue.length < 3 ? 500 : 1000;
            setTimeout(processQueue, delay);
        }
    }
});
/**
 * Handles individual requests from the queue.
 * @param {string} email - The email address.
 * @param {string} code - The code to redeem.
 * @param {string} bookType - The type of the book.
 * @param {string} purchasedOrBorrowed - Indicates if the book was purchased or borrowed.
 * @param {Response} res - The Express response object.
 */
const handleRequest = (email, code, bookType, purchasedOrBorrowed, res) => __awaiter(void 0, void 0, void 0, function* () {
    const obEmail = obfuscatedEmail(email); // Obfuscate email for logs
    console.log(JSON.stringify({
        email: obEmail,
        ev: "handle_request_start",
        code,
        bookType,
        purchasedOrBorrowed,
        time: new Date().toLocaleString(),
    }));
    try {
        const emailResult = yield checkEmail(email, true);
        console.log(JSON.stringify({
            email: obEmail,
            ev: "email_check_result",
            result: emailResult.message,
            success: emailResult.success,
            time: new Date().toLocaleString(),
        }));
        if (email === process.env.EMAIL_PROCESSING || email === process.env.CACHE_REFRESH) {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "special_email_case",
                time: new Date().toLocaleString(),
            }));
            return res.send(emailResult);
        }
        if (!emailResult.success && emailResult.message === "No database connection") {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "no_database_connection",
                time: new Date().toLocaleString(),
            }));
            return res.send(sendStatuses_1.customResponse.NO_DATABASE_CONNECTION);
        }
        if (emailResult.message === "Used Email") {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "used_email",
                domain: emailResult.domain,
                time: new Date().toLocaleString(),
            }));
            return res.send(Object.assign(Object.assign({}, sendStatuses_1.customResponse.USED_EMAIL), { domain: emailResult.domain }));
        }
        if (emailResult.message === "Not found email" || emailResult.message === "Email not found in database") {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "email_not_found",
                time: new Date().toLocaleString(),
            }));
            const data = JSON.stringify({
                email,
                code,
                apiKey: process.env.API_KEY,
                purchasedOrBorrowed,
                bookType,
            });
            try {
                const response = yield axios_1.default.post(process.env.AS_LINK, data, {
                    headers: { "Content-Type": "application/json" },
                });
                console.log(JSON.stringify({
                    email: obEmail,
                    ev: "gas_response",
                    response: response.data.message,
                    success: response.data.success,
                    time: new Date().toLocaleString(),
                }));
                if (response.data && response.data.success) {
                    addToEmailCache(email, {
                        success: true,
                        message: "Used Email",
                        email,
                        domain: response.data.domain,
                    });
                    console.log(JSON.stringify({
                        email: obEmail,
                        ev: "cache_update_success",
                        domain: response.data.domain
                            ? `${response.data.domain.slice(0, 20)}***${response.data.domain.slice(-5)}`
                            : "unknown",
                        time: new Date().toLocaleString(),
                    }));
                    return res.send(response.data);
                }
                else {
                    const errorMessageMap = {
                        "Maximum number of codes reached.": sendStatuses_1.customResponse.MAXIMUM_DIGITAL_BOOKS,
                        "Code already used": sendStatuses_1.customResponse.USED_CODE,
                        "Email already used": sendStatuses_1.customResponse.USED_EMAIL,
                        "Code not found": sendStatuses_1.customResponse.NOT_FOUND_CODE,
                        "No available domains": sendStatuses_1.customResponse.NO_DOMAINS,
                        "This code has reached its usage limit.": sendStatuses_1.customResponse.CODE_LIMIT,
                        "Cannot use a library book code as a purchased book": sendStatuses_1.customResponse.LIBRARY_AS_PURCHASED,
                        "Cannot convert a purchased book to a library book after it has been used.": sendStatuses_1.customResponse.PURCHASED_AS_LIBRARY,
                    };
                    console.log(JSON.stringify({
                        email: obEmail,
                        ev: "error_from_gas",
                        message: response.data.message,
                        time: new Date().toLocaleString(),
                    }));
                    return res.send(errorMessageMap[response.data.message] || "Unknown DB error.");
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(JSON.stringify({
                    email: obEmail,
                    ev: "handle_request_error",
                    error: errorMessage,
                    time: new Date().toLocaleString(),
                }));
                return res.send(sendStatuses_1.customResponse.INTERNAL_SERVER_ERROR);
            }
        }
        console.log(JSON.stringify({
            email: obEmail,
            ev: "unknown_error",
            time: new Date().toLocaleString(),
        }));
        return res.send(Object.assign(Object.assign({}, sendStatuses_1.customResponse.UNKNOWN_ERROR), { message: "Unexpected email check result." }));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(JSON.stringify({
            email: obEmail,
            ev: "handle_request_error",
            error: errorMessage,
            time: new Date().toLocaleString(),
        }));
        res.send(sendStatuses_1.customResponse.INTERNAL_SERVER_ERROR);
    }
});
/**
 * Endpoint to check if an email has been used.
 */
gas.post("/check-email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const obEmail = obfuscatedEmail(email); // Obfuscate email for logs
        console.log(JSON.stringify({
            email: obEmail,
            ev: "check_email_request",
            time: new Date().toLocaleString(),
        }));
        const cleanEmail = email.trim();
        const validation = isValidEmail(cleanEmail);
        if (!validation.success) {
            console.log(JSON.stringify({
                email: obEmail,
                ev: "invalid_email_format",
                time: new Date().toLocaleString(),
            }));
            return res.send(sendStatuses_1.customResponse.INVALID_EMAIL_FORMAT);
        }
        const result = yield checkEmail(cleanEmail, false);
        console.log(JSON.stringify({
            email: obEmail,
            ev: "check_email_result",
            result: result.message,
            time: new Date().toLocaleString(),
        }));
        if (result.message === "email not found" && !result.domain) {
            return res.send(result.message);
        }
        else if (result.message === "csv fail") {
            return res.send(result.message);
        }
        else {
            return res.send(result);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(JSON.stringify({
            ev: "check_email_error",
            error: errorMessage,
            time: new Date().toLocaleString(),
        }));
        res.send(sendStatuses_1.customResponse.INTERNAL_SERVER_ERROR);
    }
}));
/**
 * Endpoint to handle code redemption requests.
 */
gas.post("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, bookType, purchasedOrBorrowed, libraryState, libraryName } = req.body;
    const code = req.params.id;
    // Full log with obfuscated email
    const obEmail = obfuscatedEmail(email);
    console.log(JSON.stringify({
        email: obEmail,
        ev: "request_received",
        bookType,
        purchasedOrBorrowed,
        libraryState,
        libraryName,
        code,
        time: new Date().toLocaleString(),
    }));
    if (libraryState) {
        console.log("Library State:", libraryState);
    }
    if (libraryName) {
        console.log("Library Name:", libraryName);
    }
    const emailCheck = isValidEmail(email);
    const codeCheck = isValidCode(code, bookType);
    const libraryStateCheck = libraryState ? (0, exports.isValidInput)(libraryState) : "";
    const libraryNameCheck = libraryName ? (0, exports.isValidInput)(libraryName) : "";
    if (libraryName && libraryState && (!libraryStateCheck || !libraryNameCheck)) {
        return res.send(sendStatuses_1.customResponse.INVALID_INPUT_FORMAT);
    }
    if (!emailCheck.success) {
        return res.send(sendStatuses_1.customResponse.INVALID_EMAIL_FORMAT);
    }
    if (!codeCheck.success) {
        return res.send(sendStatuses_1.customResponse.INVALID_CODE_FORMAT);
    }
    addToQueue(email, code, bookType, purchasedOrBorrowed, res);
    console.log(JSON.stringify({
        email: obEmail,
        ev: "request_made_and_added_to_queue",
        time: new Date().toLocaleString(),
    }));
}));
gas.use((err, req, res, next) => {
    console.log(req, next);
    console.error("Unhandled error:", err);
    res.status(500).send({ message: "Internal server error" });
});
//# sourceMappingURL=gas.js.map