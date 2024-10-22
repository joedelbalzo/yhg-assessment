import React, { useCallback, useEffect } from "react";
import { useBook } from "../BookContext";
import { bigStyles } from "../styles/Big-Styles";
import { CodeFormComponent, EbookCodeFormComponent, EmailFormComponent } from "../components/FormComponent";
import { useResponsiveStyles } from "../styles/StyleFunctions";
import { BookType, ContentMapJDB } from "../types";

export const useContentMap = (): ContentMapJDB => {
  const { bookType, setCurrentContent, setBookType, purchasedOrBorrowed, setPurchasedOrBorrowed } = useBook();

  const styles = useResponsiveStyles();

  /**
   * Handles the selection of book type and updates the state accordingly.
   * @param {BookType} booktype - The type of the book selected.
   */
  const handleBookType = useCallback(
    (booktype: BookType) => {
      if (booktype === "advanceReaderCopy") {
        console.log("Selected: Advance Reader Copy (ARC)");
        setCurrentContent("enterPhysicalCode");
        setBookType(booktype);
        // Setting to borrowed allows the "library" backend triggers to work
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
      if (bookType === "physicalCopy" || bookType === "advanceReaderCopy") {
        setCurrentContent("enterPhysicalCode");
      } else if (bookType === "digitalCopy") {
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

  const contentMap: ContentMapJDB = {
    physicalOrDigital: (
      <>
        <div style={styles["questionStyle"]}> Select your book format:</div>
        <div id="flex" style={styles["flexStyle"]}>
          <StyledButton onClick={() => handleBookType("advanceReaderCopy")} ariaLabel="Select Advance Reader Copy">
            Advance Reader Copy
          </StyledButton>
          <StyledButton onClick={() => handleBookType("physicalCopy")} ariaLabel="Select Physical Copy">
            Hardcover Copy
          </StyledButton>
          <StyledButton onClick={() => handleBookType("digitalCopy")} ariaLabel="Select Digital Copy">
            Digital Copy
          </StyledButton>
        </div>
      </>
    ),
    purchasedOrBorrowed: (
      <>
        <div style={styles["questionStyle"]}>Did you purchase the book or borrow from a local or an online library?</div>
        <div id="flex" style={styles["flexStyle"]}>
          <StyledButton onClick={() => setPurchasedOrBorrowed("purchased")} ariaLabel="Select Purchased">
            Purchased
          </StyledButton>
          <StyledButton onClick={() => setPurchasedOrBorrowed("borrowed")} ariaLabel="Select Borrowed">
            Borrowed
          </StyledButton>
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
        {purchasedOrBorrowed === "purchased" && (
          <div
            style={{
              ...styles["questionStyleSmaller"],
              textAlign: "left",
              width: "85%",
            }}
          >
            For Amazon, Google, B&N, and Kobo orders, towards the top of your receipt is an Order Number or an Invoice Number.
            <br />
            <ul>
              <li style={{ listStyleType: "circle", marginBottom: "8px" }}>
                For these vendors, enter the last seven numbers or letters, with no spaces or special characters.
              </li>
              <li style={{ listStyleType: "circle", marginBottom: "8px" }}>
                For other vendors, please email us at{" "}
                <a href="mailto:info@yourhiddengenius.com" style={{ color: "inherit", textDecoration: "underline" }}>
                  info@yourhiddengenius.com
                </a>
              </li>
            </ul>
          </div>
        )}
        <div
          style={{
            ...styles["questionStyleSmaller"],
            marginTop: "2rem",
            textAlign: "left",
            width: "85%",
          }}
        >
          In this field, please tell us the first word of the third chapter.
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
