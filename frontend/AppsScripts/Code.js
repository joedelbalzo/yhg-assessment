/**
 * Main webhook handler for Google Apps Script.
 * Receives POST requests from the Node.js backend to process code redemptions.
 *
 * @param {Object} e - Event object from Google Apps Script
 * @param {Object} e.postData - POST request data
 * @param {string} e.postData.contents - JSON string with request parameters
 *
 * @returns {ContentService.TextOutput} JSON response with success/failure status
 *
 * @example
 * // Request body:
 * {
 *   "email": "user@example.com",
 *   "code": "12345",
 *   "apiKey": "***",
 *   "bookType": "physicalCopy",
 *   "purchasedOrBorrowed": "purchased"
 * }
 *
 * @description
 * Flow:
 * 1. Validates API key against script properties
 * 2. Routes to appropriate processor based on bookType
 * 3. Handles special email commands (process@emails.com for CSV export)
 * 4. Auto-sorts Master sheet every 100 submissions for binary search efficiency
 */
function doPost(e) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const expectedApiKey = scriptProperties.getProperty("API_KEY");
  let params = {};

  try {
    params = JSON.parse(e.postData.contents);
  } catch (error) {
    logToSheet("Unable to parse incoming JSON data: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Invalid JSON format"})).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  if (params.apiKey !== expectedApiKey) {
    logToSheet("Bad api key.");
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Invalid API key"})).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName("Master");
  let {email, code, bookType, purchasedOrBorrowed} = params;
  logToSheet(`${email}, ${code}, ${bookType}, ${purchasedOrBorrowed}`);
  email = email.trim().toLowerCase();

  //this line of code checks if an email exists before processing them
  if (code == null && purchasedOrBorrowed == null && bookType == null) {
    const found = checkEmailInSheet(email, masterSheet);
    logToSheet(`${email} ${JSON.stringify(found)}`);
    return ContentService.createTextOutput(JSON.stringify(found)).setMimeType(ContentService.MimeType.JSON);
  }

  bookType = bookType.trim();
  purchasedOrBorrowed = purchasedOrBorrowed.trim();

  if (email.trim().toLowerCase() == "process@emails.com") {
    try {
      emailCSV();
      return ContentService.createTextOutput(JSON.stringify({success: true, message: "Function has been run"})).setMimeType(
        ContentService.MimeType.JSON
      );
    } catch (error) {
      logToSheet("failed to run emailCSV(): " + error.toString());
      return ContentService.createTextOutput(
        JSON.stringify({success: false, message: "Failed to run emailCSV", error: error.toString()})
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (!masterSheet) {
    logToSheet("Master sheet not found.");
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Master sheet not found"})).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  try {
    const domainSheet = ss.getSheetByName("YSCs");
    if (!domainSheet) {
      logToSheet("Domain Sheet not found");
      throw new Error("Sheet 'YSCs' not found.");
    }
    const emailCSVSheet = ss.getSheetByName("email_csv");
    if (!emailCSVSheet) {
      logToSheet("emailCSV sheet");
      throw new Error("Sheet 'email_csv' not found.");
    }

    const submissionCounter = masterSheet.getRange("J1").getDisplayValue();

    if ((submissionCounter + 1) % 100 === 0) {
      sortMasterSheetByEmail();
    }

    switch (bookType) {
      case "advanceReaderCopy":
        return processPhysicalBook(email, code, purchasedOrBorrowed, ss, masterSheet, domainSheet, emailCSVSheet);
      case "physicalCopy":
        return processPhysicalBook(email, code, purchasedOrBorrowed, ss, masterSheet, domainSheet, emailCSVSheet);
      case "digitalCopy":
        return processDigitalBook(email, code, purchasedOrBorrowed, ss, masterSheet, domainSheet, emailCSVSheet);
      default:
        console.error("Unknown book type:", bookType);
        logToSheet("Switch/Case error: Unknown Book Type: " + bookType);
        return ContentService.createTextOutput(JSON.stringify({success: false, message: "Unknown book type"})).setMimeType(
          ContentService.MimeType.JSON
        );
    }
  } catch (error) {
    console.error("Error during processing:", error);
    logToSheet("Error during processing: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "An error occurred",
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Processes physical book and ARC (Advance Reader Copy) code redemptions.
 * Uses binary search for O(log n) code lookup performance.
 *
 * @param {string} email - User's email address (trimmed and lowercased)
 * @param {string} code - Redemption code (numeric string)
 * @param {string} purchasedOrBorrowed - "purchased" or "borrowed"
 * @param {Spreadsheet} ss - Active spreadsheet object
 * @param {Sheet} masterSheet - Master redemption log sheet
 * @param {Sheet} domainSheet - YSCs domain pool sheet
 * @param {Sheet} emailCSVSheet - Email CSV export sheet
 *
 * @returns {ContentService.TextOutput} JSON response with success/failure status
 *
 * @description
 * Special codes (hardcoded rows 2-7):
 * - 2018, 100000, 200000, 300000, 10001, 999999
 *
 * Validation:
 * - Code must exist in Physical sheet
 * - Still Valid flag must be TRUE
 * - Uses < Max Uses
 *
 * Side effects:
 * - Increments Uses counter in Physical sheet
 * - Marks domain as USED in YSCs sheet
 * - Appends row to Master sheet
 * - Appends email to email_csv sheet
 * - For purchased books: Records email + domain in Physical sheet
 */
function processPhysicalBook(email, code, purchasedOrBorrowed, ss, masterSheet, domainSheet, emailCSVSheet) {
  // logToSheet("processing physical book");
  const physicalSheet = ss.getSheetByName("Physical");
  if (!physicalSheet) {
    logToSheet("can't find Physical sheet");
    throw new Error("Sheet 'Physical' not found.");
  }

  const codeInt = Number(code.replace(/\D/g, ""));

  // special codes and their corresponding rows
  const specialCodes = [2018, 100000, 200000, 300000, 10001, 999999];
  const specialCodeRows = [2, 3, 4, 5, 6, 7]; // Rows 2 to 7

  const specialIndex = specialCodes.indexOf(codeInt);

  let rowNumber;
  if (specialIndex !== -1) {
    rowNumber = specialCodeRows[specialIndex];
  } else {
    const lastRow = physicalSheet.getLastRow();
    const codeColumn = 2; // codes are in column B
    const startRow = 8; // start after the special codes

    rowNumber = binarySearchSheet(physicalSheet, codeInt, startRow, lastRow, codeColumn);

    if (rowNumber === -1) {
      logToSheet(`Error -- Code. ${code} input by user ${email} not found`);
      return ContentService.createTextOutput(JSON.stringify({success: false, message: "Code not found"})).setMimeType(
        ContentService.MimeType.JSON
      );
    }
  }

  const rowData = physicalSheet.getRange(rowNumber, 1, 1, 7).getDisplayValues()[0];

  let [libraryStatus, codeValue, uses, maxUses, stillValid, emailInSheet, domainInSheet] = rowData;

  uses = parseInt(uses, 10);
  maxUses = parseInt(maxUses.replace(/\D/g, ""), 10);
  libraryStatus = libraryStatus === "TRUE";
  stillValid = stillValid === "TRUE";

  logToSheet(`uses: ${uses}, maxUses: ${maxUses}, libraryStatus: ${libraryStatus}, stillValid: ${stillValid}`);

  if (!stillValid) {
    logToSheet(`Error -- Still Valid?. ${code} input by user ${email} is no longer valid`);
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Code already used"})).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  // Check if 'Uses' exceeds 'Max Uses'
  if (uses >= maxUses) {
    logToSheet(`Error -- Max Uses. ${code} input by user ${email} surpassed maximum uses`);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "This code has reached its usage limit.",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Increase 'Uses' by 1
  uses += 1;
  physicalSheet.getRange(rowNumber, 3).setValue(uses); // 'Uses' column (C)

  const domainValues = domainSheet.getRange("A2:B" + domainSheet.getLastRow()).getDisplayValues();
  const domainIndex = domainValues.findIndex((row) => row[0] !== "USED");

  if (domainIndex === -1) {
    logToSheet(`Error -- Domains. ${code} input by user ${email} could not retrieve a domain.`);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "No available domains",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const domainAllocated = domainValues[domainIndex][1];
  domainSheet.getRange(domainIndex + 2, 1).setValue("USED");

  if (purchasedOrBorrowed === "purchased") {
    // Update Physical sheet with Email and Domain for purchased books
    physicalSheet.getRange(rowNumber, 6, 1, 2).setValues([[email, domainAllocated]]); // 'Email' (F), 'Domain' (G)
  }

  // Update Master sheet
  masterSheet.appendRow([
    email,
    true, // Physical
    false, // Digital
    purchasedOrBorrowed === "purchased", // Purchased
    purchasedOrBorrowed === "borrowed", // Borrowed
    code,
    domainAllocated,
    new Date(),
  ]);

  // Append email to email_csv sheet
  emailCSVSheet.appendRow([email]);

  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      message: "Success!",
      details:
        "This is your unique URL to get started with YouScience. If you navigate from this page without your unique domain, don't worry! You can always come back here and retrieve it with your email address.",
      domain: domainAllocated,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Processes digital book code redemptions for both purchased and borrowed copies.
 *
 * @param {string} email - User's email address (trimmed and lowercased)
 * @param {string} code - 7-character alphanumeric code (or 999999 for library borrows)
 * @param {string} purchasedOrBorrowed - "purchased" or "borrowed"
 * @param {Spreadsheet} ss - Active spreadsheet object
 * @param {Sheet} masterSheet - Master redemption log sheet
 * @param {Sheet} domainSheet - YSCs domain pool sheet
 * @param {Sheet} emailCSVSheet - Email CSV export sheet
 *
 * @returns {ContentService.TextOutput} JSON response with success/failure status
 *
 * @description
 * **Purchased Path** (Digital_Purchased sheet):
 * - Validates "unlock" cell E5 is TRUE (max limit not reached)
 * - Checks code hasn't been used before
 * - Appends: code, email, domain
 *
 * **Borrowed Path** (Digital_Borrowed sheet):
 * - Validates "unlock" cell D5 is TRUE
 * - No code validation (uses library code 999999)
 * - Appends: email, domain (no code column)
 *
 * Both paths:
 * - Mark domain as USED in YSCs sheet
 * - Append row to Master sheet
 * - Append email to email_csv sheet
 */
function processDigitalBook(email, code, purchasedOrBorrowed, ss, masterSheet, domainSheet, emailCSVSheet) {
  // logToSheet("processing digital book");
  const digitalPurchasedSheet = ss.getSheetByName("Digital_Purchased");
  if (!digitalPurchasedSheet) {
    logToSheet(`Digital_Purchased sheet not found.`);
    throw new Error("Sheet 'Digital_Purchased' not found.");
  }
  const digitalBorrowedSheet = ss.getSheetByName("Digital_Borrowed");
  if (!digitalBorrowedSheet) {
    logToSheet(`Digital_Borrowed sheet not found.`);
    throw new Error("Sheet 'Digital_Borrowed' not found.");
  }
  if (purchasedOrBorrowed === "purchased") {
    // Retrieve 'unlock' and existing codes in a single batch
    const lastRow = digitalPurchasedSheet.getLastRow();
    const dataRange = digitalPurchasedSheet.getRange(1, 1, lastRow, 5).getDisplayValues();

    // 'unlock' is in cell E5 (row 5, column 5)
    const unlock = dataRange[4][4]; // Zero-based index

    if (unlock !== "TRUE") {
      logToSheet(`Error -- Max Codes. ${code} input by user ${email} was over the purchased digital max.`);
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          message: "Maximum number of codes reached.",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Collect code values from column A (excluding header)
    const codeValues = dataRange.slice(1).map((row) => row[0]);

    if (codeValues.includes(code)) {
      logToSheet(`Error -- Code already used. ${code} input by user ${email} under digital purchase was already used`);
      return ContentService.createTextOutput(JSON.stringify({success: false, message: "Code already used"})).setMimeType(
        ContentService.MimeType.JSON
      );
    }

    // Retrieve domain data in a single batch
    const domainData = domainSheet.getRange(2, 1, domainSheet.getLastRow() - 1, 2).getValues();
    const domainIndex = domainData.findIndex((row) => row[0] !== "USED");

    if (domainIndex === -1) {
      logToSheet(`Error -- No available domains. ${code} input by user ${email} could not retrieve a domain`);
      return ContentService.createTextOutput(JSON.stringify({success: false, message: "No available domains"})).setMimeType(
        ContentService.MimeType.JSON
      );
    }

    const domainAllocated = domainData[domainIndex][1];
    domainSheet.getRange(domainIndex + 2, 1).setValue("USED"); // Adjust for header row

    // Update Digital_Purchased sheet
    digitalPurchasedSheet.appendRow([code, email, domainAllocated]);

    // Update Master sheet
    masterSheet.appendRow([
      email,
      false, // Physical
      true, // Digital
      true, // Purchased
      false, // Borrowed
      code,
      domainAllocated,
      new Date(),
    ]);

    // Append email to email_csv sheet
    emailCSVSheet.appendRow([email]);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Success!",
        details:
          "This is your unique URL to get started with YouScience. If you navigate from this page without your unique domain, don't worry! You can always come back here and retrieve it with your email address.",
        domain: domainAllocated,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } else if (purchasedOrBorrowed === "borrowed") {
    // Retrieve 'unlock' in Digital_Borrowed sheet and existing data in a single batch
    const lastRow = digitalBorrowedSheet.getLastRow();
    const dataRange = digitalBorrowedSheet.getRange(1, 1, lastRow, 4).getDisplayValues();

    // 'unlock' is in cell D5 (row 5, column 4)
    const unlock = dataRange[4][3]; // Zero-based index

    if (unlock !== "TRUE") {
      logToSheet(`Error -- Max Codes. ${code} input by user ${email} hit max codes in digital borrow.`);

      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          message: "Maximum number of codes reached.",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Retrieve domain data in a single batch
    const domainData = domainSheet.getRange(2, 1, domainSheet.getLastRow() - 1, 2).getValues();
    const domainIndex = domainData.findIndex((row) => row[0] !== "USED");

    if (domainIndex === -1) {
      logToSheet(`Error -- No available domains. ${code} input by user ${email} could not retrieve a domain.`);
      return ContentService.createTextOutput(JSON.stringify({success: false, message: "No available domains"})).setMimeType(
        ContentService.MimeType.JSON
      );
    }

    const domainAllocated = domainData[domainIndex][1];
    domainSheet.getRange(domainIndex + 2, 1).setValue("USED"); // Adjust for header row

    // Update Digital_Borrowed sheet
    digitalBorrowedSheet.appendRow([email, domainAllocated]);

    // Update Master sheet
    masterSheet.appendRow([
      email,
      false, // Physical
      true, // Digital
      false, // Purchased
      true, // Borrowed
      null, // No code
      domainAllocated,
      new Date(),
    ]);

    // Append email to email_csv sheet
    emailCSVSheet.appendRow([email]);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Success!",
        details:
          "This is your unique URL to get started with YouScience. If you navigate from this page without your unique domain, don't worry! You can always come back here and retrieve it with your email address.",
        domain: domainAllocated,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } else {
    logToSheet(`Error -- Broken.. ${code} input by user ${email}. Idk what happened. Hopefully more details to come.`);
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Invalid purchasedOrBorrowed value"})).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}
