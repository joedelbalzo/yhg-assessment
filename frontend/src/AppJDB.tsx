// React Imports
import React, { useEffect, useState, CSSProperties, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios, { AxiosError } from "axios";

// Component Imports
import { useBook } from "./BookContext";
import { bigStyles } from "./styles/Big-Styles";
import { smallStyles } from "./styles/Small-Styles";
import { useContentMap } from "./content/contentMap";
import { errorMap } from "./content/errorMap";
import { DownButton } from "./components/DownButton";
import { useResponsiveStyles } from "./styles/StyleFunctions";

//Type imports
import { ErrorMapJDB, ContentMapJDB } from "./types";

function isAxiosError(error: any): error is AxiosError {
  return axios.isAxiosError(error);
}

const AppJDB: React.FC = () => {
  const {
    bookType,

    purchasedOrBorrowed,
    email,
    code,
    isVerified,
    setIsVerified,
    uniqueURL,
    setUniqueURL,
    currentContent,
    setCurrentContent,
    windowWidth,
    setHandleCodeSubmission,
  } = useBook();
  const [beginAssessment, setBeginAssessment] = useState<boolean>(false);
  const [error, setError] = useState<keyof ErrorMapJDB | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const contentMap = useContentMap();
  const styles = useResponsiveStyles();

  useEffect(() => {
    if (window.location.href === "https://www.yourhiddengenius.com/assessment") {
      setBeginAssessment(true);
    }
  }, []);

  const toggleCollapsible = () => {
    setBeginAssessment(!beginAssessment);
  };

  const maxHeight = "auto";
  const collapsibleStyles: CSSProperties = {
    minHeight: beginAssessment ? "0px" : "auto",
    ...(windowWidth > 768 ? bigStyles.jdbHomeDiv : smallStyles.jdbHomeDiv),
  };

  const handleReset = () => {
    setLoading(false);
    setSuccess(false);
    setIsVerified(false);
    if ((currentContent == "enterEmail" && bookType == "physicalCopy") || bookType == "advanceReaderCopy") {
      setCurrentContent("enterPhysicalCode");
    }
    if (currentContent == "enterEmail" && bookType == "digitalCopy") {
      setCurrentContent("enterDigitalCode");
    }
    if (currentContent == "enterPhysicalCode" || currentContent == "enterDigitalCode") {
      setCurrentContent("purchasedOrLibrary");
    }
    if (currentContent == "purchasedOrLibrary" || currentContent == "checkEmailAddress") {
      setCurrentContent("physicalOrDigital");
    }
    if (currentContent == "error" || currentContent == "errorWithMessage") {
      setCurrentContent("physicalOrDigital");
    }
  };

  const postSubmissionHandlers: { [key: string]: keyof ContentMapJDB } = {
    "Record updated successfully": "success",
    "email has been used": "emailUsedSuccess",
    "code has been used": "emailUsedSuccess",
    "csv success": "processingEmails",
    "cache success": "refreshedEmailCache",
    "Email already used": "emailUsedSuccess",
    "csv fail": "failedToProcessEmails",
  };
  const errorHandlers: { [key: string]: keyof ErrorMapJDB } = {
    "This code was not found. Contact us.": "noCode",
    "EBooks have surpassed their usage limit. Contact us.": "tooManyEBooks",
    "Library book has surpassed its usage limit. Contact us.": "tooManyLibraryBooks",
    "This code has been used. Contact us.": "codeUsed",
    "No available domains. Contact us.": "noDomains",
    "Invalid code format": "invalidCodeFormat",
    "Invalid email address.": "invalidEmailFormat",
    "email not found": "noEmail",
    "Duplicate request detected.": "duplicateRequest",
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
  const handleCodeSubmission = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      console.log(code, email, purchasedOrBorrowed, bookType);
      const cleanEmail = email.trim().toLowerCase();
      const cleanCode = code.trim();

      if (!isValidEmail(cleanEmail)) {
        setError("invalidEmailFormat");
        setCurrentContent("errorWithMessage");
        setLoading(false);
        return;
      }
      if (!isValidCode(cleanCode)) {
        setError("invalidCodeFormat");
        setCurrentContent("errorWithMessage");
        setLoading(false);
        return;
      }
      setTimeout(() => {
        console.log("four seconds later");
        return;
      }, 4000);
      // const axiosCall = async () => {
      //   const apiEnv = import.meta.env.VITE_API_ENV || "development";
      //   const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
      //   const url = `${baseURL}/gas/${cleanCode}`;
      //   try {
      //     let response = await axios.post(url, { email: cleanEmail, bookType, purchasedOrBorrowed });
      //     return response;
      //   } catch (error) {
      //     console.error("Error during the API call", error);
      //     throw error;
      //   }
      // };

      // try {
      //   const response = await axiosCall();
      //   if (response.status === 200) {
      //     if (response.data.message == "email has been used") {
      //       setCurrentContent("emailUsedSuccess");
      //       setUniqueURL(response.data.domain);
      //     } else if (response.data.message == "code has been used") {
      //       setCurrentContent("emailUsedSuccess");
      //       setUniqueURL(response.data.domain);
      //     } else {
      //       setCurrentContent("success");
      //       setUniqueURL(response.data.domain);
      //     }
      //   } else {
      //     console.error("Unhandled status code:", response.status);
      //     throw new Error(`Unhandled status: ${response.status}`);
      //   }
      // } catch (error) {
      //   console.error("Caught Error:");
      //   if (axios.isAxiosError(error)) {
      //     handleAxiosError(error);
      //   } else if (error instanceof Error) {
      //     console.error("Not an Axios error:", error.message);
      //     setError("bigProblem");
      //     setCurrentContent("error");
      //   } else {
      //     console.error("Error of unknown type:", error);
      //     setError("bigProblem");
      //     setCurrentContent("error");
      //   }
      // } finally {
      //   setLoading(false);
      // }
    },
    [email, code, bookType, purchasedOrBorrowed]
  );

  const handleCheckEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setError("invalidEmailFormat");
      setCurrentContent("errorWithMessage");
      setLoading(false);
      return;
    }
    const axiosCall = async () => {
      const apiEnv = import.meta.env.VITE_API_ENV || "development";
      const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
      const url = `${baseURL}/gas/check-email`;
      const cleanEmail = email.trim().toLowerCase();

      try {
        const response = await axios.post(url, { email: cleanEmail });
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
        const messageHandler = postSubmissionHandlers[response.data.message];
        if (messageHandler) {
          setCurrentContent(messageHandler);
          setUniqueURL(response.data.domain || "");
        } else {
          setCurrentContent("success");
          setUniqueURL(response.data.domain || "");
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
        setError("bigProblem");
        setCurrentContent("error");
      } else {
        console.error("Error of unknown type:", error);
        setError("bigProblem");
        setCurrentContent("error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAxiosError = (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`Server error: ${status}`, data || error);
      const curError: keyof ErrorMapJDB = errorHandlers[data] || "failure";
      setError(curError);
      setCurrentContent("errorWithMessage");
    } else if (error.request) {
      console.error("Network Error: No response was received");
      setError("bigProblem");
      setCurrentContent("error");
    } else {
      console.error("Request setup error:", error.message);
      setError("bigProblem");
      setCurrentContent("error");
    }
  };
  useEffect(() => {
    setHandleCodeSubmission(() => handleCodeSubmission);
  }, [handleCodeSubmission, setHandleCodeSubmission]);

  return (
    <>
      {!beginAssessment && <h1 style={styles["h1Style"]}>HAVE A CODE FROM THE BOOK? GET YOUR INCLUDED ASSESSMENT HERE</h1>}
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
            <div className="jdb-animation-div" style={styles["animationDivStyle"]}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentContent}
                  initial={{ opacity: 0.1, y: 10 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100, duration: 0.5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100, transition: { ease: "backInOut", delay: 0.2, duration: 0.8 } }}
                >
                  {contentMap[currentContent]}
                  {!uniqueURL && currentContent != "physicalOrDigital" && (
                    <button id="jdb-ResetButton" style={styles["resetButtonStyle"]} onClick={handleReset}>
                      &#8592; Back
                    </button>
                  )}
                  {!uniqueURL && currentContent == "physicalOrDigital" && (
                    <>
                      <button
                        id="jdb-PostSubmitButton"
                        style={{
                          ...styles["continueButtonStyle"],
                          textDecoration: "underline",
                          textDecorationColor: "#f15e22",
                          textDecorationThickness: "1px",
                          textUnderlineOffset: "4px",
                          marginTop: "1rem",
                        }}
                      >
                        <span
                          onClick={() => setCurrentContent("checkEmailAddress")}
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          Signed up, but forgot your unique link? Click here.
                        </span>
                      </button>
                      <button
                        id="jdb-PostSubmitButton"
                        style={{ ...styles["continueButtonStyle"], marginTop: "2rem" }}
                        onClick={() => window.open("https://www.yourhiddengenius.com/preorder", "_blank")}
                      >
                        <span>
                          Don't have a code yet? Purchase your copy of <span style={{ fontStyle: "italic" }}>Your Hidden Genius</span> below
                          to receive your assessment code.{" "}
                        </span>
                      </button>
                    </>
                  )}
                  {!uniqueURL && currentContent == "success" && (
                    <button id="jdb-PostSubmitButton" style={styles["continueButtonStyle"]}>
                      <a href="https://yourhiddengenius.com/home" style={styles["noDecorationLinksStyle"]}>
                        Continue to the <i>Your Hidden Genius</i> website!
                      </a>
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div style={{ ...styles["questionStyleSmaller"], cursor: "pointer" }} onClick={() => setBeginAssessment(false)}>
              Click here to minimize this section.
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
