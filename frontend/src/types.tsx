import { JSX } from "react";

// Basic types for question, code, email, and error handling
export type CodeJDB = string;
export type EmailJDB = string;
export type BookType = "physicalCopy" | "digitalCopy" | "advanceReaderCopy" | "";
export type NonEmptyBookType = Exclude<BookType, "">;
export type PurchasedOrBorrowed = "purchased" | "library" | "";
export type NonEmptyPurchasedOrBorrowed = Exclude<PurchasedOrBorrowed, "">;

// Interface to map question types to JSX elements for dynamic content rendering
export interface ContentMapJDB {
  physicalOrDigital: JSX.Element;
  purchasedOrLibrary: JSX.Element;
  enterPhysicalCode: JSX.Element;
  enterDigitalCode: JSX.Element;
  enterEmail: JSX.Element;
  checkEmailAddress: JSX.Element;
  success: JSX.Element;
  error: JSX.Element;
  errorWithMessage: JSX.Element;
  emailUsedSuccess: JSX.Element;
  processingEmails: JSX.Element;
  failedToProcessEmails: JSX.Element;
  refreshedEmailCache: JSX.Element;
  failedToRefreshEmailCache: JSX.Element;
}

export interface ErrorMapJDB {
  failure: JSX.Element;
  tooManyEBooks: JSX.Element;
  tooManyLibraryBooks: JSX.Element;
  codeUsed: JSX.Element;
  invalidCodeFormat: JSX.Element;
  invalidEmailFormat: JSX.Element;
  noCode: JSX.Element;
  noDomains: JSX.Element;
  noEmail: JSX.Element;
  duplicateRequest: JSX.Element;
  bigProblem: JSX.Element;
}
