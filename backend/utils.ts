// utils.ts
import { CheckEmailResult } from "./gas"; // Import relevant types

/**
 * Calculate the approximate memory usage of the cache object.
 * @param emailCache Cache object containing emails and their respective data.
 * @returns The approximate size of the cache in bytes.
 */
export const calculateCacheSize = (emailCache: { [email: string]: CheckEmailResult }): number => {
  const cacheEntries = Object.entries(emailCache).map(([key, value]) => `${key}${JSON.stringify(value)}`);
  const totalLength = cacheEntries.reduce((acc, entry) => acc + entry.length, 0);
  return totalLength * 2; // Approximation: each character as 2 bytes (UTF-16)
};

/**
 * Log the memory usage of the cache and process to the console.
 * @param emailCache Cache object to measure.
 */
export const logMemoryUsage = (emailCache: { [email: string]: CheckEmailResult }): void => {
  const bytes = calculateCacheSize(emailCache);
  console.log(`Current cache size: ${bytes} bytes`);
  const used = process.memoryUsage();
  for (let key in used) {
    console.log(`${key}: ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`);
  }
};
