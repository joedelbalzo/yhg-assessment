import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { bigStyles } from "../Big-Styles";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface ReCaptchaProps {
  onVerify: (verified: boolean) => void;
}

const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerify }) => {
  const [errorMessage, setErrorMessage] = useState("");

  const apiEnv = import.meta.env.VITE_API_ENV || "development";
  const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
  const url = `${baseURL}/recaptcha/verify-captcha`;

  const handleVerify = useCallback(
    (token: string) => {
      axios
        .post(url, { token })
        .then((response) => {
          const { verified, score } = response.data;
          console.log(`score: ${score}`);
          onVerify(verified);
          setErrorMessage("");
        })
        .catch((error) => {
          console.error("Error verifying reCAPTCHA:", error);
          onVerify(false);
          setErrorMessage("Verification failed. Please try again.");
          //insert a backup plan? a v2 checkbox?
        });
    },
    [onVerify, url]
  );

  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=6LclbgAqAAAAAM4_0-56A6GaYv6XM286cM48Naj3";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        console.log("reCAPTCHA script loaded.");
        window.grecaptcha.ready(() => {
          console.log("reCAPTCHA is ready.");
          window.grecaptcha
            .execute("6LclbgAqAAAAAM4_0-56A6GaYv6XM286cM48Naj3", { action: "submit" })
            .then(handleVerify)
            .catch((error: Error) => console.error("reCAPTCHA execute error:", error));
        });
      };
      script.onerror = (e: Event | string) => {
        console.error("Script load error:", e);
      };
    } else {
      console.log("reCAPTCHA script already loaded, executing directly.");
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute("6LclbgAqAAAAAM4_0-56A6GaYv6XM286cM48Naj3", { action: "submit" })
          .then(handleVerify)
          .catch((error: Error) => console.error("reCAPTCHA execute error:", error));
      });
    }
  }, [handleVerify]);

  return (
    <div>
      <div id="recaptcha-container" style={bigStyles.reCaptcha}></div>
      {errorMessage && <div style={bigStyles.reCaptchaChild}>{errorMessage}</div>}
    </div>
  );
};

export default ReCaptcha;
