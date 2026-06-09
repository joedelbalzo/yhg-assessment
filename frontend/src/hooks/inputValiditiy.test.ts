import { describe, it, expect } from "vitest";
import { isValidEmail, isValidCode, isValidInput } from "./inputValiditiy";

/**
 * Characterization tests for the frontend input validators.
 *
 * These pin the behavior of code that has run in production for ~2 years.
 * The implementation is the source of truth: if a case is red, the expectation
 * here is wrong, not the code. Quirks are pinned deliberately, not "fixed".
 *
 * Note: isValidCode here is the frontend's static regex (/^[A-Za-z0-9]{4,7}$/).
 * The backend's isValidCode is env-driven and per book type; the two diverge by
 * design. This suite documents the frontend behavior only.
 */

describe("isValidEmail (frontend)", () => {
  // Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/  — not trimmed.
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("first.last@sub.domain.com")).toBe(true);
    expect(isValidEmail("a@b.c.d")).toBe(true);
  });

  it("is case-insensitive about letters", () => {
    expect(isValidEmail("A@B.CO")).toBe(true);
  });

  it("rejects structurally invalid addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("plainaddress")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("user@domain")).toBe(false); // no dot after @
    expect(isValidEmail("user@@example.com")).toBe(false);
  });

  it("rejects addresses containing whitespace (no trimming)", () => {
    expect(isValidEmail(" user@example.com")).toBe(false);
    expect(isValidEmail("user@example.com ")).toBe(false);
    expect(isValidEmail("user @example.com")).toBe(false);
    expect(isValidEmail("user@exam ple.com")).toBe(false);
  });
});

describe("isValidCode (frontend)", () => {
  // Regex: /^[A-Za-z0-9]{4,7}$/
  it("accepts 4 to 7 alphanumeric characters", () => {
    expect(isValidCode("abcd")).toBe(true); // 4, lower bound
    expect(isValidCode("1234")).toBe(true);
    expect(isValidCode("a1b2c3")).toBe(true);
    expect(isValidCode("ABCD")).toBe(true);
    expect(isValidCode("abc1234")).toBe(true); // 7, upper bound
  });

  it("rejects lengths outside 4 to 7", () => {
    expect(isValidCode("abc")).toBe(false); // 3
    expect(isValidCode("abcdefgh")).toBe(false); // 8
    expect(isValidCode("")).toBe(false);
  });

  it("rejects non-alphanumeric characters", () => {
    expect(isValidCode("ab cd")).toBe(false); // space
    expect(isValidCode("ab-cd")).toBe(false); // dash
    expect(isValidCode("abcd!")).toBe(false);
  });
});

describe("isValidInput (frontend)", () => {
  // Regex: /^[A-Za-z' -]+$/ applied to input.trim()
  it("accepts names with letters, spaces, apostrophes, and dashes", () => {
    expect(isValidInput("John")).toBe(true);
    expect(isValidInput("New York")).toBe(true);
    expect(isValidInput("O'Brien")).toBe(true);
    expect(isValidInput("Jean-Luc Picard")).toBe(true);
  });

  it("trims before validating", () => {
    expect(isValidInput("  Mary  ")).toBe(true);
  });

  it("rejects empty or whitespace-only input", () => {
    expect(isValidInput("")).toBe(false);
    expect(isValidInput("   ")).toBe(false); // trims to ""
  });

  it("rejects digits and disallowed punctuation", () => {
    expect(isValidInput("John3")).toBe(false);
    expect(isValidInput("John_Doe")).toBe(false);
    expect(isValidInput("John.Doe")).toBe(false);
    expect(isValidInput("123")).toBe(false);
  });

  it("rejects non-ASCII letters", () => {
    expect(isValidInput("São Paulo")).toBe(false);
  });

  it("pins the quirk: a lone dash or apostrophe is accepted", () => {
    expect(isValidInput("-")).toBe(true);
    expect(isValidInput("'")).toBe(true);
  });
});
