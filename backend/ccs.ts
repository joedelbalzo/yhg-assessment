// import { google, sheets_v4 } from "googleapis";
// import express, { Request, Response } from "express";
// const ccs = express();
// import dotenv from "dotenv";
// import path from "path";
// dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ccs.use(express.json());

// if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.SPREADSHEET_ID) {
//   console.error("Missing required environment variables. Check .env file.");
//   process.exit(1);
// }

// //helper functions
// const authenticateGoogleSheets = async (): Promise<sheets_v4.Sheets> => {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS!,
//     scopes: "https://www.googleapis.com/auth/spreadsheets",
//   });
//   const client = await auth.getClient();
//   const googleSheets = google.sheets({ version: "v4", auth: client as any });

//   return googleSheets;
// };

// const fetchDataFromSheet = async (googleSheets: sheets_v4.Sheets, spreadsheetId: string, range: string) => {
//   const response = await googleSheets.spreadsheets.values.get({
//     spreadsheetId,
//     range,
//   });
//   return response.data.values || [];
// };

// const checkEmail = async (rows: string[][], email: string) => {
//   console.log("check email function");
//   const emailIndex = rows.findIndex((row) => row[2] === email);
//   if (emailIndex === -1) {
//     console.log("email success");
//     return { success: true, message: "email hasn't been used! success" };
//   } else {
//     console.log("email fail");
//     return { success: false, message: "This email has been used. Contact admin" };
//   }
// };

// interface CheckCodeResult {
//   success: boolean;
//   message?: string;
//   codeIndex?: number;
// }
// const checkCode = async (rows: string[][], code: string): Promise<CheckCodeResult> => {
//   const codeIndex = rows.findIndex((row) => row[0] === code);
//   if (codeIndex === -1) {
//     console.log("code fail");
//     return { success: false, message: "code not found" };
//   }
//   const codeValid: string = rows[codeIndex][1];
//   if (codeValid == "USED") {
//     return { success: false, message: "This code has been used. Contact admin" };
//   }
//   return { success: true, codeIndex: codeIndex };
// };

// const updateSheetData = async (
//   googleSheets: sheets_v4.Sheets,
//   spreadsheetId: string,
//   range: string,
//   values: Array<Array<string | number>>,
//   inputOption: string = "RAW"
// ) => {
//   await googleSheets.spreadsheets.values.update({
//     spreadsheetId,
//     range,
//     valueInputOption: inputOption,
//     requestBody: { values },
//   });
// };

// const googleSheetsColumnLetters = [
//   "A",
//   "B",
//   "C",
//   "D",
//   "E",
//   "F",
//   "G",
//   "H",
//   "I",
//   "J",
//   "K",
//   "L",
//   "M",
//   "N",
//   "O",
//   "P",
//   "Q",
//   "R",
//   "S",
//   "T",
//   "U",
//   "V",
//   "W",
//   "X",
//   "Y",
//   "Z",
//   "AA",
//   "AB",
//   "AC",
// ];

// //routes
// ccs.post("/hardcover/:id", async (req: Request, res: Response) => {
//   try {
//     const code = req.params.id as string;
//     const { email } = req.body;
//     if (typeof code !== "string" || !/^[0-9]+$/.test(code)) {
//       console.log("invalid code format");
//       return res.status(400).send("Invalid code format");
//     }
//     const googleSheets = await authenticateGoogleSheets();
//     const spreadsheetId = process.env.SPREADSHEET_ID!;

//     let rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "hardcover");

//     // const rows = response.data.values;
//     if (!rows) {
//       return res.status(404).send("No data found in the sheet");
//     }

//     const checkingCode = await checkCode(rows, code);
//     if (!checkingCode.success || checkingCode.codeIndex === undefined) {
//       res.status(400).send({ success: false, message: checkingCode.message });
//       return;
//     }

//     const checkingEmail = await checkEmail(rows, email);
//     if (!checkingEmail.success) {
//       res.status(400).send({ success: false, message: checkingEmail.message });
//       return;
//     }

//     //AFTER CODE AND EMAIL VALIDATED
//     let domainsRows = await fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");
//     if (!domainsRows) {
//       return res.status(404).send("No data found in the YSCs sheet");
//     }
//     const domain: number = domainsRows.findIndex((row) => row[0] === "");
//     if (!domain) {
//       return res.status(404).send("No available domain");
//     }
//     const domainAddress: string = domainsRows[domain][1];

//     await updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);
//     await updateSheetData(googleSheets, spreadsheetId, `hardcover!B${checkingCode.codeIndex + 1}:D${checkingCode.codeIndex + 1}`, [
//       ["USED", email, domainAddress],
//     ]);

//     // sendEmail(email, domainAddress);
//     res.status(200).send(domainAddress);
//   } catch (error) {
//     console.error("Error during Google Sheets API call:", error);
//     res.status(500).send("An internal server error occurred.");
//   }
// });

// //
// //
// //
// //
// // E BOOKS
// //
// //
// //
// //

// //RECEIPTS TO MATCH amazon, bluefire reader, nook, kobo,reMarkable?

