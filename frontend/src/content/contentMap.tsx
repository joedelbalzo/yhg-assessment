import React from "react";
import { useBook } from "../BookContext";
import { bigStyles } from "../styles/Big-Styles";
import { CodeFormComponent, EbookCodeFormComponent, EmailFormComponent } from "../components/FormComponent";
import { errorMap } from "./errorMap";
import { useResponsiveStyles } from "../styles/StyleFunctions";
import { BookType, PurchasedOrBorrowed, ContentMapJDB } from "../types";

export const useContentMap = (): ContentMapJDB => {
  const { bookType, uniqueURL, setCurrentContent, error, setBookType, setPurchasedOrBorrowed } = useBook();

  const styles = useResponsiveStyles();

  const handleBookType = (booktype: BookType) => {
    setBookType(booktype);
    setCurrentContent("purchasedOrLibrary");
  };
  const handlePurchasedOrBorrowed = (response: PurchasedOrBorrowed) => {
    setPurchasedOrBorrowed(response);
    if (bookType == "physicalCopy") {
      setCurrentContent("enterPhysicalCode");
    } else if (bookType == "digitalCopy") {
      setCurrentContent("enterDigitalCode");
    } else if (bookType == "advanceReaderCopy") {
      setCurrentContent("enterPhysicalCode");
    }
  };
  const handleContinueToEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentContent("enterEmail");
  };

  const contentMap: ContentMapJDB = {
    physicalOrDigital: (
      <>
        <div style={styles["questionStyle"]}> Select your book format.</div>
        <div id="flex" style={styles["flexStyle"]}>
          <button
            id="jdb-ButtonId"
            style={{
              ...styles["buttonIdStyle"],
              ...styles["flexChildStyle"],
            }}
            onClick={() => handleBookType("physicalCopy")}
          >
            Physical Copy
          </button>
          <button
            id="jdb-ButtonId"
            style={{
              ...styles["buttonIdStyle"],
              ...styles["flexChildStyle"],
            }}
            onClick={() => handleBookType("digitalCopy")}
          >
            Digital Copy
          </button>
          <button
            id="jdb-ButtonId"
            style={{
              ...styles["buttonIdStyle"],
              ...styles["flexChildStyle"],
            }}
            onClick={() => handleBookType("advanceReaderCopy")}
          >
            Advance Reader Copy
          </button>
        </div>
      </>
    ),
    purchasedOrLibrary: (
      <>
        <div style={styles["questionStyle"]}> Did you purchase the book or borrow from a local library or an online library?</div>
        <div id="flex" style={styles["flexStyle"]}>
          <button
            id="jdb-ButtonId"
            style={{
              ...styles["buttonIdStyle"],
              ...styles["flexChildStyle"],
            }}
            onClick={() => handlePurchasedOrBorrowed("purchased")}
          >
            Purchased
          </button>
          <button
            id="jdb-ButtonId"
            style={{
              ...styles["buttonIdStyle"],
              ...styles["flexChildStyle"],
            }}
            onClick={() => handlePurchasedOrBorrowed("library")}
          >
            Borrowed
          </button>
        </div>
      </>
    ),
    enterPhysicalCode: (
      <>
        <div style={styles["questionStyle"]}> Nice! Please enter your code here.</div>
        <div>
          <CodeFormComponent continueToEmailForm={handleContinueToEmail} />
        </div>
      </>
    ),
    enterDigitalCode: (
      <>
        <div style={styles["questionStyle"]}> Nice!</div>
        <div style={{ ...styles["questionStyleSmaller"], textAlign: "left", width: "95%" }}>
          For Amazon, Google, B&N, and Kobo orders, towards the top of your receipt is an Order Number or an Invoice Number.
          <br />
          <ul>
            <li style={{ listStyleType: "circle", marginBottom: "8px" }}>
              For Amazon and Google orders, enter the last seven numbers or letters.
            </li>
            <li style={{ listStyleType: "circle", marginBottom: "8px" }}>For B&N and Kobo orders, enter the 10-digit order number.</li>
            <li style={{ listStyleType: "circle", marginBottom: "8px" }}>
              For other vendors, please email us at info@yourhiddengenius.com
            </li>
          </ul>
        </div>
        <div style={{ ...styles["questionStyleSmaller"], textAlign: "left", width: "95%" }}>
          In the second field, please tell us the first word of the third chapter.
        </div>
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
          {" "}
          <EmailFormComponent />
        </div>
      </>
    ),
    checkEmailAddress: (
      <>
        <div id="jdb-Questions" style={styles["questionStyle"]}>
          Enter your email address.
        </div>
        <div>
          {" "}
          <EmailFormComponent />
        </div>
      </>
    ),
    success: (
      <div style={styles["questionStyle"]}>
        <div>Hey, nice work! Here's your unique URL to get started with YouScience:</div>
        <div style={bigStyles.successLink}>
          <a href={uniqueURL} target="_blank">
            {uniqueURL}
          </a>
        </div>
        <div style={styles["questionStyleSmaller"]}>
          If you navigate from this page without your unique domain, don't worry! You can always come back here and retrieve it with your
          email address.{" "}
        </div>
      </div>
    ),
    error: (
      <div style={bigStyles.jdbErrorMessages}>
        Hmm. Something went wrong. <br />
        <br /> You've reached a generic error, meaning your email and code are just fine. <br />
        <br />
        There's a good chance your code and email actually worked, and it's just a communication issue between us and them. Please go back
        to the beginning, click "Signed up, but forgot your unique link? Click here.", and try to recover your domain using your email
        address. If that doesn't work, please email us at info@yourhiddengenius.com and we'll fix this right away!
      </div>
    ),
    errorWithMessage: <>{error && errorMap[error]}</>,
    emailUsedSuccess: (
      <>
        <div style={styles["questionStyle"]}>Hey, you're already signed up!</div>
        <div style={bigStyles.successLink}>
          <a href={uniqueURL} target="_blank">
            {uniqueURL}
          </a>
        </div>
      </>
    ),
    processingEmails: <div style={bigStyles.jdbErrorMessages}>Emails processing.</div>,
    failedToProcessEmails: <div style={bigStyles.jdbErrorMessages}>Failed to process emails.</div>,
    refreshedEmailCache: <div style={bigStyles.jdbErrorMessages}>Refreshed cache.</div>,
    failedToRefreshEmailCache: <div style={bigStyles.jdbErrorMessages}>Failed to refresh cache.</div>,
  };

  return contentMap;
};
