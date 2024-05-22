import React, { useEffect } from "react";
import { styles } from "../JDB-Styles";
import ReCaptcha from "./ReCaptchaComponent";
import LoadingComponent from "./LoadingComponent";

interface FormComponentProps {
  handleCode: (event: React.FormEvent<HTMLFormElement>) => void;
  code: string;
  setCode: (code: string) => void;
  email: string;
  setEmail: (email: string) => void;
  confirmEmail: string;
  setConfirmEmail: (email: string) => void;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  loading: boolean;
}

const FormComponent: React.FC<FormComponentProps> = ({
  handleCode,
  code,
  setCode,
  email,
  setEmail,
  confirmEmail,
  setConfirmEmail,
  isVerified,
  setIsVerified,
  loading,
}) => {
  useEffect(() => {
    if (email == confirmEmail) {
      setIsVerified(true);
    } else setIsVerified(false);
  }, [email, confirmEmail, ReCaptcha, isVerified]);

  return (
    <form id="jdb-Form" style={styles.jdbForm} onSubmit={handleCode}>
      <input
        id="jdb-Input"
        style={styles.jdbInput}
        placeholder="Enter your code."
        value={code || ""}
        onChange={(ev) => setCode(ev.target.value)}
      />
      <input
        id="jdb-Input"
        style={styles.jdbInput}
        placeholder="Enter your e-mail address"
        value={email || ""}
        onChange={(ev) => setEmail(ev.target.value)}
      />
      <input
        id="jdb-Input"
        style={styles.jdbInput}
        placeholder="Confirm your e-mail address"
        value={confirmEmail || ""}
        onChange={(ev) => setConfirmEmail(ev.target.value)}
      />
      {confirmEmail !== email && <div style={styles.emailsDontMatch}>Emails don't match.</div>}
      <ReCaptcha onVerify={() => setIsVerified(true)} />
      {loading ? (
        <button id="jdb-Submit-ButtonId" style={styles.jdbSubmitButtonId}>
          <LoadingComponent height="20px" width="20px" borderWidth="2px" />
        </button>
      ) : (
        <button id="jdb-Submit-ButtonId" disabled={!isVerified} style={styles.jdbSubmitButtonId}>
          Submit
        </button>
      )}
    </form>
  );
};

export default FormComponent;