// ccs.post("/ebook/:id", async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     const code = req.params.id as string;
//     if (typeof code !== "string" || !/^[0-9]+$/.test(code)) {
//       console.log("invalid code format");
//       return res.status(400).send("Invalid code format");
//     }
//     const googleSheets = await authenticateGoogleSheets();
//     const spreadsheetId = process.env.SPREADSHEET_ID!;

//     let rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "EBCs");
//     if (!rows) {
//       return res.status(404).send("No data found in the sheet");
//     }
//     if (rows[0][7] == "STOP") {
//       return res.status(403).send("Too many codes used. Contact admin");
//     }

//     const codeIndex = rows.findIndex((row) => row[0] === code);
//     const emailIndex = rows.findIndex((row) => row[2] === email);
//     if (codeIndex !== -1) {
//       return res.status(403).send({ success: false, message: "This code has been used. Contact admin" });
//     }
//     if (emailIndex !== -1) {
//       return res.status(403).send({ success: false, message: "This email has been used. Contact admin" });
//     }

//     //code hasn't been used, passes regex. link time.
//     //OK WE HAVE A VALID CODE
//     //get response from other sheet

//     let domainsRows = await fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");
//     if (!domainsRows) {
//       return res.status(404).send("No data found in the YSCs sheet");
//     }
//     const domain: number = domainsRows.findIndex((row) => row[0] === "");
//     if (domain === -1) {
//       return res.status(404).send("No available domain");
//     }
//     const domainAddress: string = domainsRows[domain][1];

//     await updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);

//     let range = "EBCs";
//     await googleSheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: `${range}!A${rows.length}`,
//       valueInputOption: "RAW",
//       insertDataOption: "INSERT_ROWS",
//       requestBody: {
//         values: [[code, "USED", email]],
//       },
//     });

//     // sendEmail(email, domainAddress);
//     res.status(200).send(domainAddress);
//   } catch (error) {
//     console.error("Error during Google Sheets API call:", error);
//     res.status(500).send("An internal server error occurred.");
//   }
// });

// //
// //
// //
// //
// // LIBRARY
// //
// //
// //
// //

// ccs.post("/library/:id", async (req: Request, res: Response) => {
//   try {
//     const code = req.params.id.trim();
//     const { email } = req.body;
//     if (typeof code !== "string" || !/^[0-9-]+$/.test(code)) {
//       console.log("invalid code format");
//       return res.status(400).send("Invalid code format");
//     }

//     const googleSheets = await authenticateGoogleSheets();
//     const spreadsheetId = process.env.SPREADSHEET_ID!;

//     const rows = await fetchDataFromSheet(googleSheets, spreadsheetId, "LBCs");

//     if (!rows) {
//       return res.status(404).send("No data found in the sheet");
//     }

//     const checkingCode = await checkCode(rows, code);
//     if (!checkingCode.success || checkingCode.codeIndex === undefined) {
//       res.status(400).send({ success: false, message: checkingCode.message });
//       return;
//     }

//     const checkingEmail = await checkEmail(rows, email);
//     if (!checkingEmail.success) {
//       res.status(400).send({ success: false, message: checkingCode.message });
//       return;
//     }

//     //OK WE HAVE A VALID CODE
//     //get response from other sheet
//     const domainsRows = await fetchDataFromSheet(googleSheets, spreadsheetId, "YSCs");
//     if (!domainsRows) {
//       return res.status(404).send("No data found in the YSCs sheet");
//     }
//     const domain: number = domainsRows.findIndex((row) => row[0] === "");
//     if (!domain) {
//       return res.status(404).send("No available domain");
//     }
//     const domainAddress: string = domainsRows[domain][1];

//     await updateSheetData(googleSheets, spreadsheetId, `YSCs!A${domain + 1}`, [["USED"]]);

//     const newUsageValue: number = parseInt(rows[checkingCode.codeIndex][1]) + 1;

//     //now, we have to go back to the other sheet and make updates. two calls because columns are separate.
//     await updateSheetData(googleSheets, spreadsheetId, `LBCs!B${checkingCode.codeIndex + 1}`, [[newUsageValue]], "USER_ENTERED");

//     await updateSheetData(
//       googleSheets,
//       spreadsheetId,
//       `LBCs!${googleSheetsColumnLetters[rows[checkingCode.codeIndex].length]}${checkingCode.codeIndex + 1}`,
//       [[email]]
//     );

//     // sendEmail(email, domainAddress);
//     res.status(200).send(domainAddress);
//   } catch (error) {
//     console.error("Error during Google Sheets API call:", error);
//     res.status(500).send("An internal server error occurred.");
//   }
// });

// export default ccs;

// // dead GAS routes
// // gas.post("/ebook/:id", async (req: Request, res: Response) => {
// //   try {
// //     const { email } = req.body;
// //     const code = req.params.id;

// //     const emailCheck = isValidEmail(email);
// //     const codeCheck = isValidCode(code);

