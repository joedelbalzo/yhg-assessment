import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { bigStyles } from "../Big-Styles";
declare global {
  interface Window {
    grecaptcha: any;
    onReCaptchaLoad: () => void;
  }
}

interface ReCaptchaProps {
  onVerify: (verified: boolean) => void;
}

const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerify }) => {
  const handleVerify = useCallback(
    (token: string) => {
      axios
        .post("/api/recaptcha/verify-captcha", { token })
        .then((response) => {
          console.log("recaptcha success");
          const { verified } = response.data;
          onVerify(verified);
        })
        .catch((error) => {
          console.error("Error verifying reCAPTCHA:", error);
          onVerify(false);
        });
    },
    [onVerify]
  );

  const loadReCaptcha = useCallback(() => {
    window.onReCaptchaLoad = () => {
      window.grecaptcha.render("recaptcha-container", {
        sitekey: "6LeP2N4pAAAAAAwR3W_Tp20n0cli_8H3Mx7xQsCY",
        callback: handleVerify,
      });
    };

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoad&render=explicit";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [handleVerify]);

  useEffect(() => {
    loadReCaptcha();
  }, [loadReCaptcha]);

  return (
    <div style={bigStyles.reCaptcha}>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default ReCaptcha;
