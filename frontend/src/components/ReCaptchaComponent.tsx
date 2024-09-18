// ReCaptchaComponent.tsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { bigStyles } from "../styles/Big-Styles";
import { useBook } from "../BookContext";

declare global {
  interface Window {
    grecaptcha: any;
    recaptchaLoaded?: boolean;
    onloadCallback?: () => void;
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
  const { bookType } = useBook();

  const [isV2Verified, setIsV2Verified] = useState(false);
  const [isV3Verified, setIsV3Verified] = useState(false);
  const [reloadV2, setReloadV2] = useState(0); // Use a number to force re-render

  const apiEnv = import.meta.env.VITE_API_ENV || "development";
  const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";
  const url = `${baseURL}/recaptcha/verify-captcha`;

  // Define handleVerify first
  const handleVerify = useCallback(
    (token: string, version: string): void => {
      axios
        .post<ReCaptchaResponse>(url, { token, version })
        .then((response) => {
          const { verified } = response.data;
          if (!verified) {
            setErrorMessage("Verification failed. Please try again.");
            if (version === "v2") {
              setIsV2Verified(false);
              setReloadV2((prev) => prev + 1); // Trigger reloading reCAPTCHA V2
            } else if (version === "v3") {
              setIsV3Verified(false);
            }
          } else {
            setErrorMessage("");
            if (version === "v2") {
              setIsV2Verified(true);
            } else if (version === "v3") {
              setIsV3Verified(true);
            }
          }
        })
        .catch((error) => {
          console.error("Error verifying reCAPTCHA:", error);
          setErrorMessage("Verification failed. Please try again.");
          if (version === "v2") {
            setIsV2Verified(false);
            setReloadV2((prev) => prev + 1); // Trigger reloading reCAPTCHA V2
          } else if (version === "v3") {
            setIsV3Verified(false);
          }
        });
    },
    [url]
  );

  // Load reCAPTCHA v3 (invisible)
  useEffect(() => {
    const scriptId = "recaptcha-script-v3";
    if (!document.getElementById(scriptId)) {
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
            .execute("6LclbgAqAAAAAM4_0-56A6GaYv6XM286cM48Naj3", {
              action: "submit",
            })
            .then((token: string) => handleVerify(token, "v3"))
            .catch((error: any) => console.error("reCAPTCHA execute error:", error));
        });
      };
      script.onerror = (e: Event | string) => console.error("Script load error:", e);
    } else {
      if (window.recaptchaLoaded) {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute("6LclbgAqAAAAAM4_0-56A6GaYv6XM286cM48Naj3", {
              action: "submit",
            })
            .then((token: string) => handleVerify(token, "v3"))
            .catch((error: any) => console.error("reCAPTCHA execute error:", error));
        });
      }
    }
  }, [handleVerify]);

  // Load and reload reCAPTCHA V2
  useEffect(() => {
    if (bookType === "digitalCopy") {
      // Clear existing reCAPTCHA container
      const container = document.getElementById("recaptcha-container");
      if (container) {
        container.innerHTML = "";
      }

      // Define onloadCallback
      window.onloadCallback = () => {
        if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
          window.grecaptcha.render("recaptcha-container", {
            sitekey: "6LfcqhAqAAAAAKy8DrWDbHcs8P2Vmkyldwu8d2Tm",
            callback: (response: string) => {
              handleVerify(response, "v2");
            },
          });
        } else {
          console.error("grecaptcha is not ready in onloadCallback");
        }
      };

      if (document.getElementById("recaptcha-script-v2")) {
        // Script is already loaded, call onloadCallback directly
        window.onloadCallback();
      } else {
        console.log("ReCaptcha V2 not ready, loading script.");
        const script = document.createElement("script");
        script.id = "recaptcha-script-v2";
        script.src = "https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        script.onerror = (e) => console.error("Script load error:", e);
      }
    }
  }, [bookType, reloadV2, handleVerify]);

  // Monitor verification status
  useEffect(() => {
    if (bookType === "digitalCopy") {
      onVerify(isV2Verified && isV3Verified);
    } else {
      onVerify(isV2Verified || isV3Verified);
    }
  }, [bookType, isV2Verified, isV3Verified, onVerify]);

  return (
    <div>
      {bookType === "digitalCopy" && <div id="recaptcha-container" style={bigStyles.reCaptcha}></div>}
      {errorMessage && <div style={bigStyles.reCaptchaChild}>{errorMessage}</div>}
    </div>
  );
};

export default ReCaptcha;
