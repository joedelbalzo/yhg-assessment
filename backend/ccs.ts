import { google } from "googleapis";
import express, { Request, Response } from "express";
const ccs = express();
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

ccs.use(express.json());

// console.log("testing!");

const authenticateGoogleSheets = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client as any });

  return googleSheets;
};

ccs.get("/hardcover/:id", async (req: Request, res: Response) => {
  try {
    const code = req.params.id as string;
    console.log("submitted code");
    // if (typeof code !== "string" || !/^\d{4}$/.test(code)) {
    //   return res.status(400).send("Invalid code format");
    // }
    const googleSheets = await authenticateGoogleSheets();
    const spreadsheetId = "1iE0mqWwUtLUPh0NOEMoM1q87Kt7OBzS-OVzSkM1gvl4";
    const range = "UNIQUE CODES";
    const response = await googleSheets.spreadsheets.values.get({
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
    const codeValid: string = rows[codeIndex][1];

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

    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${range}!B${codeIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[rows[codeIndex][1]]],
      },
    });

    res.status(200).send("Code found!");
  } catch (error) {
    console.error("Error during Google Sheets API call:", error);
    res.status(500).send("Server error: " + error);
  }
});

ccs.post("/ebook/:id", async (req: Request, res: Response) => {
  console.log("we in ebooks.");
  try {
    const { email } = req.body;
    console.log(email);
    const code = req.params.id as string;
    console.log(code);
    console.log("submitted code");
    // if (typeof code !== "string" || !/^\d{4}$/.test(code)) {
    //   return res.status(400).send("Invalid code format");
    // }
    const googleSheets = await authenticateGoogleSheets();
    const spreadsheetId = "1iE0mqWwUtLUPh0NOEMoM1q87Kt7OBzS-OVzSkM1gvl4";
    const range = "E-BOOK CODES";
    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    //finds all rows
    const rows = response.data.values;
    //confirms rows exist
    if (!rows) {
      return res.status(404).send("No data found in the sheet");
    }
    if (rows[0][7] == "STOP") {
      return res.status(403).send("Too many codes used. Contact admin");
    }

    //finds if current code exists
    const codeIndex = rows.findIndex((row) => row[0] === code);
    const emailIndex = rows.findIndex((row) => row[2] === email);
    if (!codeIndex || codeIndex === -1) {
      console.log("unique code");
    } else {
      return res.status(403).send("This code has been used. Contact admin");
    }
    if (!emailIndex || emailIndex === -1) {
      console.log("unique email");
    } else {
      return res.status(403).send("This email has been used. Contact admin");
    }

    //if current code isn't valid, sends a 404
    await googleSheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${range}!A${rows.length + 1}`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[code, "USED", email]],
      },
    });

    res.status(200).send("Code done!");
  } catch (error) {
    console.error("Error during Google Sheets API call:", error);
    res.status(500).send("Server error: " + error);
  }
});
ccs.get("/library/:id", async (req: Request, res: Response) => {
  try {
    const code = req.params.id as string;
    console.log("submitted code");
    // if (typeof code !== "string" || !/^\d{4}$/.test(code)) {
    //   return res.status(400).send("Invalid code format");
    // }
    const googleSheets = await authenticateGoogleSheets();
    const spreadsheetId = "1iE0mqWwUtLUPh0NOEMoM1q87Kt7OBzS-OVzSkM1gvl4";
    const range = "UNIQUE CODES";
    const response = await googleSheets.spreadsheets.values.get({
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
    const codeValid: string = rows[codeIndex][1];

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

    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${range}!B${codeIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[rows[codeIndex][1]]],
      },
    });

    res.status(200).send("Code found!");
  } catch (error) {
    console.error("Error during Google Sheets API call:", error);
    res.status(500).send("Server error: " + error);
  }
});

export default ccs;
