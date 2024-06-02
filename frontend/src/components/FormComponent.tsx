import React, { useState, useEffect } from "react";
import { bigStyles } from "../Big-Styles";
import { smallStyles } from "../Small-Styles";
import ReCaptcha from "./ReCaptchaComponent";
import LoadingComponent from "./LoadingComponent";
import { CodeJDB, EmailJDB } from "../types";

interface FormComponentProps {
  handleCodeSubmission: (event: React.FormEvent<HTMLFormElement>) => void;
  continueToEmailForm: (event: React.FormEvent<HTMLFormElement>) => void;
  code: CodeJDB;
  setCode: (code: CodeJDB) => void;
  email: EmailJDB;
  setEmail: (email: EmailJDB) => void;
  confirmEmail: EmailJDB;
  setConfirmEmail: (email: EmailJDB) => void;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  loading: boolean;
  windowWidth: number;
}

export const CodeFormComponent: React.FC<FormComponentProps> = ({
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
      <ReCaptcha onVerify={() => setIsVerified(true)} />
      {loading ? (
        <button id="jdb-Submit-ButtonId" style={windowWidth > 768 ? bigStyles.jdbSubmitButtonId : smallStyles.jdbSubmitButtonId}>
          <LoadingComponent height="20px" width="20px" borderWidth="2px" />
        </button>
      ) : (
        <button
          id="jdb-Submit-ButtonId"
          disabled={!isVerified}
          style={windowWidth > 768 ? bigStyles.jdbSubmitButtonId : smallStyles.jdbSubmitButtonId}
        >
          Submit
        </button>
      )}
    </form>
  );
};

export const EmailFormComponent: React.FC<FormComponentProps> = ({
  handleCodeSubmission,
  email,
  setEmail,
  confirmEmail,
  setConfirmEmail,
  isVerified,
  setIsVerified,
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
        style={windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput}
        placeholder="Enter your e-mail address"
        value={email || ""}
        onChange={(ev) => setEmail(ev.target.value)}
      />
      <input
        id="jdb-Input"
        style={windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput}
        placeholder="Confirm your e-mail address"
        value={confirmEmail || ""}
        onChange={(ev) => setConfirmEmail(ev.target.value)}
      />
      {confirmEmail !== email && (
        <div style={windowWidth > 768 ? bigStyles.emailsDontMatch : smallStyles.emailsDontMatch}>Emails don't match.</div>
      )}
      {loading ? (
        <button
          id="jdb-Submit-ButtonId"
          style={{ gridRow: "4", ...(windowWidth > 768 ? bigStyles.jdbSubmitButtonId : smallStyles.jdbSubmitButtonId) }}
        >
          <LoadingComponent height="20px" width="20px" borderWidth="2px" />
        </button>
      ) : (
        <button
          id="jdb-Submit-ButtonId"
          disabled={!allowSubmit}
          style={{ gridRow: "4", ...(windowWidth > 768 ? bigStyles.jdbSubmitButtonId : smallStyles.jdbSubmitButtonId) }}
        >
          Submit
        </button>
      )}
    </form>
  );
};
