import express, { Request, Response } from "express";
import { google, sheets_v4 } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import validator from "validator";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const gas = express();
gas.use(express.json());
import { customResponse, SendStatus } from "./sendStatuses";

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

const emailCache = new Map<string, CheckEmailResult>();

/**
 * Authenticates with Google Sheets API using service account credentials.
 * @returns {Promise<sheets_v4.Sheets>} A promise that resolves to the authenticated Google Sheets client.
 */
const authenticateGoogleSheets = async (): Promise<sheets_v4.Sheets> => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client as any });

  return googleSheets;
};

/**
 * Fetches data from a specified range in a Google Sheet.
 * @param {sheets_v4.Sheets} googleSheets - The authenticated Google Sheets client.
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {string} range - The cell range to fetch data from.
 * @returns {Promise<any[][]>} A promise that resolves to the data fetched from the sheet.
 */
const fetchDataFromSheet = async (googleSheets: sheets_v4.Sheets, spreadsheetId: string, range: string): Promise<any[][]> => {
  const response = await googleSheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return response.data.values || [];
};

/**
 * Interface representing the result of an email check.
 */
export interface CheckEmailResult {
  success: boolean;
  message: string;
  domain?: string;
  code?: number;
  email?: string;
  statusCode?: number;
  details?: string;
  error?: string;
}

/**
 * Interface representing an item in the processing queue.
 */
interface QueueItem {
  email: string;
  code: string;
  bookType: string;
  purchasedOrBorrowed: string;
  res: Response;
}

/**
 * Adds an email and its result to the cache.
 * Limits the cache size to 5000 entries.
 * @param {string} email - The email address to cache.
 * @param {CheckEmailResult} result - The result of checking the email.
 */
const addToEmailCache = (email: string, result: CheckEmailResult) => {
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
const checkEmail = async (email: string, newSubmission: boolean): Promise<CheckEmailResult> => {
  if (emailCache.has(email)) {
    return emailCache.get(email)!;
  }

  if (email === process.env.EMAIL_PROCESSING) {
    const data = JSON.stringify({
      email,
      code: "123",
      apiKey: process.env.API_KEY,
      bookType: "book type",
    });
    try {
      const r = await axios.post(process.env.AS_LINK!, data, { headers: { "Content-Type": "application/json" } });
      if (r.data.success && r.status === 200) {
        return customResponse.CSV_SUCCESS;
      } else {
        return customResponse.CSV_FAIL;
      }
    } catch {
      return customResponse.CSV_FAIL;
    }
  }

  if (email === process.env.CACHE_REFRESH) {
    await refreshEmailCache();
    return customResponse.CACHE_SUCCESS;
  }

  console.log(`${email} not in cache, checking db now`);
  console.log(`new submission? ${newSubmission} `);

  const requestData = JSON.stringify({
    email: email,
    code: null,
    apiKey: process.env.API_KEY,
    purchasedOrBorrowed: null,
    bookType: null,
  });

  let gasResult: CheckEmailResult | null = null;

  try {
    const r = await axios.post(process.env.AS_LINK!, requestData, { headers: { "Content-Type": "application/json" } });
    // console.log("console logging", r.data);
    if (r.data.success) {
      addToEmailCache(email, r.data);
      gasResult = r.data;
    } else if (!r.data.success && r.data.message == "Email not found in database" && newSubmission) {
      gasResult = { success: false, message: "Email not found in database" };
    } else if (r.data.message === "Invalid API key") {
      gasResult = { success: false, message: "Invalid API key" };
    } else {
      gasResult = { success: false, message: r.data.message || "Unknown error from GAS" };
    }
  } catch {
    gasResult = { success: false, message: "Error querying database" };
  }

  if (gasResult) {
    return gasResult;
  }

  return customResponse.NOT_FOUND_EMAIL;
};

/**
 * Refreshes the email cache by fetching the latest entries from Google Sheets.
 */
const refreshEmailCache = async () => {
  const googleSheets = await authenticateGoogleSheets();
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  let rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "Master");

  if (rows) {
    rows.reverse();
    const recentRows = rows.slice(0, 2500);
    emailCache.clear();
    recentRows.forEach((row) => {
      const email = row[0];
      addToEmailCache(email, { success: true, message: "Used Email", domain: row[6], code: row[5] });
    });
    console.log("Email cache refreshed.");
  } else {
    console.log("Failed to refresh email cache: No data found.");
  }
};

