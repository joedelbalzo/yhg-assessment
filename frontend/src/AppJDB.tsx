// React Imports
import React, { useEffect, useState, useRef, CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios, { AxiosError } from "axios";

// Component Imports
import { bigStyles } from "./Big-Styles";
import { smallStyles } from "./Small-Styles";
import { CodeFormComponent, EmailFormComponent } from "./components/FormComponent";
import { DownButton } from "./components/DownButton";

//Type imports
import { BookType, CodeJDB, EmailJDB, ErrorJDB, ContentMapJDB, NonEmptyBookType } from "./types";

function isAxiosError(error: any): error is AxiosError {
  return axios.isAxiosError(error);
}

const questions = {
  start: "Select your book type:",
  hardcover: (
    <>
      Nice!
      <br />
      <span style={{ fontSize: "16px" }}>Insert description of where the code is. Enter it here.</span>
      <br />
      <span style={{ fontSize: "16px" }}>A working code for this test is any number</span>
    </>
  ),

  ebook: (
    <>
      Nice! Check your order number. Maybe I'll include a screenshot with this.
      <br />
      <span style={{ fontSize: "16px" }}>A working code for this test is any 7 digit number</span>
    </>
  ),
  library: (
    <>
      Nice! Check the back of the book for your code. <br />
      <span style={{ fontSize: "16px" }}>Library codes are limited, so please only do this once.</span>
      <br />
      <span style={{ fontSize: "16px" }}>A working code for this test is 0001-0001</span>
    </>
  ),
};

const AppJDB: React.FC = () => {
  const [beginAssessment, setBeginAssessment] = useState<boolean>(false);

  const [currentQuestion, setCurrentQuestion] = useState<keyof ContentMapJDB>("start");
  const [bookType, setBookType] = useState<BookType>("");
  const [code, setCode] = useState<CodeJDB>("");
  const [email, setEmail] = useState<EmailJDB>("");
  const [confirmEmail, setConfirmEmail] = useState<EmailJDB>("");
  const [error, setError] = useState<ErrorJDB | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [uniqueURL, setUniqueURL] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapsible = () => {
    setBeginAssessment(!beginAssessment);
  };

  const maxHeight = "550px";
  const collapsibleStyles: CSSProperties = {
    height: beginAssessment ? "0px" : "auto",
    ...(windowWidth > 768 ? bigStyles.jdbHomeDiv : smallStyles.jdbHomeDiv),
  };

  const handleReset = () => {
    if (["ebook", "hardcover", "library"].includes(currentQuestion)) {
      setCurrentQuestion("start");
      setError(undefined);
      setCode("");
      setLoading(false);
      setSuccess(false);
      setIsVerified(false);
    } else if (["failure", "tooMany", "emailUsed", "codeUsed"].includes(currentQuestion)) {
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

  const handleCodeSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const axiosCall = async () => {
      console.log("book type", bookType);
      switch (bookType) {
        case "hardcover":
          return axios.post(`/api/ccs/hardcover/${code}`, { email: email });
        case "ebook":
          return axios.post(`/api/ccs/ebook/${code}`, { email: email });
        case "library":
          return axios.post(`/api/ccs/library/${code}`, { email: email });
        default:
          throw new Error("Invalid question type");
      }
    };

    try {
      const response = await axiosCall();
      console.log("Success response:", response);
      if (response.status === 200) {
        setCurrentQuestion("success");
        setUniqueURL(response.data);
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Caught Error:");
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 403 || error.response.status === 400) {
            switch (error.response.data) {
              case "Too many codes used. Contact admin":
                setCurrentQuestion("tooMany");
                break;
              case "This email has been used. Contact admin":
                setCurrentQuestion("emailUsed");
                break;
              case "This code has been used. Contact admin":
                setCurrentQuestion("codeUsed");
                break;
              case "Invalid code format":
                setCurrentQuestion("invalidFormat");
                break;
              default:
                console.log("landed on the default axios error");
                setCurrentQuestion("failure");
            }
          } else {
            console.error(`Server error: ${error.response.status}`);
            setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
            setCurrentQuestion("failure");
          }
        } else if (error.request) {
          console.error("Network Error: No response was received");
          setError("Network error, please try again later.");
          setCurrentQuestion("failure");
        } else {
          console.error("Request setup error:", error.message);
          setError("An error occurred setting up your request. Please try again.");
          setCurrentQuestion("failure");
        }
      } else if (error instanceof Error) {
        console.error("Not an Axios error:", error.message);
        setError("An unexpected error occurred: " + error.message);
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

  const handleBookType = (bookType: NonEmptyBookType) => {
    setBookType(bookType);
    setCurrentQuestion(bookType);
  };

  const contentMap = {
    start: (
      <>
        <h2 className="jdb-h2" style={windowWidth > 768 ? bigStyles.jdbH2 : smallStyles.jdbH2}>
          Welcome! If you have a copy of the book, it came with a coupon code.
        </h2>
        <div id="jdb-Questions" style={windowWidth > 768 ? bigStyles.jdbQuestions : smallStyles.jdbQuestions}>
          {questions.start}
        </div>
        <div id="flex" style={windowWidth > 768 ? bigStyles.flex : smallStyles.flex}>
          <button
            id="jdb-ButtonId"
            style={{
              ...(windowWidth > 768 ? bigStyles.jdbButtonId : smallStyles.jdbButtonId),
              ...(windowWidth > 768 ? bigStyles.flexChild : smallStyles.flexChild),
            }}
            onClick={() => handleBookType("hardcover")}
          >
            I bought the hardcover
          </button>
          <button
            id="jdb-ButtonId"
            style={{
              ...(windowWidth > 768 ? bigStyles.jdbButtonId : smallStyles.jdbButtonId),
              ...(windowWidth > 768 ? bigStyles.flexChild : smallStyles.flexChild),
            }}
            onClick={() => handleBookType("ebook")}
          >
            I bought an e-book online
          </button>
          <button
            id="jdb-ButtonId"
            style={{
              ...(windowWidth > 768 ? bigStyles.jdbButtonId : smallStyles.jdbButtonId),
              ...(windowWidth > 768 ? bigStyles.flexChild : smallStyles.flexChild),
            }}
            onClick={() => handleBookType("library")}
          >
            I borrowed from my library
          </button>
        </div>
      </>
    ),
    hardcover: (
      <div>
        <div id="jdb-Questions" style={windowWidth > 768 ? bigStyles.jdbQuestions : smallStyles.jdbQuestions}>
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
          <div id="jdb-Questions" style={windowWidth > 768 ? bigStyles.jdbQuestions : smallStyles.jdbQuestions}>
            {questions.ebook}
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
      </div>
    ),
    library: (
      <div>
        <div id="jdb-Questions" style={windowWidth > 768 ? bigStyles.jdbQuestions : smallStyles.jdbQuestions}>
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
    email: (
      <>
        <div id="jdb-Questions" style={windowWidth > 768 ? bigStyles.jdbQuestions : smallStyles.jdbQuestions}>
          Enter your email address. <br />
          <span style={{ fontSize: "16px" }}>We need this to have your test emailed to you</span>
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
      <div>
        <div style={windowWidth > 768 ? bigStyles.jdbQuestions : smallStyles.jdbQuestions}>
          Hey, nice work! Here's your unique URL to get started setting up your YouScience dashboard:
        </div>
        <div style={{ textAlign: "center", width: "90%", margin: "2rem auto" }}>
          <a href={uniqueURL} target="_blank">
            {uniqueURL}
          </a>
        </div>
        <div style={{ textAlign: "center", width: "90%", margin: "2rem auto" }}>We've also emailed this to you, just in case! </div>
        <div style={{ textAlign: "center", width: "90%", margin: "2rem auto" }}>
          Feel free to minimize this section when you're done. Best of luck with your assessment -- remember to relax!{" "}
        </div>
      </div>
    ),
    failure: (
      <div style={bigStyles.jdbErrorMessages}>
        Hmm. Something went wrong. <br />
        <br /> Double check that code and let's try again. If you continue to have this problem, please reach out to HarperCollins.
      </div>
    ),
    tooMany: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        It seems like there have been too many e-book codes used. Email us at assessments@yourhiddengenius.com with a screenshot of your
        receipt from your retailer and we'll get you straightened out immediately.
      </div>
    ),
    emailUsed: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        It seems like you've already signed up with this email address. Please check your email and spam folders for an email from
        YouScience. If you're still having issues, email us at assessments@yourhiddengenius.com with a screenshot of your receipt from your
        retailer and we'll get you straightened out immediately.
      </div>
    ),
    codeUsed: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        It looks like this code has already been used. Please check your email and spam folders for an email from YouScience. Email us at
        assessments@yourhiddengenius.com with a screenshot of your receipt from your retailer and we'll get you straightened out
        immediately.
      </div>
    ),
    invalidFormat: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        Your code's format is incorrect. Please double check the instructions for entering your code. This is especially funky with e-books.
      </div>
    ),
  };

  return (
    <>
      <h1 style={windowWidth > 768 ? bigStyles.jdbH1 : smallStyles.jdbH1}>Have a code? Register for your assessment here!</h1>
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
            <div className="jdb-animation-div" style={windowWidth > 768 ? bigStyles.jdbAnimationDiv : smallStyles.jdbAnimationDiv}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0.1, y: 10 }}
                  // transition={{ type: "spring", damping: 20, stiffness: 100, duration: 0.5, bounce: 0, ease: "backInOut" }}
                  transition={{ type: "spring", damping: 20, stiffness: 100, duration: 0.5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100, transition: { ease: "backInOut", delay: 0.2, duration: 0.8 } }}
                >
                  {contentMap[currentQuestion]}
                </motion.div>
              </AnimatePresence>
            </div>

            {!uniqueURL && currentQuestion != "start" && (
              <button
                id="jdb-ResetButton"
                style={windowWidth > 768 ? bigStyles.jdbResetButton : smallStyles.jdbResetButton}
                onClick={handleReset}
              >
                &#8592; Back
              </button>
            )}
            {!uniqueURL && currentQuestion == "start" && (
              <button id="jdb-PostSubmitButton" style={windowWidth > 768 ? bigStyles.jdbContinueButton : smallStyles.jdbContinueButton}>
                Don't have a code yet? Continue below to learn more about the book and purchasing options!
              </button>
            )}
            {!uniqueURL && currentQuestion == "success" && (
              <button id="jdb-PostSubmitButton" style={windowWidth > 768 ? bigStyles.jdbContinueButton : smallStyles.jdbContinueButton}>
                <a
                  href="https://yourhiddengenius.com/home"
                  style={windowWidth > 768 ? bigStyles.noDecorationLinks : smallStyles.noDecorationLinks}
                >
                  Continue to the <i>Your Hidden Genius</i> website!
                </a>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppJDB;
