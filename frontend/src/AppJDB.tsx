// React Imports
import React, { useEffect, useState } from "react";
// import { FadeComponent, FadeComponent2 } from "./FadeComponent";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { styles } from "./JDB-Styles";
import LoadingComponent from "./components/LoadingComponent";
import ReCaptcha from "./components/ReCaptchaComponent";
// Component Imports

type QuestionJDB = string;
type CodeJDB = string;
type EmailJDB = string;
type ErrorJDB = string;

type questionsJDB = {
  start: string;
  hardcover: string;
  ebook: string;
  library: string;
  success: string;
  failure: string;
};

interface ContentMapJDB {
  start: JSX.Element;
  hardcover: JSX.Element;
  ebook: JSX.Element;
  library: JSX.Element;
  success: JSX.Element;
  failure: JSX.Element;
}

const questions = {
  start: "Where did you buy this book?",
  hardcover:
    "That's so cool! If you check out the back, you'll find a sticker on the bottom left of your book. See that beautiful smiley face? There's a number there! Enter that here. A working code for this test is any 5 digit number",
  ebook:
    "That's so cool! Check your order number. Maybe I'll include a screenshot with this.. A working code for this test is any 7 digit number.",
  library:
    "Nice! Check the back of the book for your code. Warning: library codes are limited, so please only do this once. A working code for this test is 0001-0001.",
};

const AppJDB: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<keyof ContentMapJDB>("start");
  const [code, setCode] = useState<CodeJDB | undefined>();
  const [email, setEmail] = useState<EmailJDB | undefined>();
  const [confirmEmail, setConfirmEmail] = useState<EmailJDB | undefined>();
  const [error, setError] = useState<ErrorJDB | undefined>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleReset = () => {
    setCurrentQuestion("start");
    setError(undefined);
    setCode(undefined);
    setLoading(false);
    setSuccess(false);
    setIsVerified(false);
  };

  const handleVerification = () => {
    setIsVerified(true);
  };

  const handleCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    if (currentQuestion == "hardcover") {
      console.log("hardcover");
      const response = await axios.get(`/api/ccs/${code}`);
      console.log(response.status);
      if (response.status == 200) {
        setCurrentQuestion("success");
        setLoading(false);
      } else {
        setCurrentQuestion("failure");
        setLoading(false);
      }
    } else if (currentQuestion == "ebook") {
      console.log("ebook");
      const response = await axios.post(`/api/ccs/ebook/${code}`, { email: email });
      console.log(response.status);
      if (response.status == 200) {
        setCurrentQuestion("success");
        setLoading(false);
      } else {
        setCurrentQuestion("failure");
        setLoading(false);
      }
    } else if (currentQuestion == "library") {
      console.log("library");
      const response = await axios.get(`/api/ccs/library/${code}`);
      console.log(response.status);
      if (response.status == 200) {
        setCurrentQuestion("success");
        setLoading(false);
      } else {
        setCurrentQuestion("failure");
        setLoading(false);
      }
    }

    try {
      const response = await axios.get(`/api/ccs/${code}`);
      console.log(response.status);
      if (response.status == 200) {
        setCurrentQuestion("success");
        setLoading(false);
      } else {
        setCurrentQuestion("failure");
        setLoading(false);
      }
    } catch (error) {
      console.error("Fetching codes failed:", error);
      setError("oops we've got a problem");
    }
  };

  const handleBookType = (booktype: keyof ContentMapJDB) => {
    setCurrentQuestion(booktype);
  };

  const handleEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(email);
  };

  const form = {
    content: (
      <>
        <form id="jdb-Form" style={styles.jdbForm} onSubmit={handleCode}>
          <label id="jdb-Label" style={styles.jdbLabel}>
            Code:
          </label>
          <input id="jdb-Input" style={styles.jdbInput} defaultValue={code} value={code} onChange={(ev) => setCode(ev.target.value)} />

          <label id="jdb-Label" style={styles.jdbLabel}>
            Email address:
          </label>
          <input id="jdb-Input" style={styles.jdbInput} defaultValue={email} value={email} onChange={(ev) => setEmail(ev.target.value)} />
          <label id="jdb-Label" style={styles.jdbLabel}>
            Confirm Email:
          </label>
          <input id="jdb-Input" style={styles.jdbInput} onChange={(ev) => setConfirmEmail(ev.target.value)} />
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
        {form.content}
      </div>
    ),
    ebook: (
      <div>
        <div>
          <div id="jdb-Questions" style={styles.jdbQuestions}>
            {questions.ebook}
          </div>
          {form.content}
        </div>
      </div>
    ),
    library: (
      <div>
        <div id="jdb-Questions" style={styles.jdbQuestions}>
          {questions.library}
        </div>
        {form.content}
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
  };

  return (
    <div className="jdb-Home-Div" style={styles.jdbHomeDiv}>
      <h2 className="jdb-h2" style={styles.jdbH2}>
        Hello! Your purchase likely came with a coupon code. Let's find it!
      </h2>
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
      <button onClick={handleReset}>Start Over</button>
    </div>
  );
};

export default AppJDB;
