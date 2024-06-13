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
const googleapis_1 = require("googleapis");
const express_1 = __importDefault(require("express"));
const ccs = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// import { sendEmail } from "./email";
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
ccs.use(express_1.default.json());
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.SPREADSHEET_ID) {
    console.error("Missing required environment variables. Check .env file.");
    process.exit(1);
}
//helper functions
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
const updateSheetData = (googleSheets_1, spreadsheetId_1, range_1, values_1, ...args_1) => __awaiter(void 0, [googleSheets_1, spreadsheetId_1, range_1, values_1, ...args_1], void 0, function* (googleSheets, spreadsheetId, range, values, inputOption = "RAW") {
    yield googleSheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: inputOption,
        requestBody: { values },
    });
});
const googleSheetsColumnLetters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "AA",
    "AB",
    "AC",
];
//routes
ccs.post("/hardcover/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in the express app, hardcover");
    try {
        const code = req.params.id;
        const { email } = req.body;
        console.log("submitted code", code, "by", email);
        if (typeof code !== "string" || !/^[0-9]+$/.test(code)) {
            console.log("invalid code format");
            return res.status(400).send("Invalid code format");
        }
        const googleSheets = yield authenticateGoogleSheets();
        const spreadsheetId = process.env.SPREADSHEET_ID;
        let rows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "HCCs");
        // const rows = response.data.values;
        if (!rows) {
            return res.status(404).send("No data found in the sheet");
        }
        const codeIndex = rows.findIndex((row) => row[0] === code);
        if (codeIndex === -1) {
            return res.status(404).send("Code not found");
        }
        const codeValid = rows[codeIndex][1];
        if (codeValid == "USED") {
            console.log("this code has been used");
            return res.status(404).send("This code is no longer valid.");
        }
        //OK WE HAVE A VALID CODE
        //get response from other sheet
        let domainsRows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");
        if (!domainsRows) {
            return res.status(404).send("No data found in the YSCs sheet");
        }
        const domain = domainsRows.findIndex((row) => row[0] === "");
        if (!domain) {
            return res.status(404).send("No available domain");
        }
        const domainAddress = domainsRows[domain][1];
        //update current sheet do call the domain USED
        yield updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);
        yield updateSheetData(googleSheets, spreadsheetId, `HCCs!B${codeIndex + 1}:D${codeIndex + 1}`, [["USED", email, domainAddress]]);
        // sendEmail(email, domainAddress);
        res.status(200).send(domainAddress);
    }
    catch (error) {
        console.error("Error during Google Sheets API call:", error);
        res.status(500).send("An internal server error occurred.");
    }
}));
//
//
//
//
// E BOOKS
//
//
//
//
//RECEIPTS TO MATCH amazon, bluefire reader, nook, kobo,reMarkable?
ccs.post("/ebook/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("we in ebooks.");
    try {
        const { email } = req.body;
        const code = req.params.id;
        console.log("submitted code", code, "by", email);
        if (typeof code !== "string" || !/^[0-9]+$/.test(code)) {
            console.log("invalid code format");
            return res.status(400).send("Invalid code format");
        }
        const googleSheets = yield authenticateGoogleSheets();
        const spreadsheetId = process.env.SPREADSHEET_ID;
        let rows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "EBCs");
        if (!rows) {
            return res.status(404).send("No data found in the sheet");
        }
        if (rows[0][7] == "STOP") {
            return res.status(403).send("Too many codes used. Contact admin");
        }
        //finds if current code exists
        const codeIndex = rows.findIndex((row) => row[0] === code);
        const emailIndex = rows.findIndex((row) => row[2] === email);
        if (codeIndex === -1) {
            console.log("unique code");
        }
        else {
            return res.status(403).send("This code has been used. Contact admin");
        }
        if (emailIndex === -1) {
            console.log("unique email");
        }
        else {
            return res.status(403).send("This email has been used. Contact admin");
        }
        //code hasn't been used, passes regex. link time.
        //OK WE HAVE A VALID CODE
        //get response from other sheet
        let domainsRows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");
        if (!domainsRows) {
            return res.status(404).send("No data found in the YSCs sheet");
        }
        const domain = domainsRows.findIndex((row) => row[0] === "");
        if (!domain) {
            return res.status(404).send("No available domain");
        }
        const domainAddress = domainsRows[domain][1];
        yield updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);
        let range = "EBCs";
        yield googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${range}!A${rows.length}`,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [[code, "USED", email]],
            },
        });
        // sendEmail(email, domainAddress);
        res.status(200).send(domainAddress);
    }
    catch (error) {
        console.error("Error during Google Sheets API call:", error);
        res.status(500).send("An internal server error occurred.");
    }
}));
//
//
//
//
// LIBRARY
//
//
//
//
ccs.post("/library/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in libraries");
    try {
        const code = req.params.id.trim();
        const { email } = req.body;
        console.log("submitted code", code, "by", email);
        if (typeof code !== "string" || !/^[0-9-]+$/.test(code)) {
            console.log("invalid code format");
            return res.status(400).send("Invalid code format");
        }
        const googleSheets = yield authenticateGoogleSheets();
        const spreadsheetId = process.env.SPREADSHEET_ID;
        const rows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "LBCs");
        if (!rows) {
            return res.status(404).send("No data found in the sheet");
        }
        const codeIndex = rows.findIndex((row) => row[0] === code);
        if (codeIndex === -1) {
            return res.status(404).send("Code not found");
        }
        const codeValid = rows[codeIndex][3];
        if (codeValid == "FALSE") {
            console.log("this code has been used up.");
            return res.status(404).send("This code is no longer valid.");
        }
        //OK WE HAVE A VALID CODE
        //get response from other sheet
        const domainsRows = yield fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");
        if (!domainsRows) {
            return res.status(404).send("No data found in the YSCs sheet");
        }
        const domain = domainsRows.findIndex((row) => row[0] === "");
        if (!domain) {
            return res.status(404).send("No available domain");
        }
        const domainAddress = domainsRows[domain][1];
        yield updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);
        const newUsageValue = parseInt(rows[codeIndex][1]) + 1;
        //now, we have to go back to the other sheet and make updates. two calls because columns are separate.
        yield updateSheetData(googleSheets, spreadsheetId, `LBCs!B${codeIndex + 1}`, [[newUsageValue]], "USER_ENTERED");
        yield updateSheetData(googleSheets, spreadsheetId, `LBCs!${googleSheetsColumnLetters[rows[codeIndex].length]}${codeIndex + 1}`, [
            [email],
        ]);
        // sendEmail(email, domainAddress);
        res.status(200).send(domainAddress);
    }
    catch (error) {
        console.error("Error during Google Sheets API call:", error);
        res.status(500).send("An internal server error occurred.");
    }
}));
exports.default = ccs;
//# sourceMappingURL=ccs.js.map