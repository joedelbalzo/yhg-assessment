const axios = require("axios");

const CACHE_REFRESH_EMAIL = "";

// Step 1: Clear and refresh the cache by sending a request to the existing endpoint
const clearAndRefreshCache = async () => {
  const url = `http://localhost:3000/api/gas/check-email`; // Existing endpoint for cache refresh
  const data = {
    email: CACHE_REFRESH_EMAIL, // Trigger cache refresh using this email
  };

  try {
    const response = await axios.post(url, data, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Response from cache refresh request:");
    console.log(response.data);
  } catch (error) {
    console.error("Error refreshing the cache:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
};

// Step 2: Verify the cache contents using the `/check-email` endpoint
const fetchCacheContents = async () => {
  const testEmails = ["", "", "test-email-3@example.com"];

  for (const email of testEmails) {
    const url = `http://localhost:3000/api/gas/check-email`;
    const data = { email };

    try {
      const response = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(`Cache contents for ${email}:`);
      console.log(response.data);
    } catch (error) {
      console.error(`Error fetching cache contents for ${email}:`, error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  }
};

// Main test function
const runTest = async () => {
  await clearAndRefreshCache();
  await fetchCacheContents();

  console.log("Test completed.");
};

// Run the test
runTest();
