import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { bigStyles } from "../Big-Styles";

declare global {
  interface Window {
    grecaptcha: any;
    recaptchaLoaded?: boolean; // Flag to indicate if reCAPTCHA is loaded
  }
}

interface ReCaptchaProps {
  onVerify: (verified: boolean) => void;
}

interface ReCaptchaResponse {
  verified: boolean;
  score?: number;
}

const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerify }) => {
  const [errorMessage, setErrorMessage] = useState("");

  const apiEnv = import.meta.env.VITE_API_ENV || "development";
  const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
  const url = `${baseURL}/recaptcha/verify-captcha`;

  const handleVerify = useCallback(
    (token: string, version: string) => {
      axios
        .post<ReCaptchaResponse>(url, { token, version })
        .then((response) => {
          const { verified } = response.data;
          if (!verified) {
            setErrorMessage("Verification failed. Please try again.");
            loadReCaptchaV2();
          } else {
            onVerify(verified);
            setErrorMessage("");
          }
        })
        .catch((error) => {
          console.error("Error verifying reCAPTCHA:", error);
          setErrorMessage("Verification failed. Please try again.");
          onVerify(false);
          loadReCaptchaV2();
        });
    },
    [onVerify, url]
  );

  const loadReCaptchaV2 = useCallback(() => {
    if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
      window.grecaptcha.render("recaptcha-container", {
        sitekey: "YOUR_V2_SITE_KEY",
        callback: (response: string) => {
          handleVerify(response, "v2");
        },
      });
    } else {
      console.log("ReCaptcha V2 not ready, loading script.");
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: "YOUR_V2_SITE_KEY",
          callback: (response: string) => {
            handleVerify(response, "v2");
          },
        });
      };
      script.onerror = (e) => console.error("Script load error:", e);
    }
  }, [handleVerify]);

  useEffect(() => {
    const scriptId = "recaptcha-script";
    if (!window.recaptchaLoaded && !document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.google.com/recaptcha/api.js?render=6LclbgAqAAAAAM4_0-56A6GaYv6XM286cM48Naj3";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        window.recaptchaLoaded = true;
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute("6LclbgAqAAAAAM4_0-56A6GaYv6XM286cM48Naj3", { action: "submit" })
            .then((token: string) => handleVerify(token, "v3"))
            .catch((error: any) => console.error("reCAPTCHA execute error:", error));
        });
      };
      script.onerror = (e: Event | string) => console.error("Script load error:", e);
    } else if (window.recaptchaLoaded) {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute("6LclbgAqAAAAAM4_0-56A6GaYv6XM286cM48Naj3", { action: "submit" })
          .then((token: string) => handleVerify(token, "v3"))
          .catch((error: any) => console.error("reCAPTCHA execute error:", error));
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
