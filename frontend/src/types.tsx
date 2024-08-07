import { JSX } from "react";

// Basic types for question, code, email, and error handling
export type QuestionJDB = string;
export type CodeJDB = string;
export type EmailJDB = string;
export type ErrorJDB = string;
export type BookType = "ebook" | "hardcover" | "library" | "mediaAndPress" | "";
export type NonEmptyBookType = Exclude<BookType, "">;

// Mapping type for different question types
export type questionsJDB = {
  start: string;
  hardcover: string;
  ebook: string;
  library: string;
  mediaAndPress: string;
  email: string;
  success: string;
  failure: string;
  tooManyEBooks: string;
  tooManyLibraryBooks: string;
  emailUsedSuccess: string;
  codeUsed: string;
  invalidCodeFormat: string;
  invalidEmailFormat: string;
  noCode: string;
  noDomains: string;
  noEmail: string;
  checkEmailAddress: string;
};

// Interface to map question types to JSX elements for dynamic content rendering
export interface ContentMapJDB {
  start: JSX.Element;
  hardcover: JSX.Element;
  ebook: JSX.Element;
  library: JSX.Element;
  mediaAndPress: JSX.Element;
  email: JSX.Element;
  success: JSX.Element;
  failure: JSX.Element;
  tooManyEBooks: JSX.Element;
  tooManyLibraryBooks: JSX.Element;
  emailUsedSuccess: JSX.Element;
  codeUsed: JSX.Element;
  invalidCodeFormat: JSX.Element;
  invalidEmailFormat: JSX.Element;
  noCode: JSX.Element;
  noDomains: JSX.Element;
  noEmail: JSX.Element;
  checkEmailAddress: JSX.Element;
}
