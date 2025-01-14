// hooks/useRecaptchaV3.ts
import { useEffect, useCallback, useState } from "react";
import axios from "axios";

interface UseRecaptchaV3Props {
  baseURL: string;
  onVerify: (verified: boolean) => void;
}

export function useRecaptchaV3({ baseURL, onVerify }: UseRecaptchaV3Props) {
  const [errorMessage, setErrorMessage] = useState("");
  const siteKey = import.meta.env.VITE_V3_SITE_KEY;

  const handleV3Verify = useCallback(
    (token: string) => {
      axios
        .post(`${baseURL}/recaptcha/verify-captcha`, { token, version: "v3" })
        .then(({ data }) => {
          data.verified ? onVerify(true) : setErrorMessage("ReCAPTCHA v3 failed. Refresh to try again.");
        })
        .catch(() => setErrorMessage("ReCAPTCHA v3 error. Refresh to try again."));
    },
    [baseURL, onVerify]
  );

  useEffect(() => {
    const scriptId = "recaptcha-script-v3";
    if (!document.getElementById(scriptId)) {
      const scriptV3 = document.createElement("script");
      scriptV3.id = scriptId;
      scriptV3.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      scriptV3.async = true;
      scriptV3.defer = true;
      scriptV3.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(siteKey, { action: "submit" }).then((token: string) => handleV3Verify(token));
          });
        }
      };
      document.body.appendChild(scriptV3);
    } else {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action: "submit" }).then((token: string) => handleV3Verify(token));
        });
      }
    }
  }, [siteKey, handleV3Verify]);

  return { errorMessage };
}
