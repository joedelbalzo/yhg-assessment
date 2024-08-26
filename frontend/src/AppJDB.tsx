// React Imports
import React, { useEffect, useState, useRef, CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios, { AxiosError } from "axios";

// Component Imports
import { bigStyles } from "./Big-Styles";
import { smallStyles } from "./Small-Styles";
import { CodeFormComponent, EbookCodeFormComponent, EmailFormComponent } from "./components/FormComponent";
import { DownButton } from "./components/DownButton";
import ReCaptcha from "./components/ReCaptchaComponent";
import LoadingComponent from "./components/LoadingComponent";

//Type imports
import { BookType, CodeJDB, EmailJDB, ErrorJDB, ContentMapJDB, NonEmptyBookType } from "./types";

function isAxiosError(error: any): error is AxiosError {
  return axios.isAxiosError(error);
}

const AppJDB: React.FC = () => {
  const [beginAssessment, setBeginAssessment] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<keyof ContentMapJDB>("start");
  const [bookType, setBookType] = useState<BookType>("");
  const [code, setCode] = useState<CodeJDB>("");
  const [email, setEmail] = useState<EmailJDB>("");
  const [confirmEmail, setConfirmEmail] = useState<EmailJDB>("");
  const [error, setError] = useState<ErrorJDB | undefined>();
  // const [emailOptIn, setEmailOptIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [uniqueURL, setUniqueURL] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const debouncedHandleResize = debounce(handleResize, 200);
    window.addEventListener("resize", debouncedHandleResize);
    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, []);

  useEffect(() => {
    if (window.location.href === "https://www.yourhiddengenius.com/assessment") {
      setBeginAssessment(true);
    }
  }, []);

  function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const toggleCollapsible = () => {
    setBeginAssessment(!beginAssessment);
  };

  const maxHeight = "auto";
  const collapsibleStyles: CSSProperties = {
    minHeight: beginAssessment ? "0px" : "auto",
    ...(windowWidth > 768 ? bigStyles.jdbHomeDiv : smallStyles.jdbHomeDiv),
  };

  const handleReset = () => {
    if (["ebook", "hardcover", "library", "mediaAndPress"].includes(currentQuestion)) {
      setCurrentQuestion("start");
      setError(undefined);
      setCode("");
      setLoading(false);
      setSuccess(false);
      setIsVerified(false);
    } else if (
      [
        "failure",
        "tooMany",
        "emailUsedSuccess",
        "codeUsed",
        "invalidCodeFormat",
        "invalidEmailFormat",
        "noCode",
        "noDomains",
        "noEmail",
        "checkEmailAddress",
        "processingEmails",
        "failedToProcessEmails",
        "refreshedEmailCache",
        "failedToRefreshEmailCache",
      ].includes(currentQuestion)
    ) {
      if (bookType !== "") {
        setCurrentQuestion(bookType);
      } else {
        setCurrentQuestion("start");
      }
      setError(undefined);
    } else if (currentQuestion === "email") {
      if (bookType !== "") {
        setCurrentQuestion(bookType);
      }
    }
  };

  const continueToEmailForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentQuestion("email");
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidCode = (code: string) => {
    const codeRegex = /^\d{1,10}$/; // Adjust this regex according to the valid code format
    return codeRegex.test(code);
  };

  //original code submission
  const handleCodeSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!isValidEmail(cleanEmail)) {
      setError("Invalid email format");
      setCurrentQuestion("invalidEmailFormat");
      setLoading(false);
      return;
    }
    if (!isValidCode(cleanCode)) {
      setError("Invalid code format");
      setCurrentQuestion("invalidCodeFormat");
      setLoading(false);
      return;
    }

    const axiosCall = async () => {
      const apiEnv = import.meta.env.VITE_API_ENV || "development";
      const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
      const url = `${baseURL}/gas/${cleanCode}`;
      try {
        let response;
        if (bookType == "mediaAndPress") {
          response = await axios.post(url, { email: cleanEmail, bookType: "library" });
        } else {
          response = await axios.post(url, { email: cleanEmail, bookType });
        }
        return response;
      } catch (error) {
        console.error("Error during the API call", error);
        throw error;
      }
    };

    try {
      const response = await axiosCall();
      if (response.status === 200) {
        if (response.data.message == "email has been used") {
          setCurrentQuestion("emailUsedSuccess");
          setUniqueURL(response.data.domain);
        } else if (response.data.message == "code has been used") {
          setCurrentQuestion("emailUsedSuccess");
          setUniqueURL(response.data.domain);
        } else {
          setCurrentQuestion("success");
          setUniqueURL(response.data.domain);
        }
      } else {
        console.error("Unhandled status code:", response.status);
        throw new Error(`Unhandled status: ${response.status}`);
      }
    } catch (error) {
      console.error("Caught Error:");
      if (axios.isAxiosError(error)) {
        handleAxiosError(error);
      } else if (error instanceof Error) {
        console.error("Not an Axios error:", error.message);
        setError(`An unexpected error occurred: ${error.message}`);
        setCurrentQuestion("failure");
      } else {
        console.error("Error of unknown type:", error);
        setError("An unexpected error occurred. Please check the logs.");
        setCurrentQuestion("failure");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    let isCode = isValidCode(cleanEmail);
    let isEmail = isValidEmail(cleanEmail);
    let codeOrEmail: string;

    if (isCode) {
      codeOrEmail = "code";
    } else if (isEmail) {
      codeOrEmail = "email";
    } else {
      setError("failure");
      setCurrentQuestion("failure");
      setLoading(false);
      return;
    }
    const axiosCall = async () => {
      const apiEnv = import.meta.env.VITE_API_ENV || "development";
      const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
      const url = `${baseURL}/gas/check-email`;
      const cleanEmail = email.trim().toLowerCase();

      try {
        const response = await axios.post(url, { email: cleanEmail, codeOrEmail });
        return response;
      } catch (error) {
        console.error("Error during the API call", error);
        throw error;
      }
    };
    try {
      const response = await axiosCall();
      // console.log(response);
      if (response.status === 200) {
        if (response.data.message == "email has been used") {
          setCurrentQuestion("emailUsedSuccess");
          setUniqueURL(response.data.domain);
        } else if (response.data.message == "code has been used") {
          setCurrentQuestion("emailUsedSuccess");
          setUniqueURL(response.data.domain);
        } else if (response.data.message == "email CSV processed") {
          setCurrentQuestion("processingEmails");
          setUniqueURL(response.data.domain);
        } else if (response.data.message == "problem processing CSV") {
          setCurrentQuestion("failedToProcessEmails");
          setUniqueURL(response.data.domain);
        } else if (response.data.message == "Cache refreshed") {
          setCurrentQuestion("refreshedEmailCache");
          setUniqueURL(response.data.domain);
        } else {
          setCurrentQuestion("success");
          setUniqueURL(response.data.domain);
        }
      } else {
        console.error("Unhandled status code:", response.status);
        throw new Error(`Unhandled status: ${response.status}`);
      }
    } catch (error) {
      console.error("Caught Error:");
      if (axios.isAxiosError(error)) {
        handleAxiosError(error);
      } else if (error instanceof Error) {
        console.error("Not an Axios error:", error.message);
        setError(`An unexpected error occurred: ${error.message}`);
        setCurrentQuestion("failure");
      } else {
        console.error("Error of unknown type:", error);
        setError("An unexpected error occurred. Please check the logs.");
        setCurrentQuestion("failure");
      }
    } finally {
      setLoading(false);
    }
  };

  //UPDATE THESE ERRORS!!!
  const errorHandlers: { [key: string]: keyof ContentMapJDB } = {
    "This code was not found. Contact us.": "noCode",
    "EBooks have surpassed their usage limit. Contact us.": "tooManyEBooks",
    "Library book has surpassed its usage limit. Contact us.": "tooManyLibraryBooks",
    "Email already used": "emailUsedSuccess",
    "This code has been used. Contact us.": "codeUsed",
    "No available domains. Contact us.": "noDomains",
    "Invalid code format": "invalidCodeFormat",
    "Invalid email address.": "invalidEmailFormat",
    "email CSV processed": "processingEmails",
    "problem processing CSV": "failedToProcessEmails",
  };
  const handleAxiosError = (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`Server error: ${status}`, data);
      setError(`Server error: ${status} - ${data || error}`);
      const curError: keyof ContentMapJDB = errorHandlers[data] || "failure";
      setCurrentQuestion(curError);
    } else if (error.request) {
      console.error("Network Error: No response was received");
      setError("Network error, please try again later.");
      setCurrentQuestion("failure");
    } else {
      console.error("Request setup error:", error.message);
      setError("An error occurred setting up your request. Please try again.");
      setCurrentQuestion("failure");
    }
  };

  const handleBookType = (bookType: NonEmptyBookType) => {
    setBookType(bookType);
    setCurrentQuestion(bookType);
  };

  const questionStyle = windowWidth > 768 ? bigStyles.jdbQuestions : smallStyles.jdbQuestions;
  const questionStyleSmaller = windowWidth > 768 ? bigStyles.jdbQuestionSmallerFont : smallStyles.jdbQuestionSmallerFont;
  const flexStyle = windowWidth > 768 ? bigStyles.flex : smallStyles.flex;
  const buttonIdStyle = windowWidth > 768 ? bigStyles.jdbButtonId : smallStyles.jdbButtonId;
  const flexChildStyle = windowWidth > 768 ? bigStyles.flexChild : smallStyles.flexChild;
  const h1Style = windowWidth > 768 ? bigStyles.jdbH1 : smallStyles.jdbH1;
  const animationDivStyle = windowWidth > 768 ? bigStyles.jdbAnimationDiv : smallStyles.jdbAnimationDiv;
  const resetButtonStyle = windowWidth > 768 ? bigStyles.jdbResetButton : smallStyles.jdbResetButton;
  const continueButtonStyle = windowWidth > 768 ? bigStyles.jdbContinueButton : smallStyles.jdbContinueButton;
  const noDecorationLinksStyle = windowWidth > 768 ? bigStyles.noDecorationLinks : smallStyles.noDecorationLinks;
  const jdbCodeFormStyle = windowWidth > 768 ? bigStyles.jdbCodeForm : smallStyles.jdbCodeForm;
  const jdbInputStyle = windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput;
  const reCaptchaStyle = windowWidth > 768 ? bigStyles.reCaptcha : smallStyles.reCaptcha;
  const jdbSubmitButtonIdStyle = windowWidth > 768 ? bigStyles.jdbSubmitButtonId : smallStyles.jdbSubmitButtonId;

  const questions = {
    start: "SELECT YOUR BOOK FORMAT",
    hardcover: (
      <>
        <div style={questionStyle}> Nice! Please enter your code here.</div>
        {/* <br /> */}
        {/* <span style={questionStyleSmaller}>A working code for this test is any six digit number, leading with a zero.</span> */}
      </>
    ),

    ebook: (
      <>
        <div style={questionStyle}> Nice!</div>

        <div style={{ ...questionStyleSmaller, textAlign: "left", width: "95%" }}>
          For Amazon, Google, B&N, and Kobo orders, towards the top of your receipt is an Order Number or an Invoice Number.
          <br />
          <ul>
            <li style={{ listStyleType: "circle", marginBottom: "8px" }}>
              For Amazon and Google orders, enter the last seven numbers or letters.
            </li>
            <li style={{ listStyleType: "circle", marginBottom: "8px" }}>For B&N and Kobo orders, enter the 10-digit order number.</li>
            <li style={{ listStyleType: "circle", marginBottom: "8px" }}>
              For other vendors, please email us at info@yourhiddengenius.com
            </li>
          </ul>
        </div>
        <div style={{ ...questionStyleSmaller, textAlign: "left", width: "95%" }}>
          In the second field, please tell us the first word of the third chapter.
        </div>
      </>
    ),
    library: (
      <>
        <div style={questionStyle}> Nice! Enter your code here.</div>
        {/* <br />
        <span style={questionStyleSmaller}>A working code for this test is 10001</span> */}
      </>
    ),
    mediaAndPress: (
      <>
        <div style={questionStyle}> Nice! Your code was in the insert mailed with your book. Please enter it here!</div>
        {/* <br />
        <span style={questionStyleSmaller}>A working code for this test is 2018</span> */}
      </>
    ),
  };

  const contentMap = {
    start: (
      <>
        <div id="jdb-Questions" style={questionStyle}>
          {questions.start}
        </div>
        <div id="flex" style={flexStyle}>
          <button
            id="jdb-ButtonId"
            style={{
              ...buttonIdStyle,
              ...flexChildStyle,
            }}
            onClick={() => handleBookType("hardcover")}
          >
            Hardcover
          </button>
          <button
            id="jdb-ButtonId"
            style={{
              ...buttonIdStyle,
              ...flexChildStyle,
            }}
            onClick={() => handleBookType("ebook")}
          >
            eBook
          </button>
          <button
            id="jdb-ButtonId"
            style={{
              ...buttonIdStyle,
              ...flexChildStyle,
            }}
            onClick={() => handleBookType("library")}
          >
            Library
          </button>
          <button
            id="jdb-ButtonId"
            style={{
              ...buttonIdStyle,
              ...flexChildStyle,
            }}
            onClick={() => handleBookType("mediaAndPress")}
          >
            Media and Press
          </button>
        </div>
      </>
    ),
    hardcover: (
      <div>
        <div id="jdb-Questions" style={questionStyle}>
          {questions.hardcover}
        </div>
        <CodeFormComponent
          continueToEmailForm={continueToEmailForm}
          code={code}
          setCode={setCode}
          isVerified={isVerified}
          setIsVerified={setIsVerified}
          loading={loading}
          windowWidth={windowWidth}
        />
      </div>
    ),
    ebook: (
      <div>
        <div>
          <div id="jdb-Questions" style={questionStyle}>
            {questions.ebook}
          </div>
          <EbookCodeFormComponent
            continueToEmailForm={continueToEmailForm}
            code={code}
            setCode={setCode}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            loading={loading}
            windowWidth={windowWidth}
          />
        </div>
      </div>
    ),
    library: (
      <div>
        <div id="jdb-Questions" style={questionStyle}>
          {questions.library}
        </div>
        <CodeFormComponent
          continueToEmailForm={continueToEmailForm}
          code={code}
          setCode={setCode}
          isVerified={isVerified}
          setIsVerified={setIsVerified}
          loading={loading}
          windowWidth={windowWidth}
        />
      </div>
    ),
    mediaAndPress: (
      <div>
        <div id="jdb-Questions" style={questionStyle}>
          {questions.mediaAndPress}
        </div>
        <CodeFormComponent
          continueToEmailForm={continueToEmailForm}
          code={code}
          setCode={setCode}
          isVerified={isVerified}
          setIsVerified={setIsVerified}
          loading={loading}
          windowWidth={windowWidth}
        />
      </div>
    ),
    email: (
      <>
        <div id="jdb-Questions" style={questionStyle}>
          Enter your email address. <br />
          <br />
          <span style={{ fontSize: "16px" }}>
            We will use your email to send you test instructions and for recovering your unique URL if necessary.
          </span>
        </div>
        <EmailFormComponent
          handleCodeSubmission={handleCodeSubmission}
          email={email}
          setEmail={setEmail}
          confirmEmail={confirmEmail}
          setConfirmEmail={setConfirmEmail}
          loading={loading}
          windowWidth={windowWidth}
        />
      </>
    ),
    success: (
      <div style={questionStyle}>
        <div>Hey, nice work! Here's your unique URL to get started with YouScience:</div>
        <div style={bigStyles.successLink}>
          <a href={uniqueURL} target="_blank">
            {uniqueURL}
          </a>
        </div>
        <div style={questionStyleSmaller}>
          If you navigate from this page without your unique domain, don't worry! You can always come back here and retrieve it with your
          email address.{" "}
        </div>
        <div style={{ ...questionStyleSmaller, cursor: "pointer" }} onClick={() => setBeginAssessment(false)}>
          Click here to minimize this section.
        </div>
      </div>
    ),
    failure: (
      <div style={bigStyles.jdbErrorMessages}>
        Hmm. Something went wrong. <br />
        <br /> You've reached a generic error, meaning your email and code are just fine. <br />
        <br />
        There's a good chance your code and email actually worked, and it's just a communication issue between us and them. Please go back
        to the beginning and try to recover your domain using your email address. If that doesn't work, please email us at
        info@yourhiddengenius.com and we'll fix this right away!
      </div>
    ),
    tooManyEBooks: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        It seems like there have been too many e-book codes used. Email us at info@yourhiddengenius.com with a screenshot of your receipt
        from your retailer and we'll get it straightened out immediately.
      </div>
    ),
    tooManyLibraryBooks: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        It seems like this library book has been used too many times. <br />
        <br /> If you're having trouble, please email us at info@yourhiddengenius.com
      </div>
    ),
    emailUsedSuccess: (
      <>
        <div style={questionStyle}>Hey, you're already signed up!</div>
        <div style={bigStyles.successLink}>
          <a href={uniqueURL} target="_blank">
            {uniqueURL}
          </a>
        </div>
      </>
    ),
    codeUsed: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        It looks like this code has already been used. Please check your email and spam folders for an email from YouScience. Email us at
        info@yourhiddengenius.com with a screenshot of your receipt from your retailer and we'll get you straightened out immediately.
      </div>
    ),
    invalidCodeFormat: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        Your code's format is incorrect. Please double check the instructions for entering your code. Especially with EBooks. <br />
        <br /> If you're having trouble, please email us at info@yourhiddengenius.com
      </div>
    ),
    invalidEmailFormat: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        Your email format is incorrect. Please go back and confirm that you're entering a standard email@provider.com email address. <br />
        <br /> If you're having trouble, please email us at info@yourhiddengenius.com
      </div>
    ),
    noCode: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        That code is either invalid or does not exist in our system. <br />
        <br /> Please make sure you're entering only numbers, with no letters or symbols, and try again! <br />
        <br /> If you're having trouble, please email us at info@yourhiddengenius.com
      </div>
    ),
    noDomains: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        Our system shows there are no available tests. That can't be right! Please try again. <br />
        <br /> If you're having trouble, please email us at info@yourhiddengenius.com
      </div>
    ),
    checkEmailAddress: (
      <>
        <div id="jdb-Questions" style={questionStyle}>
          Enter your email address or your code. <br />
        </div>
        <form id="jdb-Form" style={jdbCodeFormStyle} onSubmit={handleCheckEmail}>
          <input
            id="jdb-Input"
            style={jdbInputStyle}
            placeholder="Your email or code"
            value={email || ""}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <div style={reCaptchaStyle}>
            <ReCaptcha onVerify={setIsVerified} />{" "}
          </div>
          {loading ? (
            <button id="jdb-Submit-ButtonId" style={jdbSubmitButtonIdStyle}>
              <LoadingComponent height="20px" width="20px" borderWidth="2px" />
            </button>
          ) : (
            <button
              id="jdb-Submit-ButtonId"
              disabled={!isVerified || email.length < 1}
              style={{ ...jdbSubmitButtonIdStyle, color: !(isVerified && email.length >= 1) ? "gray" : "white" }}
            >
              Submit
            </button>
          )}
        </form>
      </>
    ),
    noEmail: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        We don't have that email in our database. Please try a different email address. If you're positive it was that one, please reach out
        to...
      </div>
    ),
    processingEmails: <div style={bigStyles.jdbErrorMessages}>Emails processing.</div>,
    failedToProcessEmails: <div style={bigStyles.jdbErrorMessages}>Failed to process emails.</div>,
    refreshedEmailCache: <div style={bigStyles.jdbErrorMessages}>Refreshed cache.</div>,
    failedToRefreshEmailCache: <div style={bigStyles.jdbErrorMessages}>Failed to refresh cache.</div>,
  };

  return (
    <>
      {!beginAssessment && <h1 style={h1Style}>HAVE A CODE FROM THE BOOK? GET YOUR INCLUDED ASSESSMENT HERE</h1>}
      <div style={beginAssessment ? bigStyles.clicked : bigStyles.unclicked} onClick={toggleCollapsible}>
        <DownButton />
      </div>
      <AnimatePresence>
        {beginAssessment && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: maxHeight }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              opacity: { duration: 0.3 },
              layout: { duration: 0.5, ease: "easeInOut" },
            }}
            className="jdb-Home-Div"
            style={collapsibleStyles}
          >
            <div className="jdb-animation-div" style={animationDivStyle}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0.1, y: 10 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100, duration: 0.5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100, transition: { ease: "backInOut", delay: 0.2, duration: 0.8 } }}
                >
                  {contentMap[currentQuestion]}
                  {!uniqueURL && currentQuestion != "start" && (
                    <button id="jdb-ResetButton" style={resetButtonStyle} onClick={handleReset}>
                      &#8592; Back
                    </button>
                  )}
                  {!uniqueURL && currentQuestion == "start" && (
                    <>
                      <button
                        id="jdb-PostSubmitButton"
                        style={{
                          ...continueButtonStyle,
                          textDecoration: "underline",
                          textDecorationColor: "#f15e22",
                          textDecorationThickness: "1px",
                          textUnderlineOffset: "4px",
                          marginTop: "1rem",
                        }}
                      >
                        <span
                          onClick={() => setCurrentQuestion("checkEmailAddress")}
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          Signed up, but forgot your unique link? Click here.
                        </span>
                      </button>
                      <button
                        id="jdb-PostSubmitButton"
                        style={{ ...continueButtonStyle, marginTop: "2rem" }}
                        onClick={() => window.open("https://www.yourhiddengenius.com/preorder", "_blank")}
                      >
                        <span style={{ whiteSpace: "nowrap" }}>
                          Don't have a code yet? Purchase your copy of <span style={{ fontStyle: "italic" }}>Your Hidden Genius</span> below
                          to receive your assessment code.{" "}
                        </span>
                      </button>
                    </>
                  )}
                  {!uniqueURL && currentQuestion == "success" && (
                    <button id="jdb-PostSubmitButton" style={continueButtonStyle}>
                      <a href="https://yourhiddengenius.com/home" style={noDecorationLinksStyle}>
                        Continue to the <i>Your Hidden Genius</i> website!
                      </a>
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div
              style={{
                margin: "0 auto 8px",
                width: " 80%",
                textAlign: "center",
                fontSize: "7px",
                color: "white",
                fontWeight: "lighter",
                textShadow: "1px 1px 1px gray",
              }}
            >
              This site is protected by reCAPTCHA and the Google{" "}
              <a href="https://policies.google.com/privacy" target="_blank" style={{ color: "inherit", textUnderlineOffset: "2px" }}>
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="https://policies.google.com/privacy" target="_blank" style={{ color: "inherit", textUnderlineOffset: "2px" }}>
                Terms of Service
              </a>{" "}
              apply.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppJDB;
