import { describe, it, expect } from "vitest";
import { capitalize } from "./capitalize";

/**
 * Characterization tests for `capitalize`, used to display library names that
 * are stored lowercase in the library data.
 *
 * Implementation: text.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
 *
 * The code has run in production for ~2 years; these pin its real behavior,
 * including quirks. The implementation is the source of truth, not these tests.
 */

describe("capitalize", () => {
  it("upper-cases the first letter of each space-separated word", () => {
    expect(capitalize("new york")).toBe("New York");
    expect(capitalize("hello")).toBe("Hello");
  });

  it("leaves already-capitalized and all-caps text as-is", () => {
    expect(capitalize("Hello")).toBe("Hello");
    expect(capitalize("HELLO")).toBe("HELLO");
  });

  it("only changes the first character; the remainder is untouched", () => {
    // It does not lower-case the rest of the word.
    expect(capitalize("mcADAMS")).toBe("McADAMS");
    expect(capitalize("o'brien")).toBe("O'brien");
  });

  it("pins the quirk: only letters after a space are capitalized, not after hyphens", () => {
    expect(capitalize("jean-luc")).toBe("Jean-luc");
  });

  it("returns an empty string for empty input", () => {
    expect(capitalize("")).toBe("");
  });

  it("preserves extra, leading, and trailing spaces", () => {
    expect(capitalize("a  b")).toBe("A  B"); // double space kept
    expect(capitalize(" hello")).toBe(" Hello"); // leading space kept
    expect(capitalize("hello ")).toBe("Hello "); // trailing space kept
  });

  it("leaves a non-letter leading character unchanged", () => {
    expect(capitalize("123 abc")).toBe("123 Abc");
  });
});