// //     if (!emailCheck.success) {
// //       return res.status(500).send("Invalid email address.");
// //     }
// //     if (!codeCheck.success) {
// //       return res.status(500).send("Invalid code format");
// //     }

// //     const data = JSON.stringify({
// //       email: email,
// //       code: code,
// //       apiKey: process.env.API_KEY,
// //       bookType: "ebook",
// //     });
// //     const response = await axios.post(process.env.AS_LINK!, data, {
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //     });

// //     // Handle or log the response from Google Apps Script
// //     console.log("Response from Google Apps Script:", response.data);

// //     if (!response.data.success) {
// //       if (response.data.message == "Code already used") {
// //         res.status(400).send("This code has been used. Contact admin");
// //       } else if (response.data.message == "Email already used") {
// //         res.status(400).send("This email has been used. Contact admin");
// //       } else if (response.data.message == "Code not found") {
// //         res.status(400).send("This code was not found. Contact admin");
// //       } else if (response.data.message == "No available domains") {
// //         res.status(400).send("No available domains. Contact admin");
// //       } else return { success: false, message: "Unknown DB error" };
// //     }

// //     if (response.data.success) {
// //       if (response.data.message == "Email already used") {
// //         res.status(200).send({ ...response.data, message: "Email already used" });
// //       } else {
// //         console.log("hmm");
// //         res.send(response.data);
// //       }
// //     }
// //   } catch (error) {
// //     console.error("Error during Google Sheets API call:", error);
// //     res.status(500).send("An internal server error occurred.");
// //   }
// // });
// // gas.post("/hardcover/:id", async (req: Request, res: Response) => {
// //   try {
// //     const { email } = req.body;
// //     const code = req.params.id;

// //     const emailCheck = isValidEmail(email);
// //     const codeCheck = isValidCode(code);

// //     if (!emailCheck.success) {
// //       return res.status(500).send("Invalid email address.");
// //     }
// //     if (!codeCheck.success) {
// //       return res.status(500).send("Invalid code format");
// //     }

// //     const data = JSON.stringify({
// //       email: email,
// //       code: code,
// //       apiKey: process.env.API_KEY,
// //       bookType: "hardcover",
// //     });

// //     const response = await axios.post(process.env.AS_LINK!, data, {
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //     });

// //     // Handle or log the response from Google Apps Script
// //     console.log("Response from Google Apps Script:", response.data);

// //     if (!response.data.success) {
// //       if (response.data.message == "Code already used") {
// //         res.status(400).send("This code has been used. Contact admin");
// //       } else if (response.data.message == "Email already used") {
// //         res.status(400).send("This email has been used. Contact admin");
// //       } else if (response.data.message == "Code not found") {
// //         res.status(400).send("This code was not found. Contact admin");
// //       } else if (response.data.message == "No available domains") {
// //         res.status(400).send("No available domains. Contact admin");
// //       } else return { success: false, message: "Unknown DB error" };
// //     }

// //     if (response.data.success) {
// //       if (response.data.message == "Email already used") {
// //         res.status(200).send({ ...response.data, message: "Email already used" });
// //       } else {
// //         console.log("hmm");
// //         res.send(response.data);
// //       }
// //     }
// //   } catch (error) {
// //     console.error("Error during Google Sheets API call:", error);
// //     res.status(500).send("An internal server error occurred.");
// //   }
// // });
// // gas.post("/library/:id", async (req: Request, res: Response) => {
// //   try {
// //     const { email } = req.body;
// //     const code = req.params.id;

// //     const emailCheck = isValidEmail(email);
// //     const codeCheck = isValidCode(code);

// //     if (!emailCheck.success) {
// //       return res.status(500).send(emailCheck);
// //     }
// //     if (!codeCheck.success) {
// //       return res.status(500).send(codeCheck);
// //     }

// //     const data = JSON.stringify({
// //       email: email,
// //       code: code,
// //       apiKey: process.env.API_KEY,
// //       bookType: "library",
// //     });

// //     const response = await axios.post(process.env.AS_LINK!, data, {
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //     });

// //     // Handle or log the response from Google Apps Script
// //     console.log("Response from Google Apps Script:", response.data);
// //     if (!response.data.success) {
// //       if (response.data.message == "Code already used") {
// //         res.status(400).send("This code has been used. Contact admin");
// //       } else if (response.data.message == "Email already used") {
// //         res.status(400).send("This email has been used. Contact admin");
// //       } else if (response.data.message == "Code not found") {
// //         res.status(400).send("This code was not found. Contact admin");
// //       } else if (response.data.message == "No available domains") {
// //         res.status(400).send("No available domains. Contact admin");
// //       } else return { success: false, message: "Unknown DB error" };
// //     }

// //     if (response.data.success) {
// //       if (response.data.message == "Email already used") {
// //         res.status(200).send({ ...response.data, message: "Email already used" });
// //       } else {
// //         console.log("hmm");
// //         res.send(response.data);
// //       }
// //     }
// //   } catch (error) {
// //     console.error("Error during Google Sheets API call:", error);
// //     res.status(500).send("An internal server error occurred.");
// //   }
// // });
