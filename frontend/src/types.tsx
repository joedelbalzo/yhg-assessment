import { JSX } from "react";

// Basic types for question, code, email, and error handling
export type QuestionJDB = string;
export type CodeJDB = string;
export type EmailJDB = string;
export type ErrorJDB = string;
export type BookType = string;

// Mapping type for different question types
export type questionsJDB = {
  start: string;
  hardcover: string;
  ebook: string;
  library: string;
  email: string;
  success: string;
  failure: string;
  tooMany: string;
  emailUsed: string;
  codeUsed: string;
};

// Interface to map question types to JSX elements for dynamic content rendering
export interface ContentMapJDB {
  start: JSX.Element;
  hardcover: JSX.Element;
  ebook: JSX.Element;
  library: JSX.Element;
  email: JSX.Element;
  success: JSX.Element;
  failure: JSX.Element;
  tooMany: JSX.Element;
  emailUsed: JSX.Element;
  codeUsed: JSX.Element;
}
