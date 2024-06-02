import { google, sheets_v4 } from "googleapis";
import express, { Request, Response } from "express";
const ccs = express();
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

ccs.use(express.json());

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.SPREADSHEET_ID) {
  console.error("Missing required environment variables. Check .env file.");
  process.exit(1);
}

//helper functions
const authenticateGoogleSheets = async (): Promise<sheets_v4.Sheets> => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client as any });

  return googleSheets;
};

const fetchDataFromSheet = async (googleSheets: sheets_v4.Sheets, spreadsheetId: string, range: string) => {
  const response = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return response.data.values || [];
};

const updateSheetData = async (
  googleSheets: sheets_v4.Sheets,
  spreadsheetId: string,
  range: string,
  values: Array<Array<string | number>>,
  inputOption: string = "RAW"
) => {
  await googleSheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: inputOption,
    requestBody: { values },
  });
};

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

const emailURLToUser = (email: string, url: string) => {
  //going to use NodeMailer
  //setup guide https://medium.com/coox-tech/send-mail-using-node-js-express-js-with-nodemailer-93f4d62c83ee
  //package details https://www.npmjs.com/package/nodemailer
  console.log(`emailing the address "${email}" the following url: ${url}`);
};

//routes
ccs.post("/hardcover/:id", async (req: Request, res: Response) => {
  console.log("in the express app, hardcover");
  try {
    const code = req.params.id as string;
    const { email } = req.body;
    console.log("submitted code", code, "by", email);
    if (typeof code !== "string" || !/^[0-9]+$/.test(code)) {
      console.log("invalid code format");
      return res.status(400).send("Invalid code format");
    }
    const googleSheets = await authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID!;

    let rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "HCCs");

    // const rows = response.data.values;
    if (!rows) {
      return res.status(404).send("No data found in the sheet");
    }
    const codeIndex = rows.findIndex((row) => row[0] === code);
    if (codeIndex === -1) {
      return res.status(404).send("Code not found");
    }
    const codeValid: string = rows[codeIndex][1];
    if (codeValid == "USED") {
      console.log("this code has been used");
      return res.status(404).send("This code is no longer valid.");
    }

    //OK WE HAVE A VALID CODE
    //get response from other sheet
    let domainsRows = await fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");

    if (!domainsRows) {
      return res.status(404).send("No data found in the YSCs sheet");
    }
    const domain: number = domainsRows.findIndex((row) => row[0] === "");
    if (!domain) {
      return res.status(404).send("No available domain");
    }
    const domainAddress: string = domainsRows[domain][1];

    //update current sheet do call the domain USED

    await updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);

    await updateSheetData(googleSheets, spreadsheetId, `HCCs!B${codeIndex + 1}:D${codeIndex + 1}`, [["USED", email, domainAddress]]);

    emailURLToUser(email, domainAddress);
    res.status(200).send(domainAddress);
  } catch (error) {
    console.error("Error during Google Sheets API call:", error);
    res.status(500).send("An internal server error occurred.");
  }
});

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

ccs.post("/ebook/:id", async (req: Request, res: Response) => {
  console.log("we in ebooks.");
  try {
    const { email } = req.body;
    const code = req.params.id as string;
    console.log("submitted code", code, "by", email);
    if (typeof code !== "string" || !/^[0-9]+$/.test(code)) {
      console.log("invalid code format");
      return res.status(400).send("Invalid code format");
    }
    const googleSheets = await authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID!;

    let rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "EBCs");
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
    } else {
      return res.status(403).send("This code has been used. Contact admin");
    }
    if (emailIndex === -1) {
      console.log("unique email");
    } else {
      return res.status(403).send("This email has been used. Contact admin");
    }

    //code hasn't been used, passes regex. link time.
    //OK WE HAVE A VALID CODE
    //get response from other sheet

    let domainsRows = await fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");
    if (!domainsRows) {
      return res.status(404).send("No data found in the YSCs sheet");
    }
    const domain: number = domainsRows.findIndex((row) => row[0] === "");
    if (!domain) {
      return res.status(404).send("No available domain");
    }
    const domainAddress: string = domainsRows[domain][1];

    await updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);

    let range = "EBCs";
    await googleSheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${range}!A${rows.length}`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[code, "USED", email]],
      },
    });

    emailURLToUser(email, domainAddress);
    res.status(200).send(domainAddress);
  } catch (error) {
    console.error("Error during Google Sheets API call:", error);
    res.status(500).send("An internal server error occurred.");
  }
});

//
//
//
//
// LIBRARY
//
//
//
//

ccs.post("/library/:id", async (req: Request, res: Response) => {
  console.log("in libraries");
  try {
    const code = req.params.id.trim();
    const { email } = req.body;
    console.log("submitted code", code, "by", email);
    if (typeof code !== "string" || !/^[0-9-]+$/.test(code)) {
      console.log("invalid code format");
      return res.status(400).send("Invalid code format");
    }

    const googleSheets = await authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID!;

    const rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "LBCs");

    if (!rows) {
      return res.status(404).send("No data found in the sheet");
    }
    const codeIndex = rows.findIndex((row) => row[0] === code);
    if (codeIndex === -1) {
      return res.status(404).send("Code not found");
    }
    const codeValid: string = rows[codeIndex][3];
    if (codeValid == "FALSE") {
      console.log("this code has been used up.");
      return res.status(404).send("This code is no longer valid.");
    }

    //OK WE HAVE A VALID CODE
    //get response from other sheet
    const domainsRows = await fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");
    if (!domainsRows) {
      return res.status(404).send("No data found in the YSCs sheet");
    }
    const domain: number = domainsRows.findIndex((row) => row[0] === "");
    if (!domain) {
      return res.status(404).send("No available domain");
    }
    const domainAddress: string = domainsRows[domain][1];

    await updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);

    const newUsageValue: number = parseInt(rows[codeIndex][1]) + 1;

    //now, we have to go back to the other sheet and make updates. two calls because columns are separate.
    await updateSheetData(googleSheets, spreadsheetId, `LBCs!B${codeIndex + 1}`, [[newUsageValue]], "USER_ENTERED");

    await updateSheetData(googleSheets, spreadsheetId, `LBCs!${googleSheetsColumnLetters[rows[codeIndex].length]}${codeIndex + 1}`, [
      [email],
    ]);

    emailURLToUser(email, domainAddress);
    res.status(200).send(domainAddress);
  } catch (error) {
    console.error("Error during Google Sheets API call:", error);
    res.status(500).send("An internal server error occurred.");
  }
});

export default ccs;
