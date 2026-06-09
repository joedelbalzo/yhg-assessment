import { describe, it, expect } from "vitest";
import { libraryStates, loadLibrary } from "./LibrarySearch";

/**
 * Characterization tests for the library lookup.
 *
 * `loadLibrary` chooses one of four code-split data modules by the state's INDEX
 * in `libraryStates` (idx <= 12, <= 29, <= 43, else), not by spelling. These pin
 * that coupling and the two non-importing sentinel branches. The implementation
 * is the source of truth; these match it.
 */

describe("libraryStates", () => {
  it("is a non-empty list that includes real states", () => {
    expect(Array.isArray(libraryStates)).toBe(true);
    expect(libraryStates).toContain("Alabama");
    expect(libraryStates).toContain("New York");
  });

  it("ends with the Digital and International sentinels", () => {
    expect(libraryStates[libraryStates.length - 2]).toBe("Digital");
    expect(libraryStates[libraryStates.length - 1]).toBe("International");
  });
});

describe("loadLibrary - sentinel branches (no module import)", () => {
  it("returns a single Digital entry for 'Digital'", async () => {
    expect(await loadLibrary("Digital")).toEqual([{ state: "Digital", libraryname: "Digital" }]);
  });

  it("returns a single International entry for 'International'", async () => {
    expect(await loadLibrary("International")).toEqual([{ state: "International", libraryname: "International" }]);
  });
});

describe("loadLibrary - index-to-module coupling", () => {
  const expectLibraryArray = (result: any) => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("state");
    expect(result[0]).toHaveProperty("libraryname");
  };

  it("loads a state from the A–H bucket (Alabama)", async () => {
    expectLibraryArray(await loadLibrary("Alabama"));
  });

  it("pins a KNOWN BUG: Hawaii's data is in the A–H file but its index routes it to I–M, so it resolves to undefined", async () => {
    // `export const Hawaii` lives in librariesAtoH.ts, but loadLibrary sends index 13
    // to librariesItoM (idx <= 12 -> AtoH, else idx <= 29 -> ItoM). The AtoH file holds
    // 14 states (through Hawaii) while the router's first cutoff is 12, so Hawaii falls
    // through the gap. Not fixed here — this pins the current production behavior.
    expect(await loadLibrary("Hawaii")).toBeUndefined();
  });

  it("loads a multi-word state name by stripping its spaces (New York)", async () => {
    expectLibraryArray(await loadLibrary("New York"));
  });

  it("loads a state from the Q–Z bucket (Texas)", async () => {
    expectLibraryArray(await loadLibrary("Texas"));
  });

  it("pins the no-match behavior: an unknown state resolves to undefined", async () => {
    // indexOf returns -1, which falls into the first bucket; the module has no
    // matching export, so the result is undefined rather than an error.
    expect(await loadLibrary("Nowhere")).toBeUndefined();
  });
});
