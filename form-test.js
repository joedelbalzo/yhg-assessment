const axios = require("axios");

const numberOfRequests = 400;
let count = 0;

const interval = setInterval(async () => {
  if (count >= numberOfRequests) {
    clearInterval(interval);
    console.log("Finished submitting all requests.");
    return;
  }

  const random = Math.floor(100 + Math.random() * 5000);

  //for hardcovers
  // const fakeCode = `${count}`;

  //for library
  const fakeCode = "2018";
  const fakeEmail = `${random}test@example.com`;
  count++;

  const url = `http://localhost:3000/api/gas/${fakeCode}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
  };

  console.log(`Sending request ${count} with email: ${fakeEmail} and code: ${fakeCode}`);

  try {
    const response = await axios.post(
      url,
      {
        bookType: "library",
        code: fakeCode,
        email: fakeEmail,
      },
      config
    );
    console.log(`Submitted ${count}:`, response.data);

    if (response.data.message && response.data.message.includes("Duplicate request detected")) {
      console.log(`Duplicate detected for email: ${fakeEmail} and code: ${fakeCode}`);
    }
  } catch (error) {
    console.error("Error on submission:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
}, 50);
