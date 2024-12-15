// hooks/useRecaptchaV2.ts
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface UseRecaptchaV2Props {
  baseURL: string;
  active: boolean; // is v2 needed right now? (e.g. only needed for digitalCopy)
  onVerify: (verified: boolean) => void;
}

export function useRecaptchaV2({ baseURL, active, onVerify }: UseRecaptchaV2Props) {
  const [errorMessage, setErrorMessage] = useState("");
  const [reload, setReload] = useState(0);
  const siteKey = import.meta.env.VITE_V2_SITE_KEY; // your public v2 site key

  const handleV2Verify = useCallback(
    (token: string) => {
      axios
        .post(`${baseURL}/recaptcha/verify-captcha`, { token, version: "v2" })
        .then(({ data }) => {
          if (data.verified) {
            onVerify(true);
            setErrorMessage("");
          } else {
            onVerify(false);
            setErrorMessage("ReCAPTCHA v2 failed. Try again.");
            setReload((prev) => prev + 1); // reload the widget
          }
        })
        .catch(() => {
          onVerify(false);
          setErrorMessage("ReCAPTCHA v2 error during verification.");
          setReload((prev) => prev + 1);
        });
    },
    [baseURL, onVerify]
  );

  useEffect(() => {
    if (!active) return;
    const container = document.getElementById("recaptcha-container");
    if (container) container.innerHTML = "";

    window.onloadCallback = () => {
      if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: siteKey,
          callback: handleV2Verify,
        });
      }
    };

    const existingScript = document.getElementById("recaptcha-script-v2");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "recaptcha-script-v2";
      script.src = "https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else {
      window.onloadCallback && window.onloadCallback();
    }
  }, [active, reload, handleV2Verify, siteKey]);

  return { errorMessage };
}
