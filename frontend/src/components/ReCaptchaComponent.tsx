import React, { useEffect, useState, useCallback } from "react";
import { styles } from "../JDB-Styles";

declare global {
  interface Window {
    grecaptcha: any;
    onReCaptchaLoad: () => void;
  }
}

interface ReCaptchaProps {
  onVerify: () => void;
}

const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerify }) => {
  const loadReCaptcha = useCallback(() => {
    window.onReCaptchaLoad = () => {
      window.grecaptcha.render("recaptcha-container", {
        sitekey: "6LeP2N4pAAAAAAwR3W_Tp20n0cli_8H3Mx7xQsCY",
        callback: onVerify,
      });
    };

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoad&render=explicit";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [onVerify]);

  useEffect(() => {
    loadReCaptcha();
  }, [loadReCaptcha]);

  return (
    <div style={styles.reCaptcha}>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default ReCaptcha;
