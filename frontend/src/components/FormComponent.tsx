import React, { useState, useEffect } from "react";
import { bigStyles } from "../Big-Styles";
import { smallStyles } from "../Small-Styles";
import ReCaptcha from "./ReCaptchaComponent";
import LoadingComponent from "./LoadingComponent";
import { CodeJDB, EmailJDB } from "../types";

interface EmailFormComponentProps {
  handleCodeSubmission: (event: React.FormEvent<HTMLFormElement>) => void;
  email: EmailJDB;
  setEmail: (email: EmailJDB) => void;
  confirmEmail: EmailJDB;
  setConfirmEmail: (email: EmailJDB) => void;
  emailOptIn: boolean;
  setEmailOptIn: (verified: boolean) => void;
  loading: boolean;
  windowWidth: number;
}
interface CodeFormComponentProps {
  continueToEmailForm: (event: React.FormEvent<HTMLFormElement>) => void;
  code: CodeJDB;
  setCode: (code: CodeJDB) => void;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  loading: boolean;
  windowWidth: number;
}

export const CodeFormComponent: React.FC<CodeFormComponentProps> = ({
  continueToEmailForm,
  code,
  setCode,
  isVerified,
  setIsVerified,
  loading,
  windowWidth,
}) => {
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
export const EbookCodeFormComponent: React.FC<CodeFormComponentProps> = ({
  continueToEmailForm,
  code,
  setCode,
  isVerified,
  setIsVerified,
  loading,
  windowWidth,
}) => {
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
        style={windowWidth > 768 ? { ...bigStyles.jdbInput, gridRow: "3" } : { ...smallStyles.jdbInput, gridRow: "3" }}
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

export const EmailFormComponent: React.FC<EmailFormComponentProps> = ({
  handleCodeSubmission,
  email,
  setEmail,
  confirmEmail,
  setConfirmEmail,
  emailOptIn,
  setEmailOptIn,
  loading,
  windowWidth,
}) => {
  const [allowSubmit, setAllowSubmit] = useState(false);

  useEffect(() => {
    if (!email || !confirmEmail) {
      setAllowSubmit(false);
    } else if (email == confirmEmail) {
      setAllowSubmit(true);
    }
  }, [email, confirmEmail]);

  return (
    <form id="jdb-Form" style={windowWidth > 768 ? bigStyles.jdbEmailForm : smallStyles.jdbEmailForm} onSubmit={handleCodeSubmission}>
      <input
        id="jdb-Input"
        style={{ marginBottom: "12px", gridRow: "1", ...(windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput) }}
        placeholder="Enter your e-mail address"
        value={email || ""}
        onChange={(ev) => setEmail(ev.target.value)}
      />
      <input
        id="jdb-Input"
        style={{ marginBottom: "12px", gridRow: "2", ...(windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput) }}
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
      {confirmEmail !== email ? (
        <div style={windowWidth > 768 ? bigStyles.emailsDontMatch : smallStyles.emailsDontMatch}>Emails don't match.</div>
      ) : (
        <div style={windowWidth > 768 ? bigStyles.emailsDontMatch : smallStyles.emailsDontMatch}> </div>
      )}
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
