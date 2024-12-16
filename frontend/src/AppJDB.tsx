// React Imports
import React, { useEffect, useState, CSSProperties, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

// Component Imports
import { useBook } from "./BookContext";
import { bigStyles } from "./styles/Big-Styles";
import { smallStyles } from "./styles/Small-Styles";
import { useContentMap } from "./content/contentMap";
import { DownButton } from "./components/DownButton";
import { useResponsiveStyles } from "./styles/StyleFunctions";
import { isValidCode, isValidEmail, isValidInput } from "./hooks/inputValiditiy";

// Type imports
import { ContentMapJDB, CustomResponses } from "./types";
import { libraryStates } from "./hooks/LibrarySearch";

/**
 * Main application component for the Your Hidden Genius assessment.
 * Manages state and handles user interactions throughout the assessment process.
 *
 * @returns {JSX.Element} The rendered component.
 */
const AppJDB: React.FC = () => {
  const {
    bookType,
    purchasedOrBorrowed,
    email,
    code,
    stateInput,
    libraryInput,
    setIsVerified,
    setUniqueURL,
    currentContent,
    setCurrentContent,
    windowWidth,
    setHandleCodeSubmission,
    setError,
    setLoading,
    setSuccess,
    setBookType,
    setPurchasedOrBorrowed,
  } = useBook();

  const [beginAssessment, setBeginAssessment] = useState<boolean>(false);
  const [databaseResponse, setDatabaseResponse] = useState<CustomResponses | null>(null);
  const contentMap = useContentMap();
  const styles = useResponsiveStyles();

  /**
   * Automatically begins the assessment if the URL matches the assessment page.
   */
  useEffect(() => {
    if (window.location.href === "https://www.yourhiddengenius.com/assessment") {
      setBeginAssessment(true);
    }
  }, []);

  /**
   * Toggles the collapsible assessment section.
   */
  const toggleCollapsible = () => {
    setBeginAssessment((prev) => !prev);
  };
  /**
   * Handles keydown events for the toggle button to ensure accessibility.
   * @param {React.KeyboardEvent<HTMLDivElement>} event - The keyboard event.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCollapsible();
    }
  };

  /**
   * Logs when the database response is updated.
   */
  useEffect(() => {
    console.log("database updated");
  }, [databaseResponse]);

  const maxHeight = "auto";

  /**
   * Memoized styles for the collapsible section to improve performance.
   */
  const collapsibleStyles: CSSProperties = useMemo(
    () => ({
      minHeight: beginAssessment ? "0px" : "auto",
      ...(windowWidth > 768 ? bigStyles.jdbHomeDiv : smallStyles.jdbHomeDiv),
    }),
    [beginAssessment, windowWidth]
  );

  /**
   * Resets the assessment to a previous state based on the current content.
   */
  const handleReset = () => {
    setLoading(false);
    setSuccess(false);
    setIsVerified(false);

    if (currentContent === "enterEmail") {
      if (bookType === "physicalCopy") {
        setCurrentContent("enterPhysicalCode");
      } else if (bookType === "digitalCopy") {
        setCurrentContent("enterDigitalCode");
      } else if (bookType === "advanceReaderCopy") {
        setCurrentContent("enterARCCode");
      }
    } else if (currentContent === "enterARCCode" && bookType === "advanceReaderCopy") {
      setCurrentContent("physicalOrDigital");
      setBookType("");
      setPurchasedOrBorrowed("");
    } else if (currentContent === "enterPhysicalCode" || currentContent === "enterDigitalCode") {
      setCurrentContent("purchasedOrBorrowed");
      setPurchasedOrBorrowed("");
    } else if (currentContent === "purchasedOrBorrowed" || currentContent === "checkEmailAddress") {
      setCurrentContent("physicalOrDigital");
      setBookType("");
    } else if (currentContent === "error") {
      setCurrentContent("enterEmail");
    }

    if (databaseResponse) {
      setDatabaseResponse(null);
    }
  };

  /**
   * Handles the submission of code or email, making API calls to verify.
   *
   * @param {string} buttonTrigger - The button that triggered the submission.
   */
  const handleCodeSubmission = useCallback(
    async (buttonTrigger: string) => {
      setLoading(true);
      const cleanEmail = email ? email.trim().toLowerCase() : "";
      let cleanCode = code ? code.trim() : "";
      let cleanLibrary = libraryInput ? libraryInput.trim() : "";
      let cleanState = stateInput ? stateInput.trim() : "";

      if ((bookType == "physicalCopy" || bookType == "digitalCopy") && purchasedOrBorrowed == "borrowed") {
        cleanCode = import.meta.env.VITE_LIBRARY_CODE;
      }

      if (cleanEmail && !isValidEmail(cleanEmail)) {
        setError("invalidEmailFormat");
        setCurrentContent("invalidEmailFormat");
        setLoading(false);
        return;
      }

      if (cleanCode && !isValidCode(cleanCode)) {
        setError("invalidCodeFormat");
        setCurrentContent("invalidCodeFormat");
        setLoading(false);
        return;
      }

      if (libraryInput && !isValidInput(libraryInput) && !isValidInput(stateInput)) {
        setError("invalidCodeFormat");
        setCurrentContent("invalidCodeFormat");
        setLoading(false);
        return;
      }
      /**
       * Makes an API call to verify the code or email.
       *
       * @returns {Promise<CustomResponses>} The response from the API.
       */
      const axiosCall = async (): Promise<CustomResponses> => {
        const apiEnv = import.meta.env.VITE_API_ENV || "development";
        const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
        const url = buttonTrigger == "handleCode" ? `${baseURL}/gas/${cleanCode}` : `${baseURL}/gas/check-email`;

        const payload: any = {
          email: cleanEmail,
          bookType,
          purchasedOrBorrowed,
        };
        if (cleanState) payload.libraryState = cleanState;
        if (cleanLibrary) payload.libraryName = cleanLibrary;

        try {
          let response = await axios.post<CustomResponses>(url, payload);

          setDatabaseResponse(response.data);
          if (response.data.domain) {
            setUniqueURL(response.data.domain);
          }
          return response.data;
        } catch (error) {
          console.error("Error during the API call", error);
          setCurrentContent("error");
          throw error;
        }
      };

      try {
        const response = await axiosCall();
        setDatabaseResponse(response);
        console.log(response);
      } catch (error) {
        console.error("Caught Error:", error);
        setCurrentContent("error");
      } finally {
        setLoading(false);
      }
    },
    // temp removing deps
    [email, code, bookType, purchasedOrBorrowed]
    // []
  );

  /**
   * Updates the context with the handleCodeSubmission function.
   */
  useEffect(() => {
    setHandleCodeSubmission(() => handleCodeSubmission);
  }, [handleCodeSubmission, setHandleCodeSubmission]);

  return (
    <>
      {!beginAssessment && <h1 style={styles["h1Style"]}>REDEEM YOUR FREE APTITUDE ASSESSMENT HERE</h1>}
      <div
        style={beginAssessment ? bigStyles.clicked : bigStyles.unclicked}
        onClick={toggleCollapsible}
        onKeyDown={handleKeyDown}
        aria-expanded={beginAssessment}
        aria-controls="assessment-content"
        role="button"
        tabIndex={0}
      >
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
            id="assessment-content"
          >
            <div className="jdb-animation-div" style={styles["animationDivStyle"]}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentContent}
                  initial={{ opacity: 0.1, y: 10 }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                    duration: 0.5,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: 100,
                    transition: { ease: "backInOut", delay: 0.2, duration: 0.8 },
                  }}
                >
                  {/* Renders either the question content or the response content */}
                  {databaseResponse == null ? (
                    contentMap[currentContent]
                  ) : (
                    <div>
                      <div style={styles["questionStyle"]}>
                        <div>{databaseResponse.message}</div>

                        <div style={bigStyles.successLink}>
                          <a href={databaseResponse.domain} target="_blank" rel="noopener noreferrer">
                            {databaseResponse.domain}
                          </a>
                        </div>
                        <div
                          style={{
                            ...styles["questionStyleSmaller"],
                            textAlign: "left",
                          }}
                        >
                          {databaseResponse!.details}
                        </div>
                      </div>
                    </div>
                  )}
                  {(databaseResponse == null || databaseResponse.success !== true) && currentContent !== "physicalOrDigital" && (
                    <button
                      id="jdb-ResetButton"
                      style={styles["resetButtonStyle"]}
                      onClick={handleReset}
                      aria-label="Go back to the previous step"
                    >
                      &#8592; Back
                    </button>
                  )}
                  {databaseResponse == null && currentContent == "physicalOrDigital" && (
                    <>
                      <button
                        id="jdb-PostSubmitButton"
                        style={{
                          ...styles["continueButtonStyle"],
                          textDecoration: "underline",
                          textDecorationColor: "#f15e22",
                          textDecorationThickness: "1px",
                          textUnderlineOffset: "4px",
                          marginTop: "2rem",
                          // fontSize: "larger",
                        }}
                        onClick={() => setCurrentContent("checkEmailAddress")}
                        aria-label="Forgot your unique link? Click here to retrieve it"
                      >
                        Signed up, but forgot your unique link? Click here.
                      </button>
                      <button
                        id="jdb-PostSubmitButton"
                        style={{ ...styles["continueButtonStyle"], marginTop: ".5rem" }}
                        onClick={() => window.open("https://www.yourhiddengenius.com/preorder", "_blank")}
                        aria-label="Purchase your copy to receive your assessment code"
                      >
                        <span>
                          Don't have the book? Preorder <span style={{ fontStyle: "italic" }}>Your Hidden Genius</span> below to receive
                          your copy, along with a code to redeem your free assessment.{" "}
                        </span>
                      </button>
                      <button
                        id="jdb-PostSubmitButton"
                        style={{ ...styles["continueButtonStyle"], marginTop: ".5rem" }}
                        onClick={() => window.open("https://www.yourhiddengenius.com/faq#block-yui_3_17_2_1_1730734523784_58106", "_blank")}
                        aria-label="Click here to open the FAQ"
                      >
                        <span>Questions or issues? Click here to see answers to our Frequently Asked Questions (FAQ) </span>
                      </button>
                    </>
                  )}
                  {databaseResponse?.success == true && (
                    <a
                      href="https://yourhiddengenius.com/home"
                      style={{
                        ...styles["continueButtonStyle"],
                        ...styles["noDecorationLinksStyle"],
                        flex: "1 1 auto",
                        textAlign: "center",
                      }}
                      id="jdb-PostSubmitButton"
                      aria-label="Continue to the Your Hidden Genius website"
                    >
                      Continue to the <i>Your Hidden Genius</i>&nbsp; website!
                    </a>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              style={{
                margin: "0 auto 8px",
                width: "90%",
                textAlign: "center",
                fontSize: "8px",
                color: "white",
                fontWeight: "lighter",
                textShadow: ".5px .5px .5px black",
              }}
            >
              This site is protected by reCAPTCHA and the Google{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textUnderlineOffset: "2px" }}
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textUnderlineOffset: "2px" }}
              >
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
