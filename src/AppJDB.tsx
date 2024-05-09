// React Imports
import React, { useState } from "react";
// import { FadeComponent, FadeComponent2 } from "./FadeComponent";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { styles } from "./JDB-Styles";

// Component Imports

type QuestionJDB = string;
type CodeJDB = string;
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
  hardcover: "That's so cool! If you check out the back, you'll find a coupon code on the bottom left. Enter that here.",
  ebook: "That's so cool! Check your receipt, you'll find a coupon code on there somewhere.",
  library: "Nice! Check the back of the book for your code. Warning: library codes are limited, so please only do this once.",
};

const AppJDB: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<keyof ContentMapJDB>("start");
  const [code, setCode] = useState<CodeJDB | undefined>();
  const [error, setError] = useState<ErrorJDB | undefined>();

  const handleCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.get("https://tfoa-test.onrender.com/api/coupon-codes/");
      const index = response.data.indexOf(code);
      if (index !== -1) {
        setCurrentQuestion("success");
      } else {
        setCurrentQuestion("failure");
      }
    } catch (error) {
      console.error("Fetching codes failed:", error);
      setError("oops we've got a problem");
    }
  };

  const handleBookType = (type: keyof ContentMapJDB) => {
    setCurrentQuestion(type);
  };

  const contentMap = {
    start: (
      <>
        <div id="jdb-Questions" style={styles.jdbQuestions}>
          {questions.start}
        </div>
        <div id="flex" style={styles.flex}>
          <button id="jdb-ButtonId" style={{ ...styles.jdbButtonId, ...styles.flexChild }} onClick={() => handleBookType("hardcover")}>
            I bought the hardcover!
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
        <form id="jdb-Form" style={styles.jdbForm} onSubmit={handleCode}>
          <input id="jdb-Input" style={styles.jdbInput} value={code} onChange={(ev) => setCode(ev.target.value)} />
          <button id="jdb-Submit-ButtonId" style={styles.jdbSubmitButtonId}>
            Submit
          </button>
        </form>
      </div>
    ),
    ebook: (
      <div>
        <div>
          <div id="jdb-Questions" style={styles.jdbQuestions}>
            {questions.ebook}
          </div>

          <form id="jdb-Form" style={styles.jdbForm} onSubmit={handleCode}>
            <input id="jdb-Input" style={styles.jdbInput} onChange={(ev) => setCode(ev.target.value)}></input>
            <button id="jdb-Submit-ButtonId" style={styles.jdbSubmitButtonId}>
              Submit
            </button>
          </form>
        </div>
      </div>
    ),
    library: (
      <div>
        <div id="jdb-Questions" style={styles.jdbQuestions}>
          {questions.library}
        </div>

        <form id="jdb-Form" style={styles.jdbForm} onSubmit={handleCode}>
          <input id="jdb-Input" style={styles.jdbInput} onChange={(ev) => setCode(ev.target.value)}></input>
          <button id="jdb-Submit-ButtonId" style={styles.jdbSubmitButtonId}>
            Submit
          </button>
        </form>
      </div>
    ),
    success: <div>Hey, nice work! Let's get some info from you and then you'll get an email from YouScience</div>,
    failure: (
      <div>
        Hmm. Something went wrong. Double check that code and let's try again. If you continue to have this problem, please reach out to
        HarperCollins.
      </div>
    ),
  };

  console.log("How far do we get? Line 150");

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
      <button onClick={() => setCurrentQuestion("start")}>Start Over</button>
    </div>
  );
};

export default AppJDB;
