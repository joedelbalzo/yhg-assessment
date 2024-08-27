import express, { Request, Response } from "express";
import { google, sheets_v4 } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import { logMemoryUsage } from "./utils";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const gas = express();
gas.use(express.json());

const requiredVars = ["GOOGLE_APPLICATION_CREDENTIALS", "SPREADSHEET_ID", "AS_LINK", "EMAIL_PROCESSING", "CACHE_REFRESH"];
const missingVars = requiredVars.filter((v) => !process.env[v]);
if (missingVars.length) {
  console.error(`Missing required environment variables: ${missingVars.join(", ")}. Check .env file.`);
  process.exit(1);
}

// Cache for email check results
const emailCache: { [email: string]: CheckEmailResult } = {};
let emailCacheCount = 0;

// Helper functions
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

export interface CheckEmailResult {
  success: boolean;
  message: string;
  domain?: string;
  code?: number;
  error?: string;
  email?: string;
}

const checkEmail = async (email: string): Promise<CheckEmailResult> => {
  // Check cache first
  if (emailCache[email]) {
    console.log(`Cache hit for email: ${email}`);
    return emailCache[email];
  }

  try {
    // Handling EMAIL_PROCESSING
    if (email === process.env.EMAIL_PROCESSING) {
      console.log("Processing email for CSV export");
      const data = JSON.stringify({
        email: email,
        code: "123",
        apiKey: process.env.API_KEY,
        bookType: "book type",
      });

      const response = await axios.post(process.env.AS_LINK!, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data && response.status === 200) {
        console.log("Email processing successful", response.data);
        return { success: true, message: "csv success" };
      } else {
        return { success: false, message: "csv fail" };
      }
    }

    // Handling CACHE_REFRESH
    if (email === process.env.CACHE_REFRESH) {
      console.log("Refreshing email cache on request");
      Object.keys(emailCache).forEach((key) => delete emailCache[key]);
      await refreshEmailCache();
      return { success: true, message: "cache success" };
    }

    // Normal email processing with Google Sheets
    const googleSheets = await authenticateGoogleSheets();
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "Master");

    if (!rows || rows.length === 0) {
      console.log("No data found in the Master sheet");
      return { success: false, message: "No data found." };
    }
    const emailIndex = rows.findIndex((row) => row[0]?.trim() === email.trim());
    return emailIndex == -1
      ? { success: true, message: "email not found" }
      : { success: true, message: "email has been used", domain: rows[emailIndex][6], code: parseInt(rows[emailIndex][5], 10) };
  } catch (error: unknown) {
    console.error("An error occurred in checkEmail:", error);
    return error instanceof Error
      ? { success: false, message: "An internal server error occurred", error: error.message }
      : { success: false, message: "An internal server error occurred", error: "An unexpected error type was thrown" };
  } finally {
    // Increment and check cache usage
    emailCacheCount++;
    if (emailCacheCount % 1000 === 0) {
      console.log("Refreshing email cache at count:", emailCacheCount);
      await refreshEmailCache();
      logMemoryUsage(emailCache);
    }
  }
};

const checkCode = async (code: number): Promise<CheckEmailResult> => {
  const googleSheets = await authenticateGoogleSheets();
  const spreadsheetId = process.env.SPREADSHEET_ID!;

  let rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "Master");
  if (!rows) {
    return { success: false, message: "No data found." };
  }
  const codeIndex = rows.findIndex((row) => row[5]?.trim() === code);
  console.log("the code index is", codeIndex);
  let result: CheckEmailResult;
  if (codeIndex === -1) {
    result = { success: true, message: "code not found" };
  } else {
    result = { success: true, message: "code has been used", domain: rows[codeIndex][6] };
  }

  return result;
};

const refreshEmailCache = async () => {
  const googleSheets = await authenticateGoogleSheets();
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  let rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "Master");

  if (rows) {
    rows.forEach((row) => {
      const email = row[0];
      emailCache[email] = { success: true, message: "email has been used", domain: row[6], code: row[5] };
    });
    console.log("Email cache refreshed.");
  } else {
    console.log("Failed to refresh email cache: No data found.");
  }
};

// Set up a timer to refresh the cache every 12 hours
setInterval(async () => {
  console.log("Refreshing email cache due to 12-hour interval...");
  await refreshEmailCache();
}, 12 * 60 * 60 * 1000); // 12 hours in milliseconds

const isValidEmail = function (email: string): { success: boolean; message: string } {
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  return { success: emailRegex, message: emailRegex === true ? "Email passes Regex" : "Email failed Regex" };
};

