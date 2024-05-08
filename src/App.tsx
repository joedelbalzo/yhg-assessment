// React Imports
import React, { useState } from "react";
// import { FadeComponent, FadeComponent2 } from "./FadeComponent";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

// Component Imports

type Question = string;
type Answer = string;
type Code = string;
type Error = string;

type questions = {
  start: string;
  hardcover: string;
  ebook: string;
  library: string;
  success: string;
  failure: string;
};
type contentMap = {
  start: string;
  hardcover: string;
  ebook: string;
  library: string;
  success: string;
  failure: string;
};

const questions = {
  start: "Where did you buy this book?",
  hardcover: "That's so cool! If you check out the back, you'll find a coupon code on the bottom left. Enter that here.",
  ebook: "That's so cool! Check your receipt, you'll find a coupon code on there somewhere.",
  library: "Nice! Check the back of the book for your code. Warning: library codes are limited, so please only do this once.",
};

const App: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState("start");
  const [answer, setAnswer] = useState<Answer | undefined>();
  const [code, setCode] = useState<Code | undefined>();
  const [error, setError] = useState<Error>();

  const returnToStart = () => {
    setCurrentQuestion("start");
    setError("");
  };

  const handleCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.get("https://tfoa-test.onrender.com/api/coupon-codes/");
      console.log(response);
      const index = response.data.indexOf(code);
      if (index !== -1) {
        console.log("success!!!");
        setCurrentQuestion("success");
      } else {
        console.log("no code!!!");
        setCurrentQuestion("failure");
      }
    } catch (error) {
      console.error("Fetching codes failed:", error);
    }
    setError("You probably didn't type all numbers.");
    setTimeout(() => {
      setError("");
    }, 2000);
    console.log(code);
  };

  const handleBookType = (type: string) => {
    setCurrentQuestion(type);
  };

  const contentMap = {
    start: (
      <>
        <div id="jdb-Questions">{questions.start}</div>
        <div id="flex">
          <button id="jdb-ButtonId" onClick={() => handleBookType("hardcover")}>
            I bought the hardcover!
          </button>
          <button id="jdb-ButtonId" onClick={() => handleBookType("ebook")}>
            I bought an e-book online
          </button>
          <button id="jdb-ButtonId" onClick={() => handleBookType("library")}>
            I borrowed from my library
          </button>
        </div>
      </>
    ),
    hardcover: (
      <div>
        <div id="jdb-Questions">{questions.hardcover}</div>
        <form id="jdb-Form" onSubmit={handleCode}>
          <input id="jdb-Input" value={code} onChange={(ev) => setCode(ev.target.value)} />
          <button id="jdb-Submit-ButtonId">Submit</button>
        </form>
      </div>
    ),
    ebook: (
      <div>
        <div>
          <div id="jdb-Questions">{questions.ebook}</div>

          <form id="jdb-Form" onSubmit={handleCode}>
            <input id="jdb-Input" onChange={(ev) => setCode(ev.target.value)}></input>
            <button id="jdb-Submit-ButtonId">Submit</button>
          </form>
        </div>
      </div>
    ),
    library: (
      <div>
        <div id="jdb-Questions">{questions.library}</div>

        <form id="jdb-Form" onSubmit={handleCode}>
          <input id="jdb-Input" onChange={(ev) => setCode(ev.target.value)}></input>
          <button id="jdb-Submit-ButtonId">Submit</button>
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

  return (
    <div className="jdb-Home-Div">
      <h2 style={{ textAlign: "center" }}>Hello! Your purchase likely came with a coupon code. Let's find it!</h2>
      <div className="animation-div">
        {/* <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0.1, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, duration: 0.5, bounce: 0, ease: "backInOut" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100, transition: { ease: "backInOut", delay: 0.2, duration: 0.8 } }}
          > */}
        {contentMap[currentQuestion]}
        {/* </motion.div>
        </AnimatePresence> */}
      </div>
      <button onClick={returnToStart}>Start Over</button>
    </div>
  );
};

export default App;
