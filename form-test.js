const axios = require("axios");

const numberOfRequests = 50;
let count = 0;
let emailNumber = 1;

const interval = setInterval(async () => {
  if (count >= numberOfRequests) {
    clearInterval(interval);
    console.log("Finished submitting all requests.");
    return;
  }

  let code = 100000 + Math.floor(Math.random() * 200 + 1);
  if (code % 2 === 0) {
    code++;
  }

  const fakeEmail = `TEST-zzz-user${emailNumber}@example.com`;
  const bookTypes = ["physicalCopy", "advanceReaderCopy"];
  const bookType = bookTypes[Math.floor(Math.random() * bookTypes.length)];

  const purchaseOptions = ["purchased", "borrowed"];
  const purchasedOrBorrowed = purchaseOptions[Math.floor(Math.random() * purchaseOptions.length)];

  const codeOptions = ["10001", "2018", code, code, code, code];
  const codeSubmission = codeOptions[Math.floor(Math.random() * codeOptions.length)];
  if (codeSubmission == "10001" || codeSubmission == "2018") {
    console.log(`
      
      CODE IS ${codeSubmission}
      
      `);
  }

  count++;
  emailNumber++;

  const url = `http://localhost:3000/api/gas/${code}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
  };

  const data = {
    email: fakeEmail,
    code: codeSubmission,
    purchasedOrBorrowed: purchasedOrBorrowed,
    bookType: bookType,
  };

  console.log(
    `Sending request ${count} with email: ${fakeEmail}, code: ${codeSubmission}, bookType: ${bookType}, purchasedOrBorrowed: ${purchasedOrBorrowed}`
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