const isValidCode = function (code: string): { success: boolean; message: string } {
  let result = /^[0-9]{4}$|^[0-9]{5}$|^[0-9]{7}$|^[0-9]{10}$/.test(code);
  return { success: result, message: result === true ? "Code passes Regex" : "Code failed Regex" };
};

// Queue implementation
const queue: { email: string; code: string; bookType: string; res: Response }[] = [];
let processing = false;
let processedRequests = 0;

const processQueue = async () => {
  if (queue.length > 0 && !processing) {
    processing = true;
    const { email, code, bookType, res } = queue.shift()!;
    // console.log(`Processing request for email: ${email}, code: ${code}`);
    await handleRequest(email, code, bookType, res);
    processing = false;
    processedRequests++;
    // console.log(`Processed requests count: ${processedRequests}`);
    setTimeout(processQueue, 1500); // Process next request after 1.5 seconds
  }
};

const addToQueue = (email: string, code: string, bookType: string, res: Response) => {
  const duplicate = queue.slice(-20).find((item) => item.email === email && item.code === code); // Check last 20 items
  if (!duplicate) {
    queue.push({ email, code, bookType, res });
    // console.log(`Added to queue: email: ${email}, code: ${code}`);
    // console.log(`Current queue length: ${queue.length}`);
    processQueue();
  } else {
    console.log(`Duplicate request detected: email: ${email}, code: ${code}`);
    res.status(400).send("Duplicate request detected.");
  }
};

const handleRequest = async (email: string, code: string, bookType: string, res: Response) => {
  const emailCheck = isValidEmail(email);
  const codeCheck = isValidCode(code);
  if (!emailCheck.success) {
    return res.status(500).send("Invalid email address.");
  }
  if (!codeCheck.success) {
    return res.status(500).send("Invalid code format");
  }

  try {
    const emailResult = await checkEmail(email);

    if (!emailResult.success) {
      return res.status(404).send("Could not retrieve information from database");
    } else if (emailResult.message === "email has been used" || emailResult.message === "email cached") {
      console.log("email has been used. sending result");
      return res.status(200).send(emailResult);
    } else if (emailResult.message === "email not found") {
      // console.log("email not found! continuing.");
      const data = JSON.stringify({
        email: email,
        code: code,
        apiKey: process.env.API_KEY,
        bookType: bookType,
      });

      const response = await axios.post(process.env.AS_LINK!, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response from GAS", response.data);

      if (!response.data.success) {
        const errorMessageMap: { [key: string]: string } = {
          "Code already used": "This code has been used. Contact us.",
          "Email already used": "This email has been used. Contact us.",
          "Code not found": "This code was not found. Contact us.",
          "No available domains": "No available domains. Contact us.",
          "Maximum number of codes reached.": "EBooks have surpassed their usage limit. Contact us.",
          "This code has reached its usage limit.": "Library book has surpassed its usage limit. Contact us.",
        };

        return res.status(400).send(errorMessageMap[response.data.message] || "Unknown DB error.");
      }
      if (!emailCache[email]) {
        emailCache[email] = {
          success: true,
          message: "email cached",
          email: email,
          domain: response.data.domain,
        };
      }
      return res.send(response.data);
    }
  } catch (error) {
    console.error("Error during the db call:", error);
    res.status(500).send("An internal server error occurred.");
  }
};

gas.post("/check-email", async (req: Request, res: Response) => {
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
      const result = await checkCode(cleanEmail);
      if (result.message === "code not found") {
        return res.status(404).send("This code was not found. Contact admin");
      } else {
        return res.send(result);
      }
    } else if (codeOrEmail == "email") {
      const validation = isValidEmail(cleanEmail);
      if (!validation.success) {
        return res.status(400).send("Invalid email format");
      }
      const result = await checkEmail(cleanEmail);
      if (result.message === "email not found" && !result.domain) {
        return res.status(404).send(result.message);
      } else if (result.message == "csv fail") {
        return res.status(404).send(result.message);
      } else {
        return res.send(result);
      }
    }
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("An internal server error occurred.");
  }
});
gas.post("/:id", (req: Request, res: Response) => {
  const { email, bookType } = req.body;
  const code = req.params.id;

  addToQueue(email, code, bookType, res);
});

export const errorHandler = (err: Error, res: Response) => {
  console.error(err);
  res.status(500).send({ errors: [{ message: "Something went wrong" }] });
};

export default gas;
