// React Imports
import React, { useEffect, useState } from "react";

// Component Imports

type Question = string;
type Answer = string;
type Code = string;
type Error = string;

const App: React.FC = () => {
  const [question, setQuestion] = useState<Question>("Where did you buy this book?");
  const [answer, setAnswer] = useState<Answer | undefined>();
  const [code, setCode] = useState<Code | undefined>();
  const [error, setError] = useState<Error>();

  const returnToStart = () => {
    setQuestion("Where did you buy this book?");
    setError("");
  };

  const handleBookType = (bookType: string) => {
    console.log(bookType);
    if (bookType == "hardcover") {
      setQuestion("Hardcover Code");
    }
    if (bookType == "e-book") {
      setQuestion("E-book Code");
    }
    if (bookType == "library") {
      setQuestion("Library Code");
    }
  };

  const handleCode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //codes will probably have to be numbers
    setError("You probably didn't type all numbers.");

    setTimeout(() => {
      setError("");
    }, 2000);
    console.log(code);
  };

  return (
    <>
      <div>Here's the main question</div>
      <button onClick={returnToStart}>return to start</button>
      {question == "Where did you buy this book?" && (
        <div>
          <div>Where did you buy this book?</div>
          <button onClick={() => handleBookType("hardcover")}>I bought the hardcover!</button>
          <button onClick={() => handleBookType("e-book")}>I bought an e-book online</button>
          <button onClick={() => handleBookType("library")}>I borrowed from my library</button>
        </div>
      )}
      {question == "Hardcover Code" && (
        <div>
          <div>
            That's so cool! If you check out the back, you'll find a coupon code on the bottom left. This code works one time, so please
            don't mess this up.{" "}
          </div>
          <form onSubmit={handleCode}>
            <input onChange={(ev) => setCode(ev.target.value)}></input>
            <button>Submit</button>
          </form>
        </div>
      )}
      {question == "E-book Code" && (
        <div>
          <div>
            That's so cool! Check your receipt, you'll find a coupon code on there somewhere. This code works one time, so please don't mess
            this up.
          </div>
          <form onSubmit={handleCode}>
            <input onChange={(ev) => setCode(ev.target.value)}></input>
            <button></button>
          </form>
        </div>
      )}
      {question == "Library Code" && (
        <div>
          <div>Nice! Check the back of the book for your code. Warning: library codes are limited. </div>
          <form onSubmit={handleCode}>
            <input onChange={(ev) => setCode(ev.target.value)}></input>
            <button></button>
          </form>
        </div>
      )}
      {error ? <div>{error}</div> : ""}
    </>
  );
};

export default App;
