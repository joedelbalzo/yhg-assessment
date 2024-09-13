import React from "react";
import { bigStyles } from "../styles/Big-Styles";

export const errorMap = {
  failure: (
    <div style={bigStyles.jdbErrorMessages}>
      Hmm. Something went wrong. <br />
      <br /> You've reached a generic error, meaning your email and code are just fine. <br />
      <br />
      There's a good chance your code and email actually worked, and it's just a communication issue between us and them. Please go back to
      the beginning, click "Signed up, but forgot your unique link? Click here.", and try to recover your domain using your email address.
      If that doesn't work, please email us at info@yourhiddengenius.com and we'll fix this right away!
    </div>
  ),
  tooManyEBooks: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      It seems like there have been too many e-book codes used. Email us at info@yourhiddengenius.com with a screenshot of your receipt from
      your retailer and we'll get it straightened out immediately.
    </div>
  ),
  tooManyLibraryBooks: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      It seems like this library book has been used too many times. <br />
      <br /> If you're having trouble, please email us at info@yourhiddengenius.com
    </div>
  ),

  codeUsed: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      It looks like this code has already been used. Please check your email and spam folders for an email from YouScience. Email us at
      info@yourhiddengenius.com with a screenshot of your receipt from your retailer and we'll get you straightened out immediately.
    </div>
  ),
  invalidCodeFormat: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      Your code's format is incorrect. Please double check the instructions for entering your code. Especially with EBooks. <br />
      <br /> If you're having trouble, please email us at info@yourhiddengenius.com
    </div>
  ),
  invalidEmailFormat: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      Your email format is incorrect. Please go back and confirm that you're entering a standard email@provider.com email address. <br />
      <br /> If you're having trouble, please email us at info@yourhiddengenius.com
    </div>
  ),
  noCode: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      That code is either invalid or does not exist in our system. <br />
      <br /> Please make sure you're entering only numbers, with no letters or symbols, and try again! <br />
      <br /> If you're having trouble, please email us at info@yourhiddengenius.com
    </div>
  ),
  noDomains: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      Our system shows there are no available tests. That can't be right! Please try again. <br />
      <br /> If you're having trouble, please email us at info@yourhiddengenius.com
    </div>
  ),

  noEmail: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      We don't have that email in our database. Please try a different email address. If you're positive it was that one, please reach out
      to info@yourhiddengenius.com and include a picture or screenshot of your purchase receipt.
    </div>
  ),
  duplicateRequest: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      Our system detected that this was a duplicated request. Most likely, your initial request was processed, so please go to the
      beginning, click "Signed up, but forgot your unique link? Click here.", and try to recover your domain using your email address.
      <br />
      <br />
      If that doesn't work, please go through the process of redeeming your code again. <br />
      <br />
      If you're still having issues, please reach out to info@yourhiddengenius.com, include a picture or screenshot of your purchase
      receipt, and we'll get back as soon as possible.
    </div>
  ),
  bigProblem: (
    <div style={bigStyles.jdbErrorMessages}>
      <div style={{ textAlign: "center" }}>Hmm. Something went wrong!</div> <br />
      <br />
      Our system seems to be down at the moment. Please try again. <br />
      <br />
      If you're still having issues, please reach out to info@yourhiddengenius.com and we'll sort this out as soon as possible.
    </div>
  ),
};
