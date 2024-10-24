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
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const validator_1 = __importDefault(require("validator"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const gas = (0, express_1.default)();
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
    if (emailCache.has(email)) {
        console.log(`Cache hit for email: ${email}`);
        return emailCache.get(email);
    }
    // Handle special cases
    if (email === process.env.EMAIL_PROCESSING) {
        console.log("Processing email for CSV export");
        const data = JSON.stringify({
            email: email,
            code: "123",
            apiKey: process.env.API_KEY,
            bookType: "book type",
        });
        try {
            const response = yield axios_1.default.post(process.env.AS_LINK, data, {
                headers: { "Content-Type": "application/json" },
            });
            if (response.data.success == true && response.status === 200) {
                console.log("Email processing successful");
                return sendStatuses_1.customResponse.CSV_SUCCESS;
            }
            else {
                return sendStatuses_1.customResponse.CSV_FAIL;
            }
        }
        catch (error) {
            console.error("Error during CSV processing:", error);
            return sendStatuses_1.customResponse.CSV_FAIL;
        }
    }
    if (email === process.env.CACHE_REFRESH) {
        console.log("Refreshing email cache on request");
        yield refreshEmailCache();
        return sendStatuses_1.customResponse.CACHE_SUCCESS;
    }
    // Assume email is not used if not found in cache
    return newSubmission ? { success: true, message: "Not found email" } : sendStatuses_1.customResponse.NOT_FOUND_EMAIL;
});
/**
 * Refreshes the email cache by fetching the latest entries from Google Sheets.
 */
const refreshEmailCache = () => __awaiter(void 0, void 0, void 0, function* () {
    const googleSheets = yield authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    let rows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "Master");
    if (rows) {
        // Reverse the rows to get the latest entries first
        rows.reverse();
        // Take the first 5,000 entries
        const recentRows = rows.slice(0, 5000);
        emailCache.clear();
        recentRows.forEach((row) => {
            const email = row[0];
            addToEmailCache(email, { success: true, message: "Used email", domain: row[6], code: row[5] });
        });
        console.log("Email cache refreshed.");
    }
    else {
        console.log("Failed to refresh email cache: No data found.");
    }
});
// Preload email cache on startup
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Preloading email cache...");
    yield refreshEmailCache();
}))();
// Refresh email cache every 24 hours
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
 * Validates a code based on the book type using regex patterns from environment variables.
 * @param {string} code - The code to validate.
 * @param {string} bookType - The type of the book.
 * @returns {{ success: boolean; message: string }} The validation result.
 */
const isValidCode = (code, bookType) => {
    let result = false;
    let regexPattern = "";
    console.log("code and bookType:", code, bookType);
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
    const requestKey = `${email}-${code}`;
    if (!pendingRequests.has(requestKey)) {
        queue.push({ email, code, bookType, purchasedOrBorrowed, res });
        pendingRequests.add(requestKey);
        processQueue();
    }
    else {
        console.log(`Duplicate request detected: email: ${email}, code: ${code}`);
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
        const requestKey = `${email}-${code}`;
        try {
            yield handleRequest(email, code, bookType, purchasedOrBorrowed, res);
        }
        finally {
            pendingRequests.delete(requestKey);
            processing = false;
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
    try {
        const emailResult = yield checkEmail(email, true);
        if (email === process.env.EMAIL_PROCESSING || email === process.env.CACHE_REFRESH) {
            return res.send(emailResult);
        }
        if (!emailResult.success && emailResult.message === "No database connection") {
            return res.send(sendStatuses_1.customResponse.NO_DATABASE_CONNECTION);
        }
        else if (emailResult.message === "Used email") {
            return res.send(Object.assign(Object.assign({}, sendStatuses_1.customResponse.USED_EMAIL), { domain: emailResult.domain }));
        }
        else if (emailResult.message === "Not found email") {
            const data = JSON.stringify({
                email: email,
                code: code,
                apiKey: process.env.API_KEY,
                purchasedOrBorrowed: purchasedOrBorrowed,
                bookType: bookType,
            });
            try {
                const response = yield axios_1.default.post(process.env.AS_LINK, data, {
                    headers: { "Content-Type": "application/json" },
                });
                console.log(`GAS Response Data:`, response.data);
                if (response.data && response.data.success) {
                    addToEmailCache(email, {
                        success: true,
                        message: "Used email",
                        email: email,
                        domain: response.data.domain,
                    });
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
                    return res.send(errorMessageMap[response.data.message] || "Unknown DB error.");
                }
            }
            catch (error) {
                console.error("Error during the Axios request:", error);
                return res.send(sendStatuses_1.customResponse.INTERNAL_SERVER_ERROR);
            }
        }
        else {
            return res.send(Object.assign(Object.assign({}, sendStatuses_1.customResponse.UNKNOWN_ERROR), { message: "Unexpected email check result." }));
        }
    }
    catch (error) {
        console.error("Error during the request handling:", error);
        res.send(sendStatuses_1.customResponse.INTERNAL_SERVER_ERROR);
    }
});
/**
 * Endpoint to check if an email has been used.
 */
gas.post("/check-email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const cleanEmail = email.trim();
        console.log("Checking email:", cleanEmail);
        const validation = isValidEmail(cleanEmail);
        if (!validation.success) {
            return res.send(sendStatuses_1.customResponse.INVALID_EMAIL_FORMAT);
        }
        const result = yield checkEmail(cleanEmail, false);
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
        console.error("Error in /check-email:", error);
        res.send(sendStatuses_1.customResponse.INTERNAL_SERVER_ERROR);
    }
}));
/**
 * Endpoint to handle code redemption requests.
 */
gas.post("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, bookType, purchasedOrBorrowed } = req.body;
    const code = req.params.id;
    const emailCheck = isValidEmail(email);
    const codeCheck = isValidCode(code, bookType);
    if (!emailCheck.success) {
        return res.send(sendStatuses_1.customResponse.INVALID_EMAIL_FORMAT);
    }
    if (!codeCheck.success) {
        return res.send(sendStatuses_1.customResponse.INVALID_CODE_FORMAT);
    }
    addToQueue(email, code, bookType, purchasedOrBorrowed, res);
}));
// Error handling middleware
gas.use((err, req, res, next) => {
    console.log(req, next);
    console.error("Unhandled error:", err);
    res.status(500).send({ message: "Internal server error" });
});
exports.default = gas;
//# sourceMappingURL=gas.js.map