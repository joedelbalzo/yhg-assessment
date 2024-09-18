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

const requiredVars = ["GOOGLE_APPLICATION_CREDENTIALS", "SPREADSHEET_ID", "AS_LINK", "EMAIL_PROCESSING", "CACHE_REFRESH"];
const missingVars = requiredVars.filter((v) => !process.env[v]);
if (missingVars.length) {
  console.error(`Missing required environment variables: ${missingVars.join(", ")}. Check .env file.`);
  process.exit(1);
}

// Cache for email check results (limited to last 5,000 emails)
const emailCache = new Map<string, CheckEmailResult>();

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
  email?: string;
  statusCode?: number;
  details?: string;
  error?: string;
}

const addToEmailCache = (email: string, result: CheckEmailResult) => {
  emailCache.set(email, result);
  if (emailCache.size > 5000) {
    const oldestKey = emailCache.keys().next().value;
    emailCache.delete(oldestKey);
  }
};

const checkEmail = async (email: string): Promise<CheckEmailResult> => {
  if (emailCache.has(email)) {
    console.log(`Cache hit for email: ${email}`);
    return emailCache.get(email)!;
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
      const response = await axios.post(process.env.AS_LINK!, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success == true && response.status === 200) {
        console.log("Email processing successful", response.data);
        return customResponse.CSV_SUCCESS;
      } else {
        return customResponse.CSV_FAIL;
      }
    } catch (error) {
      console.error("Error during CSV processing:", error);
      return customResponse.CSV_FAIL;
    }
  }

  if (email === process.env.CACHE_REFRESH) {
    console.log("Refreshing email cache on request");
    await refreshEmailCache();
    return customResponse.CACHE_SUCCESS;
  }

  // Since we're only calling Google Sheets once per day, assume the email is not used
  console.log(`Email not found in cache: ${email}`);
  return customResponse.NOT_FOUND_EMAIL;
};

const refreshEmailCache = async () => {
  const googleSheets = await authenticateGoogleSheets();
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  let rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "Master");

  if (rows) {
    // Reverse the rows to get the latest entries first
    rows.reverse();
    // Take the first 5,000 entries
    const recentRows = rows.slice(0, 5000);
    emailCache.clear();
    recentRows.forEach((row) => {
      const email = row[0];
      addToEmailCache(email, { success: true, message: "email has been used", domain: row[6], code: row[5] });
    });
    console.log("Email cache refreshed.");
  } else {
    console.log("Failed to refresh email cache: No data found.");
  }
};

// Initial cache load
(async () => {
  console.log("Preloading email cache...");
  await refreshEmailCache();
})();

// Set up a timer to refresh the cache every 24 hours
setInterval(async () => {
  console.log("Refreshing email cache due to 24-hour interval...");
  await refreshEmailCache();
}, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

const isValidEmail = (email: string): { success: boolean; message: string } => {
  const result = validator.isEmail(email);
  return {
    success: result,
    message: result ? "Email passes Regex" : "Email failed Regex",
  };
};

// Validates codes that are either 4-7 digits or exactly 10 digits
const isValidCode = (code: string): { success: boolean; message: string } => {
  const result = /^(\d{4,7}|\d{10})$/.test(code);
  return {
    success: result,
    message: result ? "Code passes validation" : "Invalid code format",
  };
};

// Queue implementation
const queue: { email: string; code: string; bookType: string; purchasedOrBorrowed: string; res: Response }[] = [];
let processing = false;
const pendingRequests = new Set<string>();

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

const processQueue = async () => {
  if (queue.length > 0 && !processing) {
    processing = true;
    const { email, code, bookType, purchasedOrBorrowed, res } = queue.shift()!;
    const requestKey = `${email}-${code}`;
    await handleRequest(email, code, bookType, purchasedOrBorrowed, res);
    pendingRequests.delete(requestKey);
    processing = false;
    setTimeout(processQueue, 1000);
  }
};

const handleRequest = async (email: string, code: string, bookType: string, purchasedOrBorrowed: string, res: Response) => {
  try {
    const emailResult = await checkEmail(email);

    // Handle special responses from checkEmail
    if (email === process.env.EMAIL_PROCESSING || email === process.env.CACHE_REFRESH) {
      return res.send(emailResult);
    }

    if (!emailResult.success && emailResult.message === "No database connection") {
      return res.send(customResponse.NO_DATABASE_CONNECTION);
    } else if (emailResult.message === "Used email") {
      return res.send({ ...customResponse.USED_EMAIL, domain: emailResult.domain });
    } else if (emailResult.message === "Not found email") {
      const data = JSON.stringify({
        email: email,
        code: code,
        apiKey: process.env.API_KEY,
        purchasedOrBorrowed: purchasedOrBorrowed,
        bookType: bookType,
      });

      try {
        const response = await axios.post(process.env.AS_LINK!, data, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.data && response.data.success) {
          // Update cache with new email
          addToEmailCache(email, {
            success: true,
            message: "email has been used",
            email: email,
            domain: response.data.domain,
          });
          return res.send(response.data);
        } else {
          // Handle known error messages
          const errorMessageMap: { [key: string]: SendStatus } = {
            "Maximum number of codes reached.": customResponse.MAXIMUM_DIGITAL_BOOKS,
            "Code already used": customResponse.USED_CODE,
            "Email already used": customResponse.USED_EMAIL,
            "Code not found": customResponse.NOT_FOUND_CODE,
            "No available domains": customResponse.NO_DOMAINS,
            "This code has reached its usage limit.": customResponse.CODE_LIMIT,
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

gas.post("/check-email", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim();
    console.log("Checking email:", cleanEmail);

    const validation = isValidEmail(cleanEmail);
    if (!validation.success) {
      return res.send(customResponse.INVALID_EMAIL_FORMAT);
    }
    const result = await checkEmail(cleanEmail);
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

gas.post("/:id", (req: Request, res: Response) => {
  const { email, bookType, purchasedOrBorrowed } = req.body;
  const code = req.params.id;

  const emailCheck = isValidEmail(email);
  const codeCheck = isValidCode(code);
  if (!emailCheck.success) {
    return res.send(customResponse.INVALID_EMAIL_FORMAT);
  }
  if (!codeCheck.success) {
    return res.send(customResponse.INVALID_CODE_FORMAT);
  }

  addToQueue(email, code, bookType, purchasedOrBorrowed, res);
});

// Error handling middleware
gas.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).send({ message: "Internal server error" });
});

export default gas;
