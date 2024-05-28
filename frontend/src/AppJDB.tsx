// React Imports
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios, { AxiosError } from "axios";

// Component Imports
import { styles } from "./JDB-Styles";
import LoadingComponent from "./components/LoadingComponent";
import ReCaptcha from "./components/ReCaptchaComponent";
import FormComponent from "./components/FormComponent";

//Type imports
import { QuestionJDB, CodeJDB, EmailJDB, ErrorJDB, questionsJDB, ContentMapJDB } from "./types";

const questions = {
  start: "How did you come upon this book?",
  hardcover: (
    <>
      That's great! On the back, you'll find a sticker on the bottom left of your book. See that beautiful smiley face? There's a number
      there! Enter that here.
      <br />
      <span style={{ fontSize: "24px" }}>A working code for this test is any 5 digit number</span>
    </>
  ),

  ebook: (
    <>
      That's great! Check your order number. Maybe I'll include a screenshot with this.
      <br />
      <span style={{ fontSize: "24px" }}>A working code for this test is any 7 digit number</span>
    </>
  ),
  library: (
    <>
      Nice! Check the back of the book for your code.{" "}
      <span style={{ fontSize: "24px" }}>Warning: library codes are limited, so please only do this once.</span>
      <br />
      <span style={{ fontSize: "24px" }}>A working code for this test is 0001-0001</span>
    </>
  ),
};

