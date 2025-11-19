/**
 * Checks if an email exists in the Master sheet using binary search.
 * Master sheet must be sorted by email (column A) for accurate results.
 *
 * @param {string} email - User's email address (trimmed and lowercased)
 * @param {Sheet} sheet - Master sheet (sorted by email)
 *
 * @returns {Object} Result object
 * @returns {boolean} returns.success - TRUE if email found, FALSE otherwise
 * @returns {string} returns.message - Status message
 * @returns {string} [returns.email] - Email address (if found)
 * @returns {string} [returns.domain] - Assigned domain URL (if found)
 *
 * @description
 * Used by backend when email cache misses. Master sheet is auto-sorted
 * every 100 submissions for binary search efficiency (O(log n)).
 *
 * @example
 * // Email found:
 * {success: true, message: "Email found in database!", email: "user@example.com", domain: "https://potential-123456.yhg.com"}
 *
 * // Email not found:
 * {success: false, message: "Email not found in database"}
 */
function checkEmailInSheet(email, sheet) {
  function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = arr[mid].localeCompare(target);

      if (comparison === 0) {
        return mid; // Return the index of the found email
      } else if (comparison < 0) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return -1;
  }

  const data = sheet.getDataRange().getValues();
  const emailColIndex = 0;
  const domainColIndex = 6;
  const list = data.map((r) => (r[emailColIndex] || "").toString().trim().toLowerCase());
  const rowIndex = binarySearch(list, email);

  if (rowIndex !== -1) {
    const domain = data[rowIndex][domainColIndex] || null;
    return {success: true, message: "Email found in database!", email: email, domain: domain};
  } else {
    return {success: false, message: "Email not found in database"};
  }
}

/**
 * Performs binary search for a code in a sorted sheet column.
 * Used by processPhysicalBook() for O(log n) code lookup.
 *
 * @param {Sheet} sheet - Physical sheet with sorted codes
 * @param {string|number} code - Numeric code to find
 * @param {number} startRow - Starting row (1-indexed, typically 8 after special codes)
 * @param {number} endRow - Ending row (inclusive)
 * @param {number} codeColumn - Column index (1-indexed, typically 2 for column B)
 *
 * @returns {number} Row number (1-indexed) if found, -1 if not found
 *
 * @description
 * Assumes the code column is sorted in ascending order.
 * Special codes (rows 2-7) are handled separately in processPhysicalBook().
 */
function binarySearchSheet(sheet, code, startRow, endRow, codeColumn) {
  let left = startRow;
  let right = endRow;
  code = Number(code);

  while (left <= right) {
    let midRow = Math.floor((left + right) / 2);
    let midValue = Number(sheet.getRange(midRow, codeColumn).getValue());

    if (midValue === code) {
      return midRow;
    } else if (midValue < code) {
      left = midRow + 1;
    } else {
      right = midRow - 1;
    }
  }
  return -1; // Not found
}

/**
 * Sorts the Master sheet by email (column A) in ascending order.
 * Called automatically every 100 submissions for binary search efficiency.
 *
 * @description
 * Triggered by doPost() when submission counter (cell J1) is a multiple of 100.
 * Sorting enables O(log n) email lookup via checkEmailInSheet().
 */
function sortMasterSheetByEmail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName("Master");
  const range = masterSheet.getRange(2, 1, masterSheet.getLastRow() - 1, masterSheet.getLastColumn());
  range.sort({column: 1, ascending: true});
}

/**
 * Exports email_csv sheet as CSV and emails it to admin.
 * Triggered by special email command: process@emails.com
 *
 * @throws {Error} If CSV processing or email sending fails
 *
 * @description
 * Workflow:
 * 1. Converts email_csv sheet to CSV string
 * 2. If CSV is empty: Sends notification email
 * 3. If CSV has data: Sends email with CSV attachment to joe@thefutureofagency.com
 * 4. Clears email_csv sheet for next cycle
 *
 * email_csv sheet is appended on each redemption, so this creates
 * a daily export of new signups.
 */
function emailCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const emailCSVSheet = ss.getSheetByName("email_csv");

  try {
    const csvData = convertSheetToCsv(emailCSVSheet);

    if (csvData.trim() === "") {
      MailApp.sendEmail("joe@thefutureofagency.com", "No New Emails Today", "No new emails since last run.");
      logToSheet("Sent no-emails notification.");
    } else {
      const blob = Utilities.newBlob(csvData, "text/csv", "UniqueEmails.csv");
      MailApp.sendEmail({
        to: "joe@thefutureofagency.com",
        subject: "Daily Unique Emails Export",
        body: "Attached CSV with new emails.",
        attachments: [blob],
      });
      logToSheet("CSV exported and email sent.");
    }

    emailCSVSheet.clear();
    logToSheet("email_csv sheet cleared.");
  } catch (error) {
    logToSheet("Failed to process emailCSV: " + error.toString());
    throw error;
  }
}

/**
 * Converts a Google Sheet to CSV format string.
 *
 * @param {Sheet} sheet - Sheet to convert
 * @returns {string} CSV string with newline-separated rows
 *
 * @description
 * Uses getDisplayValues() to preserve formatting.
 * Joins columns with commas, rows with newlines.
 * Logs each row for debugging.
 */
function convertSheetToCsv(sheet) {
  // Define a more specific range if necessary
  const lastRow = sheet.getLastRow(); // Gets the last row position with data
  const range = sheet.getRange(1, 1, lastRow, sheet.getLastColumn());
  const data = range.getDisplayValues();

  console.log("Total rows retrieved:", data.length);
  let csvContent = "";
  data.forEach((row, index) => {
    let rowData = row.join(",");
    csvContent += rowData + "\n";
    console.log(`Row ${index + 1}: ${rowData}`);
  });
  return csvContent;
}

/**
 * Appends error/event logs to the error_logging sheet.
 * Creates the sheet if it doesn't exist.
 *
 * @param {string} message - Log message (error details, event descriptions, etc.)
 *
 * @description
 * Each log entry includes:
 * - Column A: Timestamp (current date/time)
 * - Column B: Message string
 *
 * Used throughout Code.js for error tracking and debugging.
 */
function logToSheet(message) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName("error_logging") || ss.insertSheet("error_logging");
  logSheet.appendRow([new Date(), message]);
}
