import { describe, it, expect, beforeAll, vi } from "vitest";

/**
 * Characterization tests for the importable pure surface of gas.ts.
 *
 * gas.ts hard-exits on missing env vars and runs a network cache-refresh plus a
 * puppeteer import at load time. To reach its exported functions with zero changes
 * to production code, this harness sets the required env and mocks the network
 * (googleapis) and puppeteer (./puppet) deps — all test-side only — then imports
 * the module dynamically so the env is in place first.
 *
 * Note: isValidEmail and isValidCode are NOT exported by gas.ts, so they cannot be
 * unit-tested without a code change. Only isValidInput and the squarespace-queue
 * accessors are reachable here.
 */

process.env.GOOGLE_APPLICATION_CREDENTIALS = "test-credentials.json";
process.env.SPREADSHEET_ID = "test-spreadsheet-id";
process.env.AS_LINK = "https://example.test/gas";
process.env.EMAIL_PROCESSING = "processing@example.test";
process.env.CACHE_REFRESH = "refresh@example.test";
process.env.API_KEY = "changeme";
process.env.REGEX_PHYSICAL_COPY = "^[0-9]{6}$";
process.env.REGEX_DIGITAL_COPY = "^[A-Za-z0-9]{7}$";
process.env.REGEX_ADVANCE_READER_COPY = "^ARC[0-9]{4}$";

vi.mock("./puppet", () => ({ processSquarespaceQueue: vi.fn() }));
vi.mock("googleapis", () => ({
  google: {
    auth: {
      GoogleAuth: class {
        async getClient() {
          return {};
        }
      },
    },
    sheets: () => ({
      spreadsheets: { values: { get: async () => ({ data: { values: [] } }) } },
    }),
  },
}));

let isValidInput: (input: string) => boolean;
let getNextSquarespaceEmail: () => string | null;

beforeAll(async () => {
  const mod = await import("./gas");
  isValidInput = mod.isValidInput;
  getNextSquarespaceEmail = mod.getNextSquarespaceEmail;
});

describe("isValidInput (backend)", () => {
  // Regex: /^[A-Za-z' -]+$/ applied to input.trim()
  it("accepts letters, spaces, apostrophes, and dashes", () => {
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
    expect(isValidInput("   ")).toBe(false);
  });

  it("rejects digits, underscores, and non-ASCII letters", () => {
    expect(isValidInput("John3")).toBe(false);
    expect(isValidInput("John_Doe")).toBe(false);
    expect(isValidInput("São Paulo")).toBe(false);
  });

  it("pins the quirk: a lone dash or apostrophe is accepted", () => {
    expect(isValidInput("-")).toBe(true);
    expect(isValidInput("'")).toBe(true);
  });
});

describe("getNextSquarespaceEmail (backend)", () => {
  it("returns null when the queue is empty", () => {
    expect(getNextSquarespaceEmail()).toBeNull();
  });
});
