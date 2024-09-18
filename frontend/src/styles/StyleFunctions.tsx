import React, { useState, useEffect, CSSProperties } from "react";
import { bigStyles } from "./Big-Styles";
import { smallStyles } from "./Small-Styles";
import { useBook } from "../BookContext";

interface ResponsiveStyles {
  questionStyle: CSSProperties;
  questionStyleSmaller: CSSProperties;
  flexStyle: CSSProperties;
  buttonIdStyle: CSSProperties;
  flexChildStyle: CSSProperties;
  h1Style: CSSProperties;
  animationDivStyle: CSSProperties;
  resetButtonStyle: CSSProperties;
  continueButtonStyle: CSSProperties;
  noDecorationLinksStyle: CSSProperties;
  jdbCodeFormStyle: CSSProperties;
  jdbInputStyle: CSSProperties;
  reCaptchaStyle: CSSProperties;
  jdbSubmitButtonIdStyle: CSSProperties;
}

export const useResponsiveStyles = () => {
  const { windowWidth } = useBook();
  return {
    questionStyle: windowWidth > 768 ? bigStyles.jdbQuestions : smallStyles.jdbQuestions,
    questionStyleSmaller: windowWidth > 768 ? bigStyles.jdbQuestionSmallerFont : smallStyles.jdbQuestionSmallerFont,
    flexStyle: windowWidth > 768 ? bigStyles.flex : smallStyles.flex,
    buttonIdStyle: windowWidth > 768 ? bigStyles.jdbButtonId : smallStyles.jdbButtonId,
    flexChildStyle: windowWidth > 768 ? bigStyles.flexChild : smallStyles.flexChild,
    h1Style: windowWidth > 768 ? bigStyles.jdbH1 : smallStyles.jdbH1,
    animationDivStyle: windowWidth > 768 ? bigStyles.jdbAnimationDiv : smallStyles.jdbAnimationDiv,
    resetButtonStyle: windowWidth > 768 ? bigStyles.jdbResetButton : smallStyles.jdbResetButton,
    continueButtonStyle: windowWidth > 768 ? bigStyles.jdbContinueButton : smallStyles.jdbContinueButton,
    noDecorationLinksStyle: windowWidth > 768 ? bigStyles.noDecorationLinks : smallStyles.noDecorationLinks,
    jdbCodeFormStyle: windowWidth > 768 ? bigStyles.jdbCodeForm : smallStyles.jdbCodeForm,
    jdbInputStyle: windowWidth > 768 ? bigStyles.jdbInput : smallStyles.jdbInput,
    reCaptchaStyle: windowWidth > 768 ? bigStyles.reCaptcha : smallStyles.reCaptcha,
    jdbSubmitButtonIdStyle: windowWidth > 768 ? bigStyles.jdbSubmitButtonId : smallStyles.jdbSubmitButtonId,
  };
};
