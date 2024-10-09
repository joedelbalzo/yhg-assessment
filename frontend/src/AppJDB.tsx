// React Imports
import React, { useEffect, useState, CSSProperties, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

// Component Imports
import { useBook } from "./BookContext";
import { bigStyles } from "./styles/Big-Styles";
import { smallStyles } from "./styles/Small-Styles";
import { useContentMap } from "./content/contentMap";
import { DownButton } from "./components/DownButton";
import { useResponsiveStyles } from "./styles/StyleFunctions";

//Type imports
import { ContentMapJDB, CustomResponses } from "./types";

const AppJDB: React.FC = () => {
  const {
    bookType,
    purchasedOrBorrowed,
    email,
    code,
    setIsVerified,
    setUniqueURL,
    currentContent,
    setCurrentContent,
    windowWidth,
    setHandleCodeSubmission,
    setError,
    setLoading,
    setSuccess,
  } = useBook();
  const [beginAssessment, setBeginAssessment] = useState<boolean>(false);
  const [databaseResponse, setDatabaseResponse] = useState<CustomResponses | null>(null);
  const contentMap = useContentMap();
  const styles = useResponsiveStyles();

  useEffect(() => {
    if (window.location.href === "https://www.yourhiddengenius.com/assessment") {
      setBeginAssessment(true);
    }
  }, []);

  const toggleCollapsible = () => {
    setBeginAssessment((prev) => !prev);
  };
  useEffect(() => {
    console.log("database updated");
  }, [databaseResponse]);

  const maxHeight = "auto";
  const collapsibleStyles: CSSProperties = {
    minHeight: beginAssessment ? "0px" : "auto",
    ...(windowWidth > 768 ? bigStyles.jdbHomeDiv : smallStyles.jdbHomeDiv),
  };

  const handleReset = () => {
    setLoading(false);
    setSuccess(false);
    setIsVerified(false);
    if (currentContent == "enterEmail" && (bookType == "physicalCopy" || bookType == "advanceReaderCopy")) {
      setCurrentContent("enterPhysicalCode");
    } else if (currentContent == "enterPhysicalCode" && bookType == "advanceReaderCopy") {
      setCurrentContent("physicalOrDigital");
    } else if (currentContent == "enterEmail" && bookType == "digitalCopy") {
      setCurrentContent("enterDigitalCode");
    } else if (currentContent == "enterPhysicalCode" || currentContent == "enterDigitalCode") {
      setCurrentContent("purchasedOrBorrowed");
    } else if (currentContent == "purchasedOrBorrowed" || currentContent == "checkEmailAddress") {
      setCurrentContent("physicalOrDigital");
    } else if (currentContent == "error") {
      setCurrentContent("enterEmail");
    }
    if (databaseResponse) {
      setDatabaseResponse(null);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidCode = (code: string) => {
    const codeRegex = /^\d{1,10}$/; // Adjust this regex according to the valid code format
    return codeRegex.test(code);
  };

  const handleCodeSubmission = useCallback(
    async (buttonTrigger: string) => {
      // console.log("setLoading == true");
      setLoading(true);
      const cleanEmail = email ? email.trim().toLowerCase() : "";
      const cleanCode = code ? code.trim() : "";

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

      const axiosCall = async () => {
        const apiEnv = import.meta.env.VITE_API_ENV || "development";
        const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
        const url = buttonTrigger == "handleCode" ? `${baseURL}/gas/${cleanCode}` : `${baseURL}/gas/check-email`;

        try {
          let response = await axios.post<CustomResponses>(url, { email: cleanEmail, bookType, purchasedOrBorrowed });
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
        // console.log("response", response);
        // console.log("database response", databaseResponse);
        if (response.statusCode == 200) {
          //does anything matter here?
        } else if (response.statusCode == 404) {
          //takes the user back one step when they hit the back button
          setCurrentContent("enterEmail");
        } else if (response.statusCode == 500) {
          //does anything matter here?
        }
      } catch (error) {
        console.error("Caught Error:", error);
        setCurrentContent("error");
      } finally {
        // console.log("setLoading == false");
        setLoading(false);
      }
    },
    [email, code, bookType, purchasedOrBorrowed]
  );

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
                  {/* THIS RIGHT HERE SHOWS EITHER THE QUESTION CONTENT OR THE RESPONSE CONTENT */}
                  {databaseResponse == null ? (
                    contentMap[currentContent]
                  ) : (
                    <div>
                      <div style={styles["questionStyle"]}>
                        <div>{databaseResponse.message}</div>

                        <div style={bigStyles.successLink}>
                          <a href={databaseResponse.domain} target="_blank">
                            {databaseResponse.domain}
                          </a>
                        </div>
                        <div style={{ ...styles["questionStyleSmaller"], textAlign: "left" }}>{databaseResponse!.details}</div>
                      </div>
                    </div>
                  )}
                  {(databaseResponse == null || databaseResponse.success !== true) && currentContent !== "physicalOrDigital" && (
                    <button id="jdb-ResetButton" style={styles["resetButtonStyle"]} onClick={handleReset}>
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
                          fontSize: "larger",
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
                        style={{ ...styles["continueButtonStyle"], marginTop: "1rem" }}
                        onClick={() => window.open("https://www.yourhiddengenius.com/preorder", "_blank")}
                      >
                        <span>
                          Don't have a code yet? Purchase your copy of <span style={{ fontStyle: "italic" }}>Your Hidden Genius</span> below
                          to receive your assessment code.{" "}
                        </span>
                      </button>
                    </>
                  )}
                  {databaseResponse?.success == true && (
                    <button id="jdb-PostSubmitButton" style={styles["continueButtonStyle"]}>
                      <a href="https://yourhiddengenius.com/home" style={styles["noDecorationLinksStyle"]}>
                        Continue to the <i>Your Hidden Genius</i> website!
                      </a>
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              style={{ ...styles["questionStyleSmaller"], cursor: "pointer", fontSize: "smaller", margin: "1px auto" }}
              onClick={() => setBeginAssessment(false)}
            >
              Click here to minimize this section.
            </div>
            <div
              style={{
                margin: "0 auto 8px",
                width: "90%",
                textAlign: "center",
                fontSize: "10px",
                color: "white",
                fontWeight: "lighter",
                textShadow: ".5px .5px .5px black",
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
