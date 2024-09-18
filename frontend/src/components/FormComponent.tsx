import React, { useState, useEffect } from "react";
import { bigStyles } from "../styles/Big-Styles";
import { smallStyles } from "../styles/Small-Styles";
import ReCaptcha from "./ReCaptchaComponent";
import LoadingComponent from "./LoadingComponent";
import { useBook } from "../BookContext";

interface CodeFormComponentProps {
  continueToEmailForm: (event: React.FormEvent<HTMLFormElement>) => void;
}

interface EmailFormComponentProps {
  buttonTrigger: string;
}

export const CodeFormComponent: React.FC<CodeFormComponentProps> = ({ continueToEmailForm }) => {
  const { code, setCode, isVerified, setIsVerified, loading, windowWidth } = useBook();
  return (
    <form id="jdb-Form" style={windowWidth > 768 ? bigStyles.jdbCodeForm : smallStyles.jdbCodeForm} onSubmit={continueToEmailForm}>
      <input
        id="jdb-Input"
        style={windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput}
        placeholder="Enter your code."
        value={code || ""}
        onChange={(ev) => setCode(ev.target.value)}
      />
      <div style={windowWidth > 768 ? bigStyles.reCaptcha : smallStyles.reCaptcha}>
        <ReCaptcha onVerify={setIsVerified} />{" "}
      </div>
      {loading ? (
        <button id="jdb-Submit-ButtonId" style={windowWidth > 768 ? bigStyles.jdbSubmitButtonId : smallStyles.jdbSubmitButtonId}>
          <LoadingComponent height="20px" width="20px" borderWidth="2px" />
        </button>
      ) : (
        <button
          id="jdb-Submit-ButtonId"
          disabled={!isVerified}
          style={
            windowWidth > 768
              ? { ...bigStyles.jdbSubmitButtonId, gridRow: "5", color: !isVerified ? "gray" : "white" }
              : { ...smallStyles.jdbSubmitButtonId, gridRow: "5", color: !isVerified ? "gray" : "white" }
          }
        >
          Submit
        </button>
      )}
    </form>
  );
};
export const EbookCodeFormComponent: React.FC<CodeFormComponentProps> = ({ continueToEmailForm }) => {
  const { code, setCode, isVerified, setIsVerified, loading, windowWidth } = useBook();
  const [codeWord, setCodeWord] = useState<string>("");
  const [codePassed, setCodePassed] = useState<Boolean>(false);

  useEffect(() => {
    let codeWordClean = codeWord.trim().toLowerCase();
    if (codeWordClean === "on") {
      setCodePassed(true);
    } else {
      setCodePassed(false);
    }
  }, [codeWord]);

  return (
    <form id="jdb-Form" style={windowWidth > 768 ? bigStyles.jdbCodeForm : smallStyles.jdbCodeForm} onSubmit={continueToEmailForm}>
      <input
        id="jdb-Input"
        style={windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput}
        placeholder="Enter your code."
        value={code || ""}
        onChange={(ev) => setCode(ev.target.value)}
      />

      <input
        id="jdb-Input"
        style={
          windowWidth > 768
            ? { ...bigStyles.jdbInput, gridRow: "3", marginTop: "10px" }
            : { ...smallStyles.jdbInput, gridRow: "3", marginTop: "10px" }
        }
        placeholder="Enter the code word."
        value={codeWord || ""}
        onChange={(ev) => setCodeWord(ev.target.value)}
      />
      <div style={windowWidth > 768 ? bigStyles.reCaptcha : smallStyles.reCaptcha}>
        <ReCaptcha onVerify={setIsVerified} />{" "}
      </div>
      {loading ? (
        <button
          id="jdb-Submit-ButtonId"
          style={windowWidth > 768 ? { ...bigStyles.jdbSubmitButtonId, gridRow: "5" } : { ...smallStyles.jdbSubmitButtonId, gridRow: "5" }}
        >
          <LoadingComponent height="20px" width="20px" borderWidth="2px" />
        </button>
      ) : (
        <button
          id="jdb-Submit-ButtonId"
          disabled={!(isVerified && codePassed)}
          style={
            windowWidth > 768
              ? { ...bigStyles.jdbSubmitButtonId, gridRow: "5", color: !(isVerified && codePassed) ? "gray" : "white" }
              : { ...smallStyles.jdbSubmitButtonId, gridRow: "5", color: !(isVerified && codePassed) ? "gray" : "white" }
          }
        >
          Submit
        </button>
      )}
    </form>
  );
};

export const EmailFormComponent: React.FC<EmailFormComponentProps> = ({ buttonTrigger }) => {
  const { email, setEmail, loading, windowWidth, handleCodeSubmission } = useBook();
  const [allowSubmit, setAllowSubmit] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  useEffect(() => {
    if (!email || !confirmEmail) {
      setAllowSubmit(false);
    } else if (email.toLowerCase() == confirmEmail.toLowerCase()) {
      setAllowSubmit(true);
    }
  }, [email, confirmEmail]);

  return (
    <form
      id="jdb-Form"
      style={windowWidth > 768 ? bigStyles.jdbEmailForm : smallStyles.jdbEmailForm}
      onSubmit={(event) => {
        event.preventDefault();
        handleCodeSubmission(buttonTrigger);
      }}
    >
      <input
        id="jdb-Input"
        style={{ marginBottom: "12px", gridRow: "1", ...(windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput) }}
        placeholder="Enter your e-mail address"
        value={email || ""}
        onChange={(ev) => setEmail(ev.target.value)}
      />
      <input
        id="jdb-Input"
        style={{
          ...(windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput),
          marginTop: "12px",
          color: confirmEmail.toLowerCase() == email.toLowerCase() ? "white" : "#f13e22",
          gridRow: "2",
        }}
        placeholder="Confirm your e-mail address"
        value={confirmEmail || ""}
        onChange={(ev) => setConfirmEmail(ev.target.value)}
      />
      <div style={bigStyles.jdbEmailPrivacyAndTOC}>
        By clicking submit, you agree to our{" "}
        <a href="" target="_blank" style={{ ...bigStyles.noDecorationLinks, padding: "0", textDecoration: "underline" }}>
          Terms and Conditions
        </a>{" "}
        and{" "}
        <a href="" target="_blank" style={{ ...bigStyles.noDecorationLinks, padding: "0", textDecoration: "underline" }}>
          Privacy Policy
        </a>
        .
      </div>
      {loading ? (
        <button id="jdb-Submit-ButtonId" style={windowWidth > 768 ? bigStyles.jdbSubmitButtonId : smallStyles.jdbSubmitButtonId}>
          <LoadingComponent height="20px" width="20px" borderWidth="2px" />
        </button>
      ) : (
        <button
          id="jdb-Submit-ButtonId"
          disabled={!allowSubmit}
          style={
            windowWidth > 768
              ? { ...bigStyles.jdbSubmitButtonId, color: !allowSubmit ? "gray" : "white" }
              : { ...smallStyles.jdbSubmitButtonId, color: !allowSubmit ? "gray" : "white" }
          }
        >
          Submit
        </button>
      )}
    </form>
  );
};