const AppJDB: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<keyof ContentMapJDB>("start");
  const [bookType, setBookType] = useState("");
  const [code, setCode] = useState<CodeJDB>("");
  const [email, setEmail] = useState<EmailJDB>("");
  const [confirmEmail, setConfirmEmail] = useState<EmailJDB>("");
  const [error, setError] = useState<ErrorJDB | undefined>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleReset = () => {
    if (currentQuestion == "ebook" || currentQuestion == "hardcover" || currentQuestion == "library") {
      setCurrentQuestion("start");
      setError(undefined);
      setCode("");
      setLoading(false);
      setSuccess(false);
      setIsVerified(false);
    } else if (
      currentQuestion == "failure" ||
      currentQuestion == "tooMany" ||
      currentQuestion == "emailUsed" ||
      currentQuestion == "codeUsed"
    ) {
      if (bookType) {
        setCurrentQuestion(bookType);
      } else {
        setCurrentQuestion("start");
      }
      setError(undefined);
    }
  };

  const handleVerification = () => {
    setIsVerified(true);
  };

  const handleCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const axiosCall = async () => {
      switch (currentQuestion) {
        case "hardcover":
          return axios.get(`/api/ccs/${code}`);
        case "ebook":
          return axios.post(`./api/ccs/ebook/${code}`, { email: email });
        case "library":
          return axios.get(`/api/ccs/library/${code}`);
        default:
          throw new Error("Invalid question type");
      }
    };

    try {
      const response = await axiosCall();
      if (response.status === 200) {
        setCurrentQuestion("success");
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Handle specific server-side errors
          if (error.response.status === 403) {
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
              default:
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
      } else {
        console.error("Error:", error.message);
        setError("An unexpected error occurred.");
        setCurrentQuestion("failure");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookType = (booktype: keyof ContentMapJDB) => {
    setBookType(booktype);
    setCurrentQuestion(booktype);
  };

  // const handleEmail = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   console.log(email);
  // };

  const form = {
    content: (
      <>
        <form id="jdb-Form" style={styles.jdbForm} onSubmit={handleCode}>
          <input
            id="jdb-Input"
            style={styles.jdbInput}
            placeholder="Enter your code."
            defaultValue={code || ""}
            value={code}
            onChange={(ev) => setCode(ev.target.value)}
          />

          <input
            id="jdb-Input"
            style={styles.jdbInput}
            placeholder="Enter your e-mail address"
            defaultValue={email || ""}
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <input
            id="jdb-Input"
            style={styles.jdbInput}
            placeholder="Confirm your e-mail address"
            defaultValue={confirmEmail || ""}
            onChange={(ev) => setConfirmEmail(ev.target.value)}
          />
          {confirmEmail == email ? (
            <div style={styles.emailsDontMatch}></div>
          ) : (
            <div style={styles.emailsDontMatch}>Emails don't match.</div>
          )}

          <ReCaptcha onVerify={handleVerification} />
          {loading ? (
            <button id="jdb-Submit-ButtonId" style={styles.jdbSubmitButtonId}>
              <LoadingComponent height="20px" width="20px" borderWidth="2px" />
            </button>
          ) : (
            <button id="jdb-Submit-ButtonId" disabled={!isVerified} style={styles.jdbSubmitButtonId}>
              Submit
            </button>
          )}
        </form>
      </>
    ),
  };

  const contentMap = {
    start: (
      <>
        <h2 className="jdb-h2" style={styles.jdbH2}>
          Hello! Your purchase likely came with a coupon code. Let's find it!
        </h2>
        <div id="jdb-Questions" style={styles.jdbQuestions}>
          {questions.start}
        </div>
        <div id="flex" style={styles.flex}>
          <button id="jdb-ButtonId" style={{ ...styles.jdbButtonId, ...styles.flexChild }} onClick={() => handleBookType("hardcover")}>
            I bought the hardcover
          </button>
          <button id="jdb-ButtonId" style={{ ...styles.jdbButtonId, ...styles.flexChild }} onClick={() => handleBookType("ebook")}>
            I bought an e-book online
          </button>
          <button id="jdb-ButtonId" style={{ ...styles.jdbButtonId, ...styles.flexChild }} onClick={() => handleBookType("library")}>
            I borrowed from my library
          </button>
        </div>
      </>
    ),
    hardcover: (
      <div>
        <div id="jdb-Questions" style={styles.jdbQuestions}>
          {questions.hardcover}
        </div>
        <FormComponent
          handleCode={handleCode}
          code={code}
          setCode={setCode}
          email={email}
          setEmail={setEmail}
          confirmEmail={confirmEmail}
          setConfirmEmail={setConfirmEmail}
          isVerified={isVerified}
          setIsVerified={setIsVerified}
          loading={loading}
        />
      </div>
    ),
    ebook: (
      <div>
        <div>
          <div id="jdb-Questions" style={styles.jdbQuestions}>
            {questions.ebook}
          </div>
          <FormComponent
            handleCode={handleCode}
            code={code}
            setCode={setCode}
            email={email}
            setEmail={setEmail}
            confirmEmail={confirmEmail}
            setConfirmEmail={setConfirmEmail}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            loading={loading}
          />
        </div>
      </div>
    ),
    library: (
      <div>
        <div id="jdb-Questions" style={styles.jdbQuestions}>
          {questions.library}
        </div>
        <FormComponent
          handleCode={handleCode}
          code={code}
          setCode={setCode}
          email={email}
          setEmail={setEmail}
          confirmEmail={confirmEmail}
          setConfirmEmail={setConfirmEmail}
          isVerified={isVerified}
          setIsVerified={setIsVerified}
          loading={loading}
        />
      </div>
    ),

    success: (
      <div>
        <div style={{ textAlign: "center", width: "90%" }}>
          Hey, nice work! Let's get some info from you and then you'll get an email from YouScience.
        </div>
      </div>
    ),
    failure: (
      <div>
        Hmm. Something went wrong. Double check that code and let's try again. If you continue to have this problem, please reach out to
        HarperCollins.
      </div>
    ),
    tooMany: (
      <div>
        Hmm. It seems like there have been too many e-book codes used. Email us at assessments@yourhiddengenius.com with a screenshot of
        your receipt from your retailer and we'll get you straightened out immediately.
      </div>
    ),
    emailUsed: (
      <div>
        Hmm. It seems like you've already signed up with this email address. Please check your email and spam folders for an email from
        YouScience. If you're still having issues, email us at assessments@yourhiddengenius.com with a screenshot of your receipt from your
        retailer and we'll get you straightened out immediately.
      </div>
    ),
    codeUsed: (
      <div>
        Hmm. It looks like this code has already been used. Please check your email and spam folders for an email from YouScience. Email us
        at assessments@yourhiddengenius.com with a screenshot of your receipt from your retailer and we'll get you straightened out
        immediately.
      </div>
    ),
  };

  return (
    <>
      <div className="jdb-Home-Div" style={styles.jdbHomeDiv}>
        <div className="jdb-animation-div" style={styles.jdbAnimationDiv}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0.1, y: 10 }}
              transition={{ type: "spring", damping: 20, stiffness: 100, duration: 0.5, bounce: 0, ease: "backInOut" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100, transition: { ease: "backInOut", delay: 0.2, duration: 0.8 } }}
            >
              {contentMap[currentQuestion]}
            </motion.div>
          </AnimatePresence>
        </div>
        <button style={styles.jdbResetButton} onClick={handleReset}>
          &#8592; Back
        </button>
      </div>
    </>
  );
};

export default AppJDB;