// console.log("timer starting for email cache...");
// setTimeout(async () => {
//   console.log("Preloading email cache...");
//   await refreshEmailCache();
// }, 25000);
(async () => {
  console.log("Preloading email cache...");
  await refreshEmailCache();
})();

setInterval(async () => {
  console.log("Refreshing email cache due to 24-hour interval...");
  await refreshEmailCache();
}, 24 * 60 * 60 * 1000);

/**
 * Validates an email address.
 * @param {string} email - The email address to validate.
 * @returns {{ success: boolean; message: string }} The validation result.
 */
const isValidEmail = (email: string): { success: boolean; message: string } => {
  const result = validator.isEmail(email);
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
export const isValidInput = (input: string): boolean => {
  const inputRegex = /^[A-Za-z' -]+$/; // Allows only letters, spaces, dashes, and apostrophes
  return inputRegex.test(input.trim());
};

/**
 * Validates a code based on the book type using regex patterns from environment variables.
 * @param {string} code - The code to validate.
 * @param {string} bookType - The type of the book.
 * @returns {{ success: boolean; message: string }} The validation result.
 */
const isValidCode = (code: string, bookType: string): { success: boolean; message: string } => {
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

const queue: QueueItem[] = [];
let processing = false;
const pendingRequests = new Set<string>();

/**
 * Adds a request to the processing queue.
 * @param {string} email - The email address.
 * @param {string} code - The code to redeem.
 * @param {string} bookType - The type of the book.
 * @param {string} purchasedOrBorrowed - Indicates if the book was purchased or borrowed.
 * @param {Response} res - The Express response object.
 */
const addToQueue = (email: string, code: string, bookType: string, purchasedOrBorrowed: string, res: Response) => {
  const requestKey = `${email}-${code}`;
  if (!pendingRequests.has(requestKey)) {
    queue.push({ email, code, bookType, purchasedOrBorrowed, res });
    pendingRequests.add(requestKey);
    processQueue();
  } else {
    console.log(`Duplicate request detected: email: ${email}, code: ${code}`);
    res.send(customResponse.DUPLICATE_REQUEST_DETECTED);
  }
};

/**
 * Processes requests in the queue one at a time.
 */
const processQueue = async () => {
  if (queue.length > 0 && !processing) {
    processing = true;
    const { email, code, bookType, purchasedOrBorrowed, res } = queue.shift()!;
    const requestKey = `${email}-${code}`;
    try {
      await handleRequest(email, code, bookType, purchasedOrBorrowed, res);
    } finally {
      pendingRequests.delete(requestKey);
      processing = false;
      const delay = queue.length < 3 ? 500 : 1000;
      setTimeout(processQueue, delay);
    }
  }
};

/**
 * Handles individual requests from the queue.
 * @param {string} email - The email address.
 * @param {string} code - The code to redeem.
 * @param {string} bookType - The type of the book.
 * @param {string} purchasedOrBorrowed - Indicates if the book was purchased or borrowed.
 * @param {Response} res - The Express response object.
 */
const handleRequest = async (email: string, code: string, bookType: string, purchasedOrBorrowed: string, res: Response) => {
  try {
    const emailResult = await checkEmail(email, true);
    console.log("handling request");

    if (email === process.env.EMAIL_PROCESSING || email === process.env.CACHE_REFRESH) {
      return res.send(emailResult);
    }

    if (!emailResult.success && emailResult.message === "No database connection") {
      return res.send(customResponse.NO_DATABASE_CONNECTION);
    } else if (emailResult.message === "Used Email") {
      return res.send({ ...customResponse.USED_EMAIL, domain: emailResult.domain });
      //
      //
      //
      //
    } else if (emailResult.message === "Not found email" || emailResult.message == "Email not found in database") {
      const data = JSON.stringify({
        email: email,
        code: code,
        apiKey: process.env.API_KEY,
        purchasedOrBorrowed: purchasedOrBorrowed,
        bookType: bookType,
      });

      // console.log("sending this data:", data);
      try {
        const response = await axios.post(process.env.AS_LINK!, data, {
          headers: { "Content-Type": "application/json" },
        });

        console.log(`GAS Response Data:`, response.data);

        if (response.data && response.data.success) {
          addToEmailCache(email, {
            success: true,
            message: "Used Email",
            email: email,
            domain: response.data.domain,
          });
          return res.send(response.data);
        } else {
          const errorMessageMap: { [key: string]: SendStatus } = {
            "Maximum number of codes reached.": customResponse.MAXIMUM_DIGITAL_BOOKS,
            "Code already used": customResponse.USED_CODE,
            "Email already used": customResponse.USED_EMAIL,
            "Code not found": customResponse.NOT_FOUND_CODE,
            "No available domains": customResponse.NO_DOMAINS,
            "This code has reached its usage limit.": customResponse.CODE_LIMIT,
            "Cannot use a library book code as a purchased book": customResponse.LIBRARY_AS_PURCHASED,
            "Cannot convert a purchased book to a library book after it has been used.": customResponse.PURCHASED_AS_LIBRARY,
          };
          return res.send(errorMessageMap[response.data.message] || "Unknown DB error.");
        }
      } catch (error) {
        console.error("Error during the Axios request:", error);
        return res.send(customResponse.INTERNAL_SERVER_ERROR);
      }
    } else {
      return res.send({ ...customResponse.UNKNOWN_ERROR, message: "Unexpected email check result." });
    }
  } catch (error) {
    console.error("Error during the request handling:", error);
    res.send(customResponse.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Endpoint to check if an email has been used.
 */
gas.post("/check-email", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log(email);
    const cleanEmail = email.trim();
    // console.log("Checking email:", cleanEmail);

    const validation = isValidEmail(cleanEmail);
    if (!validation.success) {
      return res.send(customResponse.INVALID_EMAIL_FORMAT);
    }
    const result = await checkEmail(cleanEmail, false);
    if (result.message === "email not found" && !result.domain) {
      return res.send(result.message);
    } else if (result.message === "csv fail") {
      return res.send(result.message);
    } else {
      return res.send(result);
    }
  } catch (error) {
    console.error("Error in /check-email:", error);
    res.send(customResponse.INTERNAL_SERVER_ERROR);
  }
});

/**
 * Endpoint to handle code redemption requests.
 */
gas.post("/:id", async (req: Request, res: Response) => {
  const { email, bookType, purchasedOrBorrowed, libraryState, libraryName } = req.body;
  const code = req.params.id;

  if (libraryState) {
    console.log("Library State:", libraryState);
  }

  if (libraryName) {
    console.log("Library Name:", libraryName);
  }

  const emailCheck = isValidEmail(email);
  const codeCheck = isValidCode(code, bookType);
  const libraryStateCheck = libraryState ? isValidInput(libraryState) : "";
  const libraryNameCheck = libraryName ? isValidInput(libraryName) : "";

  if (libraryName && libraryState && (!libraryStateCheck || !libraryNameCheck)) {
    return res.send(customResponse.INVALID_INPUT_FORMAT);
  }

  if (!emailCheck.success) {
    return res.send(customResponse.INVALID_EMAIL_FORMAT);
  }
  if (!codeCheck.success) {
    return res.send(customResponse.INVALID_CODE_FORMAT);
  }

  addToQueue(email, code, bookType, purchasedOrBorrowed, res);
});

gas.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.log(req, next);
  console.error("Unhandled error:", err);
  res.status(500).send({ message: "Internal server error" });
});

export { emailCache, gas };
