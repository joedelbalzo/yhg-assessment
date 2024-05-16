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
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
ccs.use(express_1.default.json());
// console.log("testing!");
const authenticateGoogleSheets = () => __awaiter(void 0, void 0, void 0, function* () {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = yield auth.getClient();
    const googleSheets = googleapis_1.google.sheets({ version: "v4", auth: client });
    return googleSheets;
});
ccs.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("let's do some testing.");
    try {
        const code = req.params.id;
        console.log("submitted code");
        // if (typeof code !== "string" || !/^\d{4}$/.test(code)) {
        //   return res.status(400).send("Invalid code format");
        // }
        const googleSheets = yield authenticateGoogleSheets();
        const spreadsheetId = "1iE0mqWwUtLUPh0NOEMoM1q87Kt7OBzS-OVzSkM1gvl4";
        const range = "UNIQUE CODES";
        const response = yield googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        //finds all rows
        const rows = response.data.values;
        //confirms rows exist
        if (!rows) {
            return res.status(404).send("No data found in the sheet");
        }
        //finds current code
        const codeIndex = rows.findIndex((row) => row[0] === code);
        // const codeUsed: string = rows[codeIndex][1];
        // const codeMax: string = rows[codeIndex][2];
        const codeValid = rows[codeIndex][1];
        //if current code isn't valid, sends a 404
        if (codeValid == "USED") {
            console.log("this code has been used");
            return res.status(404).send("This code is no longer valid.");
        }
        if (codeIndex === -1) {
            return res.status(404).send("Code not found");
        }
        // Increase the use count in the Google Sheet
        // rows[codeIndex][1] = parseInt(rows[codeIndex][1]) + 1;
        rows[codeIndex][1] = "USED";
        yield googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${range}!B${codeIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[rows[codeIndex][1]]],
            },
        });
        res.status(200).send("Code found!");
    }
    catch (error) {
        console.error("Error during Google Sheets API call:", error);
        res.status(500).send("Server error: " + error);
    }
}));
exports.default = ccs;
//# sourceMappingURL=ccs.js.map