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
const utils_1 = require("./utils");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const gas = (0, express_1.default)();
gas.use(express_1.default.json());
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.SPREADSHEET_ID || !process.env.AS_LINK) {
    console.error("Missing required environment variables. Check .env file.");
    process.exit(1);
}
// Cache for email check results
const emailCache = {};
let emailCacheCount = 0;
// Helper functions
const authenticateGoogleSheets = () => __awaiter(void 0, void 0, void 0, function* () {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = yield auth.getClient();
    const googleSheets = googleapis_1.google.sheets({ version: "v4", auth: client });
    return googleSheets;
});
const fetchDataFromSheet = (googleSheets, spreadsheetId, range) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values || [];
});
const checkEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    // Check cache first
    if (emailCache[email]) {
        console.log(`Cache hit for email: ${email}`);
        return emailCache[email];
    }
    if (email == "process@emails.com") {
        console.log("processing");
        const data = JSON.stringify({
            email: email,
            code: "123",
            apiKey: process.env.API_KEY,
            bookType: "book type",
        });
        const response = yield axios_1.default.post(process.env.AS_LINK, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        let result;
        if (response) {
            result = { success: true, message: "email CSV processed" };
        }
        else {
            result = { success: false, message: "problem processing CSV" };
        }
        console.log("result", result);
        return result;
    }
    const googleSheets = yield authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    let rows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "Master");
    if (!rows) {
        return { success: false, message: "No data found in the sheet" };
    }
    const emailIndex = rows.findIndex((row) => { var _a; return ((_a = row[0]) === null || _a === void 0 ? void 0 : _a.trim()) === email.trim(); });
    let result;
    if (emailIndex === -1) {
        result = { success: true, message: "continue" };
    }
    else {
        result = { success: true, message: "email has been used", domain: rows[emailIndex][6], code: parseInt(rows[emailIndex][5]) };
    }
    // Cache the result
    emailCache[email] = result;
    emailCacheCount++;
    // Refresh the cache every 1000 email checks
    if (emailCacheCount % 1000 == 0) {
        console.log("Refreshing email cache at count:", emailCacheCount);
        yield refreshEmailCache();
        (0, utils_1.logMemoryUsage)(emailCache);
    }
    return result;
});
const checkCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const googleSheets = yield authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    let rows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "Master");
    if (!rows) {
        return { success: false, message: "No data found in the sheet" };
    }
    const codeIndex = rows.findIndex((row) => { var _a; return ((_a = row[5]) === null || _a === void 0 ? void 0 : _a.trim()) === code; });
    console.log("the code index is", codeIndex);
    let result;
    if (codeIndex === -1) {
        result = { success: true, message: "continue" };
    }
    else {
        result = { success: true, message: "code has been used", domain: rows[codeIndex][6] };
    }
    return result;
});
const refreshEmailCache = () => __awaiter(void 0, void 0, void 0, function* () {
    const googleSheets = yield authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID;
    let rows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "Master");
    if (rows) {
        rows.forEach((row) => {
            const email = row[0];
            emailCache[email] = { success: true, message: "email has been used", domain: row[6], code: row[5] };
        });
        console.log("Email cache refreshed.");
    }
    else {
        console.log("Failed to refresh email cache: No data found in the sheet.");
    }
});
// Set up a timer to refresh the cache every 12 hours
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Refreshing email cache due to 12-hour interval...");
    yield refreshEmailCache();
}), 12 * 60 * 60 * 1000); // 12 hours in milliseconds
const isValidEmail = function (email) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
    return { success: emailRegex, message: emailRegex === true ? "Email passes Regex" : "Email failed Regex" };
};
const isValidCode = function (code) {
    let result = /^[0-9]{4}$|^[0-9]{5}$|^[0-9]{7}$|^[0-9]{10}$/.test(code);
    return { success: result, message: result === true ? "Code passes Regex" : "Code failed Regex" };
};
// Queue implementation
const queue = [];
let processing = false;
let processedRequests = 0;
const processQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    if (queue.length > 0 && !processing) {
        processing = true;
        const { email, code, bookType, res } = queue.shift();
        // console.log(`Processing request for email: ${email}, code: ${code}`);
        yield handleRequest(email, code, bookType, res);
        processing = false;
        processedRequests++;
        // console.log(`Processed requests count: ${processedRequests}`);
        setTimeout(processQueue, 1500); // Process next request after 1.5 seconds
    }
});
const addToQueue = (email, code, bookType, res) => {
    const duplicate = queue.slice(-20).find((item) => item.email === email && item.code === code); // Check last 20 items
    if (!duplicate) {
        queue.push({ email, code, bookType, res });
        // console.log(`Added to queue: email: ${email}, code: ${code}`);
        // console.log(`Current queue length: ${queue.length}`);
        processQueue();
    }
    else {
        console.log(`Duplicate request detected: email: ${email}, code: ${code}`);
        res.status(400).send("Duplicate request detected.");
    }
};
const handleRequest = (email, code, bookType, res) => __awaiter(void 0, void 0, void 0, function* () {
    const emailCheck = isValidEmail(email);
    const codeCheck = isValidCode(code);
    // console.log("data coming in to the handleRequest():", email, code, bookType);
    if (!emailCheck.success) {
        return res.status(500).send("Invalid email address.");
    }
    if (!codeCheck.success) {
        return res.status(500).send("Invalid code format");
    }
    try {
        const emailResult = yield checkEmail(email);
        console.log("emailResult ==", emailResult);
        if (!emailResult.success) {
            return res.status(404).send("Could not retrieve information from Sheet");
        }
        else if (emailResult.message === "email has been used") {
            console.log("email has been used. sending result");
            console.log("email result", emailResult);
            return res.status(200).send(emailResult);
        }
        else if (emailResult.message === "continue") {
            // console.log("email not found! continuing.");
            const data = JSON.stringify({
                email: email,
                code: code,
                apiKey: process.env.API_KEY,
                bookType: bookType,
            });
            const response = yield axios_1.default.post(process.env.AS_LINK, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("Response from GAS", response.data);
            if (!response.data.success) {
                const errorMessageMap = {
                    "Code already used": "This code has been used. Contact us.",
                    "Email already used": "This email has been used. Contact us.",
                    "Code not found": "This code was not found. Contact us.",
                    "No available domains": "No available domains. Contact us.",
                    "Maximum number of codes reached.": "EBooks have surpassed their usage limit. Contact us.",
                    "This code has reached its usage limit.": "Library book has surpassed its usage limit. Contact us.",
                };
                return res.status(400).send(errorMessageMap[response.data.message] || "Unknown DB error.");
            }
            emailCache[email].domain = response.data.domain;
            return res.send(response.data);
        }
    }
    catch (error) {
        console.error("Error during the db call:", error);
        res.status(500).send("An internal server error occurred.");
    }
});
gas.post("/check-email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, codeOrEmail } = req.body;
        console.log(codeOrEmail);
        const cleanEmail = email.trim();
        console.log("checking for", cleanEmail);
        if (codeOrEmail == "code") {
            const validation = isValidCode(cleanEmail);
            if (!validation.success) {
                return res.status(400).send("Invalid code format");
            }
            console.log(validation);
            const result = yield checkCode(cleanEmail);
            if (result.message === "continue") {
                return res.status(404).send("This code was not found. Contact admin");
            }
            else {
                return res.send(result);
            }
        }
        else if (codeOrEmail == "email") {
            const validation = isValidEmail(cleanEmail);
            if (!validation.success) {
                return res.status(400).send("Invalid email format");
            }
            const result = yield checkEmail(cleanEmail);
            if (result.message === "email CSV processed" || result.message === "problem processing CSV") {
                console.log("emails processed...");
                return res.status(200).send(result);
            }
            if (result.message === "continue" && !result.domain) {
                return res.send("No email found");
            }
            else {
                return res.send(result);
            }
        }
    }
    catch (error) {
        console.error("Error", error);
        res.status(500).send("An internal server error occurred.");
    }
}));
gas.post("/:id", (req, res) => {
    const { email, bookType } = req.body;
    const code = req.params.id;
    addToQueue(email, code, bookType, res);
});
exports.default = gas;
//# sourceMappingURL=gas.js.map