import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useBook } from "../BookContext";
import { bigStyles } from "../styles/Big-Styles";

declare global {
  interface Window {
    grecaptcha: any;
    recaptchaLoaded?: boolean;
    onloadCallback?: () => void;
  }
}

interface ReCaptchaResponse {
  verified: boolean;
  score?: number;
}

interface ReCaptchaProps {
  onVerify: (verified: boolean) => void;
}

const ReCaptchaComponent: React.FC<ReCaptchaProps> = ({ onVerify }) => {
  const { bookType, purchasedOrBorrowed } = useBook();

  const apiEnv = import.meta.env.VITE_API_ENV || "development";
  const baseURL = apiEnv === "development" ? "http://localhost:3000/api" : "https://yhg-code-redemption.onrender.com/api";

  const V3_SITE_KEY = import.meta.env.VITE_V3_SITE_KEY as string;
  const V2_SITE_KEY = import.meta.env.VITE_V2_SITE_KEY as string;

  const [v3Status, setV3Status] = useState<"pending" | "pass" | "fail">("pending");
  const [v2Status, setV2Status] = useState<"idle" | "pass" | "fail" | "loading">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const v2ContainerRef = useRef<HTMLDivElement | null>(null);

  /**
   * Step 1: Always attempt v3 first on mount
   */
  const handleV3Verify = useCallback(
    (token: string) => {
      axios
        .post(`${baseURL}/recaptcha/verify-captcha`, { token, version: "v3" })
        .then(({ data }) => {
          if (data.verified && data.score >= 0.5) {
            setV3Status("pass");
          } else {
            setV3Status("fail");
            setErrorMessage("reCAPTCHA v3 failed; will load v2.");
          }
        })
        .catch(() => {
          setV3Status("fail");
          setErrorMessage("Error verifying reCAPTCHA v3; will load v2.");
        });
    },
    [baseURL]
  );

  useEffect(() => {
    const scriptId = "recaptcha-script-v3";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${V3_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(V3_SITE_KEY, { action: "submit" }).then((token: string) => handleV3Verify(token));
          });
        }
      };
      document.body.appendChild(script);
    } else {
      // Already loaded
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(V3_SITE_KEY, { action: "submit" }).then((token: string) => handleV3Verify(token));
        });
      }
    }
  }, [handleV3Verify, V3_SITE_KEY]);

  /**
   * Step 2: V2 callback
   */
  const handleV2Verify = useCallback(
    (token: string) => {
      axios
        .post(`${baseURL}/recaptcha/verify-captcha`, { token, version: "v2" })
        .then(({ data }) => {
          if (data.verified) {
            setV2Status("pass");
            setErrorMessage("");
          } else {
            setV2Status("fail");
            setErrorMessage("reCAPTCHA v2 failed. Please try again.");
          }
        })
        .catch(() => {
          setV2Status("fail");
          setErrorMessage("Error verifying reCAPTCHA v2.");
        });
    },
    [baseURL]
  );

  /**
   * Step 3: Load/Render V2 if needed
   * - If digitalCopy, we ALWAYS load v2 after v3 finishes (pass or fail).
   * - If non-digital & v3 fails => fallback to v2.
   */
  useEffect(() => {
    const v3Done = v3Status === "pass" || v3Status === "fail";
    const needsBoth = (bookType === "digitalCopy" || (bookType == "physicalCopy" && purchasedOrBorrowed == "borrowed")) && v3Done;
    const fallbackNeeded = !needsBoth && v3Status === "fail";

    if (!needsBoth && !fallbackNeeded) return;

    // We get here if (digital copy) or (v3 fail for non-digital)
    setV2Status("loading");

    // Wait for the container div
    if (!v2ContainerRef.current) return;
    v2ContainerRef.current.innerHTML = "";

    window.onloadCallback = () => {
      if (window.grecaptcha && typeof window.grecaptcha.render === "function" && v2ContainerRef.current) {
        window.grecaptcha.render(v2ContainerRef.current, {
          sitekey: V2_SITE_KEY,
          callback: (token: string) => handleV2Verify(token),
        });
      }
    };

    const scriptId = "recaptcha-script-v2";
    if (!document.getElementById(scriptId)) {
      const scriptV2 = document.createElement("script");
      scriptV2.id = scriptId;
      scriptV2.src = "https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit";
      scriptV2.async = true;
      scriptV2.defer = true;
      document.body.appendChild(scriptV2);
    } else {
      window.onloadCallback && window.onloadCallback();
    }
  }, [bookType, v3Status, V2_SITE_KEY, handleV2Verify]);

  /**
   * Step 4: Final pass/fail
   *  - digitalCopy => need BOTH v3 & v2 = pass
   *  - else => pass if v3Status="pass" OR v2Status="pass"
   */
  const finalVerified =
    bookType === "digitalCopy" || (bookType == "physicalCopy" && purchasedOrBorrowed == "borrowed")
      ? v3Status === "pass" && v2Status === "pass"
      : v3Status === "pass" || v2Status === "pass";

  useEffect(() => {
    onVerify(finalVerified);
  }, [finalVerified, onVerify]);

  return (
    <div>
      <div ref={v2ContainerRef} style={bigStyles.reCaptcha} />
      {errorMessage && <div style={bigStyles.reCaptchaChild}>{errorMessage}</div>}
    </div>
  );
};

export default ReCaptchaComponent;
