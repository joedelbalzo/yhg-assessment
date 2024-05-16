"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const express_1 = __importDefault(require("express"));
const ccs = (0, express_1.default)();
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
ccs.use(express_1.default.json());
console.log("testing!");
const authenticateGoogleSheets = async () => {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = await auth.getClient();
    const googleSheets = googleapis_1.google.sheets({ version: "v4", auth: client });
    return googleSheets;
};
ccs.get("/:id", async (req, res) => {
    try {
        const code = req.params.id;
        if (typeof code !== "string" || !/^\d{4}$/.test(code)) {
            return res.status(400).send("Invalid code format");
        }
        const googleSheets = await authenticateGoogleSheets();
        const spreadsheetId = "1iE0mqWwUtLUPh0NOEMoM1q87Kt7OBzS-OVzSkM1gvl4";
        const range = "CCs_Printing_1";
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        //finds all rows
        const rows = response.data.values;
        console.log(rows);
        //confirms rows exist
        if (!rows) {
            return res.status(404).send("No data found in the sheet");
        }
        //finds current code
        const codeIndex = rows.findIndex((row) => row[0] === code);
        // const codeUsed: string = rows[codeIndex][1];
        // const codeMax: string = rows[codeIndex][2];
        const codeValid = rows[codeIndex][3];
        //if current code isn't valid, sends a 404
        if (codeValid == "FALSE") {
            return res.status(404).send("This code is no longer valid.");
        }
        if (codeIndex === -1) {
            return res.status(404).send("Code not found");
        }
        // Increase the use count in the Google Sheet
        rows[codeIndex][1] = parseInt(rows[codeIndex][1]) + 1;
        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${range}!B${codeIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[rows[codeIndex][1]]],
            },
        });
        res.status(200).send("Code found and incremented");
    }
    catch (error) {
        console.error("Error during Google Sheets API call:", error);
        res.status(500).send("Server error: " + error);
    }
});
exports.default = ccs;
//# sourceMappingURL=ccs.js.map