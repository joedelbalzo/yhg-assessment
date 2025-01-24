import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useBook } from "../BookContext";
import { bigStyles } from "../styles/Big-Styles";
import { CodeFormComponent, EbookCodeFormComponent, EmailFormComponent } from "../components/FormComponent";
import { useResponsiveStyles } from "../styles/StyleFunctions";
import { BookType, ContentMapJDB } from "../types";
// import { libraryStates, loadLibrary } from "../hooks/LibrarySearch";
import { capitalize } from "../hooks/capitalize";
import { useAutocomplete } from "../hooks/useAutoComplete";

export const useContentMap = (): ContentMapJDB => {
  const { bookType, setCurrentContent, setBookType, purchasedOrBorrowed, setPurchasedOrBorrowed } = useBook();
  const {
    stateInput,
    stateSuggestions,
    handleStateInput,
    handleStateSelect,
    libraryInput,
    filteredLibraries,
    handleLibraryInput,
    highlightedIndex,
    handleKeyDown,
    setFilteredLibraries,
    setStateSuggestions,
    validateStateInput,
    validateLibraryInput,
  } = useAutocomplete();
  const styles = useResponsiveStyles();

  /**
   * Handles the selection of book type and updates the state accordingly.
   * @param {BookType} booktype - The type of the book selected.
   */
  const handleBookType = useCallback(
    (booktype: BookType) => {
      if (booktype === "advanceReaderCopy") {
        setCurrentContent("enterARCCode");
        setBookType(booktype);
        setPurchasedOrBorrowed("borrowed");
      } else {
        setBookType(booktype);
        setCurrentContent("purchasedOrBorrowed");
        setPurchasedOrBorrowed("");
      }
    },
    [setBookType, setCurrentContent, setPurchasedOrBorrowed]
  );

  interface StyledButtonProps {
    children: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    ariaLabel?: string;
  }

  /**
   * StyledButton component with optional aria-label for accessibility.
   * @param {StyledButtonProps} props - The properties for the StyledButton component.
   */
  const StyledButton: React.FC<StyledButtonProps> = ({ children, onClick, ariaLabel }) => (
    <button
      id="jdb-ButtonId"
      style={{ ...styles.buttonIdStyle, ...styles.flexChildStyle }}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
    </button>
  );

  useEffect(() => {
    if (purchasedOrBorrowed) {
      if (bookType === "physicalCopy" && purchasedOrBorrowed == "purchased") {
        setCurrentContent("enterPhysicalCode");
      } else if (bookType == "advanceReaderCopy" && purchasedOrBorrowed == "borrowed") {
        setCurrentContent("enterARCCode");
      } else {
        setCurrentContent("enterDigitalCode");
      }
    }
  }, [bookType, purchasedOrBorrowed]);

  /**
   * Handles form submission to continue to the email input step.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleContinueToEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentContent("enterEmail");
  };

  /**
   * Handles library searching.
   *
   */
  // const handleStateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setStateInput(value);
  //   if (value.trim().length > 0) {
  //     const matches = libraryStates.filter((state) => state.toLowerCase().startsWith(value.toLowerCase()));
  //     setSuggestions(matches.slice(0, 5)); // Show up to 5 suggestions
  //   } else {
  //     setSuggestions([]);
  //   }
  // };

  // const handleStateSelect = async (state: string) => {
  //   setStateInput(state);
  //   setSuggestions([]);
  //   setLibraryInput("");
  //   setFilteredLibraries([]);

  //   const libraries = await loadLibrary(state);
  //   setLibraries(libraries);
  // };

  // const handleLibrarySelect = async (library: string) => {
  //   setLibraryInput(library);
  // };

  // useEffect(() => {
  //   if (libraryInput && libraries.length > 0) {
  //     const filtered = libraries.filter((lib) => lib.libraryname.toLowerCase().includes(libraryInput.toLowerCase())).slice(0, 5);
  //     setFilteredLibraries(filtered);
  //   } else {
  //     setFilteredLibraries([]);
  //   }
  // }, [libraryInput, libraries]);

  const contentMap: ContentMapJDB = {
    physicalOrDigital: (
      <>
        <div style={styles["questionStyle"]}> Select your book edition:</div>
        <div id="flex" style={styles["flexStyle"]}>
          <StyledButton onClick={() => handleBookType("advanceReaderCopy")} ariaLabel="Select Advance Reading Copy">
            Advance Reading Copy
          </StyledButton>
          <StyledButton onClick={() => handleBookType("physicalCopy")} ariaLabel="Select Physical Copy">
            Hardcover
          </StyledButton>
          <StyledButton onClick={() => handleBookType("digitalCopy")} ariaLabel="Select Digital Copy">
            Digital
          </StyledButton>
        </div>
      </>
    ),
    purchasedOrBorrowed: (
      <>
        <div style={styles["questionStyle"]}>Did you purchase the book or borrow from a library?</div>
        <div id="flex" style={styles["flexStyle"]}>
          <StyledButton onClick={() => setPurchasedOrBorrowed("purchased")} ariaLabel="Select Purchased">
            Purchased
          </StyledButton>
          {bookType == "digitalCopy" ?
            <StyledButton onClick={() => setPurchasedOrBorrowed("borrowed")} ariaLabel="Select Borrowed">
              Borrowed or Streaming
            </StyledButton> : <StyledButton onClick={() => setPurchasedOrBorrowed("borrowed")} ariaLabel="Select Borrowed">
              Library
            </StyledButton>}
        </div>
      </>
    ),
    enterARCCode: (
      <>
        <div style={styles["questionStyle"]}> Wonderful!</div>
        <div
          style={{
            ...styles["questionStyleSmaller"],
            fontSize: "calc(12px + 1vw)",
            lineHeight: "calc(12px + 1.5vw)",

            marginTop: "2rem",
            textAlign: "left",
            width: "85%",
          }}
        >
          Please enter the code you were given! Most of these codes were either mailed with your copy or emailed to you.
        </div>{" "}
        <div>
          <CodeFormComponent continueToEmailForm={handleContinueToEmail} />
        </div>
      </>
    ),
    enterPhysicalCode: (
      <>
        <div style={styles["questionStyle"]}> Wonderful!</div>
        <div
          style={{
            ...styles["questionStyleSmaller"],
            fontSize: "calc(12px + 1vw)",
            lineHeight: "calc(12px + 1.5vw)",

            marginTop: "2rem",
            textAlign: "left",
            width: "85%",
          }}
        >
          On the back of your book, you'll find a yellow sticker. Please peel back the sticker to reveal your code, and enter it here!{" "}
        </div>{" "}
        <div
          style={{
            ...styles["questionStyleSmaller"],
            margin: "2rem auto ",
            textAlign: "left",
            width: "80%",
          }}
        >
          Note: We understand that some codes may be printed backward. You can read them correctly by holding your sticker up to a light or
          using a mirror. We’re sorry for the trouble! For visual examples or more information,
          <a
            href="https://www.yourhiddengenius.com/faq#block-yui_3_17_2_1_1730734523784_58106"
            target="_blank"
            style={{ color: "whitesmoke" }}
          >
            please refer to our FAQ.
          </a>{" "}
        </div>
        <div>
          <CodeFormComponent continueToEmailForm={handleContinueToEmail} />
        </div>
      </>
    ),
    enterDigitalCode: (
      <>
        <div style={styles["questionStyle"]}> Nice!</div>
        {purchasedOrBorrowed === "purchased" ? (
          <div
            style={{
              ...styles["questionStyleSmaller"],
              textAlign: "left",
              width: "85%",
            }}
          >
            For most major retailers like Apple, Amazon, Google, B&N, and Kobo orders, towards the top of your receipt is an Order Number or an Invoice Number.
            <br />
            <ul>
              <li style={{ listStyleType: "circle", marginBottom: "8px" }}>
                Enter the last seven numbers or letters, with no spaces or special characters.
              </li>
              <li style={{ listStyleType: "circle", marginBottom: "8px" }}>
                If you have any issues with your code, email us at{" "}
                <a href="mailto:info@yourhiddengenius.com" style={{ color: "inherit", textDecoration: "underline" }}>
                  info@yourhiddengenius.com
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <div
            style={{
              ...styles["questionStyleSmaller"],
              marginTop: "2rem",
              textAlign: "left",
              width: "85%",
            }}
          >
            We'd love to know which library you borrowed from:
            <br />
            {bookType == "digitalCopy" && <span style={{ fontSize: "1rem" }}>For internet-only libraries, including streaming services like Spotify, Kindle Unlimited, Libby, and others, please enter "Digital" in both columns.</span>}
            {bookType !== "digitalCopy" && <span style={{ fontSize: "1rem" }}>If borrowed Internationally, please enter "International" in both columns.</span>}
            <br />
            <div style={styles.jdbLibraryForm}>
              <div style={{ flex: 1, position: "relative" }}>
                <label>
                  State:
                  <input
                    type="text"
                    placeholder="Enter State"
                    value={stateInput}
                    onChange={(e) => handleStateInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, stateSuggestions.length, (idx) => handleStateSelect(stateSuggestions[idx]))}
                    onBlur={() => {
                      validateStateInput();
                      setTimeout(() => setStateSuggestions([]), 100);
                    }}
                    style={styles.jdbLibraryFormLabel}
                    aria-haspopup="listbox"
                    aria-expanded={stateSuggestions.length > 0}
                  />
                  {stateSuggestions.length > 0 && (
                    <div role="listbox" style={styles.jdbLibraryFormInput}>
                      {stateSuggestions.map((state, idx) => (
                        <div
                          key={state}
                          role="option"
                          aria-selected={idx === highlightedIndex}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleStateSelect(state)}
                          style={{
                            padding: "0.5rem",
                            cursor: "pointer",
                            background: idx === highlightedIndex ? "#CCC" : "transparent",
                            color: idx === highlightedIndex ? "#253551" : "#FFF",
                            textShadow: idx === highlightedIndex ? "none" : "",
                            borderRadius: "4px",
                          }}
                        >
                          {state}
                        </div>
                      ))}
                    </div>
                  )}
                </label>
              </div>

              {/* Library Input */}
              <div style={{ flex: 1, position: "relative" }}>
                <label>
                  Library Name:
                  <input
                    type="text"
                    placeholder="Enter Library Name"
                    value={capitalize(libraryInput)}
                    onChange={(e) => handleLibraryInput(e.target.value)}
                    onBlur={() => {
                      validateLibraryInput();
                      setTimeout(() => setFilteredLibraries([]), 100);
                    }}
                    onKeyDown={(e) =>
                      handleKeyDown(e, filteredLibraries.length, (idx) => handleLibraryInput(filteredLibraries[idx].libraryname))
                    }
                    style={styles.jdbLibraryFormLabel}
                    aria-haspopup="listbox"
                    aria-expanded={filteredLibraries.length > 0}
                  />
                  {filteredLibraries.length > 0 && (
                    <div role="listbox" style={styles.jdbLibraryFormInput}>
                      {filteredLibraries.map((lib, idx) => (
                        <div
                          key={lib.libraryname}
                          role="option"
                          aria-selected={idx === highlightedIndex}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleLibraryInput(lib.libraryname)}
                          style={{
                            padding: "0.5rem",
                            cursor: "pointer",
                            background: idx === highlightedIndex ? "#ccc" : "transparent",
                            color: idx === highlightedIndex ? "#253551" : "#FFF",
                            textShadow: idx === highlightedIndex ? "none" : "",
                            borderRadius: "4px",
                          }}
                        >
                          {capitalize(lib.libraryname)}
                        </div>
                      ))}
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        <EbookCodeFormComponent continueToEmailForm={handleContinueToEmail} />
      </>
    ),
    enterEmail: (
      <>
        <div id="jdb-Questions" style={styles["questionStyle"]}>
          Enter your email address. <br />
          <br />
          <span style={{ fontSize: "16px", lineHeight: "18px" }}>
            We will use your email to send you test instructions and for recovering your unique URL if necessary.
          </span>
        </div>
        <div>
          <EmailFormComponent buttonTrigger={"handleCode"} />
        </div>
      </>
    ),
    checkEmailAddress: (
      <>
        <div id="jdb-Questions" style={styles["questionStyle"]}>
          Please enter the email address you used to redeem your code.
        </div>
        <div>
          <EmailFormComponent buttonTrigger={"checkLostEmail"} />
        </div>
      </>
    ),
    invalidCodeFormat: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        Your code's format is incorrect. Please double-check the instructions for entering your code, especially with eBooks. <br />
        <br /> If you're having trouble, please email us at{" "}
        <a href="mailto:info@yourhiddengenius.com" style={{ color: "inherit", textDecoration: "underline" }}>
          info@yourhiddengenius.com
        </a>
      </div>
    ),
    invalidEmailFormat: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        Your email format is incorrect. Please go back and confirm that you're entering a standard email@provider.com email address. <br />
        <br /> If you're having trouble, please email us at{" "}
        <a href="mailto:info@yourhiddengenius.com" style={{ color: "inherit", textDecoration: "underline" }}>
          info@yourhiddengenius.com
        </a>
      </div>
    ),
    invalidInput: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        You have an invalid input. Please make sure your code is correct, your email is correct, and if you selected a state and a library
        that you have input no special characters. <br />
        <br /> If you're having trouble, please email us at{" "}
        <a href="mailto:info@yourhiddengenius.com" style={{ color: "inherit", textDecoration: "underline" }}>
          info@yourhiddengenius.com
        </a>
      </div>
    ),
    error: (
      <div style={bigStyles.jdbErrorMessages}>
        You've reached a generic error. <br />
        <br />
        There's a good chance your code and email actually worked, and you either hit the back button and resubmitted unintentionally or
        there was a communication issue between here and our database. Please go back to the beginning, click{" "}
        <button
          onClick={() => setCurrentContent("checkEmailAddress")}
          style={{
            background: "none",
            border: "none",
            color: "#f15e22",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "inherit",
            padding: 0,
            margin: 0,
          }}
          aria-label="Signed up, but forgot your unique link? Click here."
        >
          "Signed up, but forgot your unique link? Click here."
        </button>
        , and try to recover your domain using your email address. <br />
        <br />
        If that doesn't work, please email us at{" "}
        <a href="mailto:info@yourhiddengenius.com" style={{ color: "inherit", textDecoration: "underline" }}>
          info@yourhiddengenius.com
        </a>{" "}
        and we'll fix this right away!
      </div>
    ),
  };

  return contentMap;
};
