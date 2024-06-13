interface StyleSchema {
  [key: string]: React.CSSProperties;
}

export const bigStyles: StyleSchema = {
  jdbH1: {
    fontFamily: "'Gilroy-Bold', 'Tahoma', sans-serif",
    width: "80%",
    margin: "1rem auto",
    textAlign: "center",
  },
  jdbHomeDiv: {
    // minHeight: "500px",
    fontFamily: "'Gilroy-Bold', 'Tahoma', sans-serif",
    width: "80%",
    margin: "1rem auto",
    // backgroundColor: "rgb(250,250,250)",
    outline: "2px solid #ed2b72",
    borderRadius: "4px",
    borderTopRightRadius: "6rem",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
    boxShadow: ".5rem .5rem 2rem .5rem #25355199",
  },
  jdbAnimationDiv: {
    margin: "1rem 0",
    // minHeight: "200px",
    flexGrow: "1",
    overflow: "hidden",
  },
  jdbH2: {
    textAlign: "center",
    fontWeight: "300",
    fontSize: "2rem",
    margin: "1rem auto",
    padding: "1rem",
  },
  flex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  flexChild: {
    margin: "8px 1rem",
  },
  jdbQuestions: {
    fontSize: "2rem",
    lineHeight: "2rem",
    fontWeight: "300",
    textAlign: "center",
    minWidth: "300px",
    maxWidth: "80%",
    margin: "1rem auto 2rem",
    height: "fit-content",
  },
  jdbButtonId: {
    fontSize: "calc(1vw + .5rem)",
    outline: "2px solid #253551",
    backgroundColor: "transparent",
    padding: "auto 1rem",
    border: "transparent",
    borderRadius: ".5rem",
    height: "100px",
  },
  jdbCodeForm: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "30px 0px 0px 75px 75px",
    rowGap: "1rem",
    width: "350px",
    margin: "1rem auto 0",
  },
  jdbEmailForm: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "30px 30px 16px 0px 75px",
    rowGap: "1rem",
    width: "350px",
    margin: "1rem auto 0",
  },

  jdbInput: {
    gridColumn: "1 / 3",
    alignContent: "center",
    justifyItems: "center",
    padding: "0",
    border: "none",
    borderBottom: "2px solid #253551",
    backgroundColor: "transparent",
    textAlign: "center",
    fontSize: "calc(1vw + .5rem)",
    borderBottomRightRadius: ".3rem",
    minWidth: "300px",
  },

  emailsDontMatch: {
    gridColumn: "1 / 3",
    gridRow: "3",
    textAlign: "center",
    color: "red",
    fontSize: "12px",
  },

  reCaptcha: {
    gridColumn: "1 / 3 ",
    margin: "0 auto",
    gridRow: "4",
  },

  jdbSubmitButtonId: {
    gridRow: "5",
    gridColumn: " 1 / 3",
    margin: "0 auto",
    fontSize: "calc(1vw + .5rem)",
    outline: "2px solid #253551",
    backgroundColor: "transparent",
    padding: "auto 1rem",
    border: "transparent",
    borderRadius: ".5rem",
    height: "70px",
    width: "150px",
  },

  jdbResetButton: {
    margin: "0 2rem 2rem",
    width: "100px",
    outline: "2px solid #253551",
    backgroundColor: "transparent",
    padding: "1rem ",
    border: "transparent",
    borderRadius: ".5rem",
  },
  jdbContinueButton: {
    margin: "2rem auto 2rem",
    width: "550px",
    outline: "2px solid #253551",
    backgroundColor: "transparent",
    padding: "1rem ",
    border: "transparent",
    borderRadius: ".5rem",
  },
  noDecorationLinks: {
    textDecoration: "none",
    color: "inherit",
    padding: ".5rem",
  },
  jdbErrorMessages: {
    width: "80%",
    margin: "3rem auto",
    fontSize: "18px",
  },
  unclicked: {
    width: "100px",
    display: "flex",
    justifyContent: "center",
    transform: "rotate(0deg)",
    transformOrigin: "center",
    transition: "transform .3s ease-in-out",
    padding: "0",
    margin: "0 auto",
    overflow: "hidden",
    cursor: "pointer",
  },
  clicked: {
    width: "100px",
    display: "flex",
    justifyContent: "center",
    transform: "rotate(180deg)",
    transformOrigin: "center",
    transition: "transform .3s ease-in-out",
    padding: "0",
    margin: "0 auto",
    overflow: "hidden",
    cursor: "pointer",
  },
};
