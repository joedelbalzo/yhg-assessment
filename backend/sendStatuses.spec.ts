import { describe, it, expect } from "vitest";
import { customResponse, SendStatus } from "./sendStatuses";

/**
 * Characterization tests for the centralized API response table.
 *
 * `customResponse` is static data consumed across the redemption endpoints. These
 * pin its shape and the status codes the funnel depends on, so an accidental edit
 * (or a stray comma) is caught. The data is the source of truth.
 */

describe("customResponse", () => {
  const entries = Object.entries(customResponse) as [string, SendStatus][];

  it("defines a well-formed response for every key", () => {
    for (const [, r] of entries) {
      expect(typeof r.success).toBe("boolean");
      expect(typeof r.statusCode).toBe("number");
      expect(typeof r.message).toBe("string");
      expect(typeof r.details).toBe("string");
      expect(r.message.length).toBeGreaterThan(0);
      expect(r.details.length).toBeGreaterThan(0);
    }
  });

  it("marks the success responses successful with 200", () => {
    expect(customResponse.SUCCESS.success).toBe(true);
    expect(customResponse.SUCCESS.statusCode).toBe(200);
    expect(customResponse.CSV_SUCCESS.statusCode).toBe(200);
    expect(customResponse.CACHE_SUCCESS.statusCode).toBe(200);
  });

  it("marks failure responses unsuccessful", () => {
    expect(customResponse.USED_CODE.success).toBe(false);
    expect(customResponse.NOT_FOUND_EMAIL.success).toBe(false);
    expect(customResponse.INTERNAL_SERVER_ERROR.success).toBe(false);
  });

  it("pins the status codes the funnel relies on", () => {
    expect(customResponse.USED_CODE.statusCode).toBe(409);
    expect(customResponse.USED_EMAIL.statusCode).toBe(409);
    expect(customResponse.DUPLICATE_REQUEST_DETECTED.statusCode).toBe(409);
    expect(customResponse.LIBRARY_AS_PURCHASED.statusCode).toBe(403);
    expect(customResponse.PURCHASED_AS_LIBRARY.statusCode).toBe(403);
    expect(customResponse.INTERNAL_SERVER_ERROR.statusCode).toBe(500);
    expect(customResponse.INVALID_EMAIL_FORMAT.statusCode).toBe(404);
  });
});
