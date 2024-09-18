import React, { useCallback, useEffect } from "react";
import { useBook } from "../BookContext";
import { bigStyles } from "../styles/Big-Styles";
import { CodeFormComponent, EbookCodeFormComponent, EmailFormComponent } from "../components/FormComponent";
import { useResponsiveStyles } from "../styles/StyleFunctions";
import { BookType, ContentMapJDB } from "../types";

export const useContentMap = (): ContentMapJDB => {
  const { bookType, setCurrentContent, setBookType, purchasedOrBorrowed, setPurchasedOrBorrowed } = useBook();

  const styles = useResponsiveStyles();

  const handleBookType = useCallback(
    (booktype: BookType) => {
      if (booktype === "advanceReaderCopy") {
        console.log("Selected: Advance Reader Copy (ARC)");
        setCurrentContent("enterPhysicalCode");
        setBookType(booktype);
        setPurchasedOrBorrowed("purchased");
      } else {
        setBookType(booktype);
        setCurrentContent("purchasedOrLibrary");
        setPurchasedOrBorrowed("");
      }
    },
    [setBookType, setCurrentContent, setPurchasedOrBorrowed]
  );

  interface StyledButtonProps {
    children: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
  }
  const StyledButton: React.FC<StyledButtonProps> = ({ children, onClick }) => (
    <button id="jdb-ButtonId" style={{ ...styles.buttonIdStyle, ...styles.flexChildStyle }} onClick={onClick}>
      {children}
    </button>
  );

  // const handlePurchasedOrBorrowed = (response: PurchasedOrBorrowed) => {
  //   setPurchasedOrBorrowed(response);
  //   if (bookType == "physicalCopy") {
  //     setCurrentContent("enterPhysicalCode");
  //   } else if (bookType == "digitalCopy") {
  //     setCurrentContent("enterDigitalCode");
  //   } else if (bookType == "advanceReaderCopy") {
  //     setCurrentContent("enterPhysicalCode");
  //   }
  // };

  useEffect(() => {
    if (purchasedOrBorrowed) {
      if (bookType === "physicalCopy" || bookType === "advanceReaderCopy") {
        setCurrentContent("enterPhysicalCode");
      } else if (bookType === "digitalCopy") {
        setCurrentContent("enterDigitalCode");
      }
    }
  }, [bookType, purchasedOrBorrowed]);

  const handleContinueToEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentContent("enterEmail");
  };

  const contentMap: ContentMapJDB = {
    physicalOrDigital: (
      <>
        <div style={styles["questionStyle"]}> Select your book format:</div>
        <div id="flex" style={styles["flexStyle"]}>
          <StyledButton onClick={() => handleBookType("physicalCopy")}>Physical Copy</StyledButton>
          <StyledButton onClick={() => handleBookType("digitalCopy")}>Digital Copy</StyledButton>
          <StyledButton onClick={() => handleBookType("advanceReaderCopy")}>Advance Reader Copy</StyledButton>
        </div>
      </>
    ),
    purchasedOrLibrary: (
      <>
        <div style={styles["questionStyle"]}> Did you purchase the book or borrow from a local library or an online library?</div>
        <div id="flex" style={styles["flexStyle"]}>
          <StyledButton onClick={() => setPurchasedOrBorrowed("purchased")}>Purchased</StyledButton>
          <StyledButton onClick={() => setPurchasedOrBorrowed("library")}>Library</StyledButton>
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
          {" "}
          <EmailFormComponent buttonTrigger={"checkLostEmail"} />
        </div>
      </>
    ),
    invalidCodeFormat: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        Your code's format is incorrect. Please double check the instructions for entering your code. Especially with EBooks. <br />
        <br /> If you're having trouble, please email us at info@yourhiddengenius.com
      </div>
    ),
    invalidEmailFormat: (
      <div style={bigStyles.jdbErrorMessages}>
        <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
        <br />
        Your email format is incorrect. Please go back and confirm that you're entering a standard email@provider.com email address. <br />
        <br /> If you're having trouble, please email us at info@yourhiddengenius.com
      </div>
    ),
    error: (
      <div style={bigStyles.jdbErrorMessages}>
        You've reached a generic error. <br />
        <br />
        There's a good chance your code and email actually worked, and you either hit the back button and resubmitted unintentionally or
        there was a communication issue between here and our database. Please go back to the beginning, click "Signed up, but forgot your
        unique link? Click here.", and try to recover your domain using your email address. <br />
        <br />
        If that doesn't work, please email us at info@yourhiddengenius.com and we'll fix this right away!
      </div>
    ),
  };

  return contentMap;
};
