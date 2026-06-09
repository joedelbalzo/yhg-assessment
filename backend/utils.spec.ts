import { describe, it, expect } from "vitest";
import { calculateCacheSize } from "./utils";

/**
 * Characterization tests for the cache memory-size estimator.
 *
 * Implementation: for each entry, build `${key}${JSON.stringify(value)}`, sum the
 * string lengths, multiply by 2 (UTF-16 byte approximation). Pure; the only other
 * `utils` export, `logMemoryUsage`, just logs and is not unit-tested.
 *
 * The code has run in production for ~2 years; these match its real output.
 */

describe("calculateCacheSize", () => {
  it("returns 0 for an empty cache", () => {
    expect(calculateCacheSize({})).toBe(0);
  });

  it("counts a single entry as (key + JSON value).length doubled", () => {
    // "a" (1) + '{"success":true}' (16) = 17 chars, x2 = 34 bytes
    expect(calculateCacheSize({ a: { success: true } as any })).toBe(34);
  });

  it("returns an even number (every length is doubled)", () => {
    const size = calculateCacheSize({ "x@y.com": { success: false, message: "Used Email" } as any });
    expect(size % 2).toBe(0);
    expect(size).toBeGreaterThan(0);
  });

  it("grows as entries are added", () => {
    const one = calculateCacheSize({ a: { success: true } as any });
    const two = calculateCacheSize({ a: { success: true } as any, b: { success: true } as any });
    expect(two).toBeGreaterThan(one);
  });
});
