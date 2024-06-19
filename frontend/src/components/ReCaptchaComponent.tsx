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
  const apiEnv = import.meta.env.VITE_API_ENV || "development";
  const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-assessment.onrender.com/api";
  const url = `${baseURL}/recaptcha/verify-captcha`;

  const handleVerify = useCallback(
    (token: string) => {
      axios
        .post(url, { token })
        .then((response) => {
          // console.log("recaptcha success", response.data);
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
    if (window.grecaptcha && window.grecaptcha.render) {
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (recaptchaContainer && !recaptchaContainer.innerHTML) {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: "6LeP2N4pAAAAAAwR3W_Tp20n0cli_8H3Mx7xQsCY",
          callback: handleVerify,
        });
      }
    } else {
      if (!window.onReCaptchaLoad) {
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
      }
    }
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
