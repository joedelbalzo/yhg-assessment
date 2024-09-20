const axios = require("axios");

const numberOfRequests = 200;
let count = 0;
let emailNumber = 181;

const interval = setInterval(async () => {
  if (count >= numberOfRequests) {
    clearInterval(interval);
    console.log("Finished submitting all requests.");
    return;
  }

  const codeNumber = Math.floor(Math.random() * 50) + 41; // Generates a number between 1 and 50
  const code = codeNumber.toString().padStart(6, "0");

  const fakeEmail = `zzz-user${emailNumber}@example.com`;
  const bookTypes = ["physicalCopy", "digitalCopy", "advanceReaderCopy"];
  const bookType = bookTypes[Math.floor(Math.random() * bookTypes.length)];

  // Randomly select purchasedOrBorrowed between 'purchased' and 'borrowed'
  const purchaseOptions = ["purchased", "borrowed"];
  const purchasedOrBorrowed = purchaseOptions[Math.floor(Math.random() * purchaseOptions.length)];

  count++;
  emailNumber++;

  const url = `http://localhost:3000/api/gas/${code}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
  };

  // console.log(`Sending request ${count} with email: ${fakeEmail} and code: ${code}`);

  const data = {
    email: fakeEmail,
    code: code,
    apiKey: "YOUR_API_KEY_HERE", // Replace with your actual API key
    purchasedOrBorrowed: purchasedOrBorrowed,
    bookType: bookType,
  };

  console.log(
    `Sending request ${count} with email: ${fakeEmail}, code: ${code}, bookType: ${bookType}, purchasedOrBorrowed: ${purchasedOrBorrowed}`
  );

  try {
    const response = await axios.post(url, data, config);
    console.log(`Submitted ${data.email}:`, response.data);
  } catch (error) {
    console.error(`Error on submission ${count}:`, error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
}, 250);
