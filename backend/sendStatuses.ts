export interface SendStatus {
  success: boolean;
  statusCode: number;
  message: string;
  details: string;
  domain?: string;
}
export interface SendStatusCodes {
  SUCCESS: SendStatus;
  CSV_SUCCESS: SendStatus;
  CACHE_SUCCESS: SendStatus;
  NO_DATABASE_CONNECTION: SendStatus;
  ERROR: SendStatus;
  INVALID_CODE_FORMAT: SendStatus;
  INVALID_EMAIL_FORMAT: SendStatus;
  USED_CODE: SendStatus;
  USED_EMAIL: SendStatus;
  NOT_FOUND_CODE: SendStatus;
  NOT_FOUND_EMAIL: SendStatus;
  MAXIMUM_DIGITAL_BOOKS: SendStatus;
  NO_DOMAINS: SendStatus;
  CODE_LIMIT: SendStatus;
  CSV_FAIL: SendStatus;
  DUPLICATE_REQUEST_DETECTED: SendStatus;
  UNKNOWN_ERROR: SendStatus;
  INTERNAL_SERVER_ERROR: SendStatus;
}

export const customResponse: SendStatusCodes = {
  SUCCESS: {
    success: true,
    statusCode: 200,
    message: "Success!",
    details:
      "Success! This is your unique URL to get started with YouScience. If you navigate from this page without your unique domain, don't worry! You can always come back here and retrieve it with your email address.",
    domain: "insert domain url",
  },
  CSV_SUCCESS: { success: true, statusCode: 200, message: "CSV success", details: "CSV has been downloaded.", domain: "" },
  CACHE_SUCCESS: { success: true, statusCode: 200, message: "Cache Refreshed", details: "Email cache has been refreshed.", domain: "" },
  NO_DATABASE_CONNECTION: {
    success: false,
    statusCode: 404,
    message: "No database connection.",
    details:
      "The server has disconnected from the database. Please try again, and if you're still having an issue please email us at info@yourhiddengenius.com and we'll fix it right away!",
    domain: "",
  },
  INTERNAL_SERVER_ERROR: {
    success: false,
    statusCode: 500,
    message: "An unexpected error occurred.",
    details:
      "The server has disconnected from the database. Please try again, and if you're still having an issue please email us at info@yourhiddengenius.com and we'll fix it right away!",
    domain: "",
  },
  ERROR: {
    success: false,
    statusCode: 404,
    message: "Error.",
    details:
      "You've reached a generic error response. It's likely that your code and email worked, so please go back to the beginning, click 'Signed up, but forgot your unique link? Click here.', and try to recover your domain using your email address. If that doesn't work, please email us at info@yourhiddengenius.com and we'll fix this right away!",
    domain: "",
  },

  INVALID_CODE_FORMAT: {
    success: false,
    statusCode: 404,
    message: "Submitted an invalid code format.",
    details:
      "Your code's format is incorrect. Please double check that you are only entering numerical digits for your code and no spaces, letters, or other symbols.",
    domain: "",
  },
  INVALID_EMAIL_FORMAT: {
    success: false,
    statusCode: 404,
    message: "Submitted an invalid email format.",
    details:
      "Your email format is incorrect. Please go back and confirm that you're entering a standard email@emailprovider.com email address. Please try this again, but if you're still having trouble, please email us at info@yourhiddengenius.com with a photo or screenshot of your receipt and we'll get it straightened out.",
    domain: "",
  },
  USED_CODE: {
    success: false,
    statusCode: 404,
    message: "Code already applied.",
    details:
      "This code has already been used. If you are having issues with your YouScience dashboard, please go to https://www.youscience.com/login/ and contact YouScience support. If this is a library book and you're seeing this message, email us at info@yourhiddengenius.com with a photo or screenshot of your receipt or the library sticker on the book and we'll get you straightened out immediately.",
    domain: "",
  },
  USED_EMAIL: {
    success: false,
    statusCode: 404,
    message: "Email found.",
    details: `The unique domain attached to this email address is above. For any issues with your YouScience dashboard, please go to https://www.youscience.com/login/ and contact YouScience support.`,
    domain: "",
  },
  NOT_FOUND_CODE: {
    success: false,
    statusCode: 404,
    message: "Cannot find code.",
    details:
      "That code is either invalid or does not exist in our system. Please double check that you are only entering numerical digits for your code and no spaces, letters, or other symbols.",
    domain: "",
  },
  NOT_FOUND_EMAIL: {
    success: false,
    statusCode: 404,
    message: "Cannot find email.",
    details:
      "We don't have that email in our database. Please try a different email address. If you're positive it was that one, please reach out to info@yourhiddengenius.com and include a picture or screenshot of your purchase receipt.",
    domain: "",
  },
  MAXIMUM_DIGITAL_BOOKS: {
    success: false,
    statusCode: 404,
    message: "Maximum Digital Books",
    details:
      "We have distributed more unique domains than we have sold copies. This is likely due to outdated sales information not received by our database. Please reach out to info@yourhiddengenius.com and include a picture or screenshot of your purchase receipt.",
    domain: "",
  },
  NO_DOMAINS: {
    success: false,
    statusCode: 404,
    message: "No domains remaining.",
    details:
      "Our system shows there are no available tests. That can't be right! Please try again. If you're having trouble, please email us at info@yourhiddengenius.com",
    domain: "",
  },
  CODE_LIMIT: {
    success: false,
    statusCode: 404,
    message: "Code Limit Surpassed",
    details:
      "We limit code usage on library books per the publisher's recommendations. It seems like this library book has been used too many times. Please try this again, but if you're still having trouble, please email us at info@yourhiddengenius.com",
    domain: "",
  },
  CSV_FAIL: {
    success: false,
    statusCode: 404,
    message: "CSV Export Failed",
    details:
      "Check the database for further error messages, but it's likely that there have just been no new emails since this report was last run.",
    domain: "",
  },
  DUPLICATE_REQUEST_DETECTED: {
    success: false,
    statusCode: 404,
    message: "Duplicate Request Detected",
    details:
      "Our system detected that this was a duplicated request. Most likely, your initial request was processed, so please go to the  beginning, click 'Signed up, but forgot your unique link? Click here.', and try to recover your domain using your email address. If that doesn't work, please go through the process of redeeming your code again. If you're still having issues, please reach out to info@yourhiddengenius.com, include a picture or screenshot of your purchase receipt, and we'll get back as soon as possible.",
    domain: "",
  },
  UNKNOWN_ERROR: {
    success: false,
    statusCode: 404,
    message: "Unknown Error",
    details:
      "Unknown Error. Please try again. If you're still having issues, please reach out to info@yourhiddengenius.com, include a picture or screenshot of your purchase receipt, and we'll get back as soon as possible.",
    domain: "",
  },
};
