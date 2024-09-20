import { JSX } from "react";

export type BookType = "physicalCopy" | "digitalCopy" | "advanceReaderCopy" | "";
export type NonEmptyBookType = Exclude<BookType, "">;
export type PurchasedOrBorrowed = "purchased" | "borrowed" | "";
export type NonEmptyPurchasedOrBorrowed = Exclude<PurchasedOrBorrowed, "">;

// Interface to map question types to JSX elements for dynamic content rendering
export interface ContentMapJDB {
  physicalOrDigital: JSX.Element;
  purchasedOrBorrowed: JSX.Element;
  enterPhysicalCode: JSX.Element;
  enterDigitalCode: JSX.Element;
  enterEmail: JSX.Element;
  checkEmailAddress: JSX.Element;
  //front end errors
  error: JSX.Element;
  invalidCodeFormat: JSX.Element;
  invalidEmailFormat: JSX.Element;
}

export interface CustomResponses {
  success: boolean;
  statusCode?: number;
  message: string;
  domain?: string;
  code?: number;
  email?: string;
  details?: string;
  error?: string;
}
