interface StyleSchema {
  [key: string]: React.CSSProperties;
}

export const smallStyles: StyleSchema = {
  jdbH1: {
    fontFamily: "'Gilroy-Bold', 'Tahoma', sans-serif",
    width: "95%",
    margin: "1rem auto",
    textAlign: "center",
    fontSize: "36px",
    letterSpacing: ".5px",
  },
  jdbHomeDiv: {
    fontFamily: "'Gilroy-Bold', 'Tahoma', sans-serif",
    width: "98%",
    margin: "1rem auto",
    outline: "1px solid #f15e22",
    borderRadius: "4px",
    borderTopRightRadius: "6rem",
    backgroundColor: "rgba(	37, 53, 81,.3)",
    display: "flex",
    flexDirection: "column",
    boxShadow: ".5rem .5rem 2rem .3rem #253551B3",
    backdropFilter: "blur(3px)",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbAnimationDiv: {
    margin: "1rem 0",
    minHeight: "200px",
    flexGrow: "1",
    overflow: "hidden",
  },
  jdbH2: {
    textAlign: "center",
    fontWeight: "300",
    fontSize: "2rem",
    margin: "1rem auto",
    padding: "1rem",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  flex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  flexChild: {
    margin: "8px .5rem",
  },
  jdbQuestions: {
    fontSize: "2rem",
    lineHeight: "2rem",
    fontWeight: "300",
    textAlign: "center",
    minWidth: "300px",
    maxWidth: "95%",
    margin: "1.5rem auto",
    height: "fit-content",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbButtonId: {
    fontSize: "calc(1vw + .5rem)",
    outline: "2px solid transparent",
    backgroundColor: "transparent",
    padding: "auto .1rem",
    border: "transparent",
    borderRadius: ".5rem",
    height: "75px",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbCodeForm: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "30px 0px 0px 0px 75px",
    rowGap: "1rem",
    width: "95%",
    margin: "1rem auto 0",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbEmailForm: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "30px 30px 16px 0px 75px",
    rowGap: "1rem",
    width: "350px",
    margin: "1rem auto 0",
    color: "white",
    textShadow: "1px 1px 2px black",
  },

  jdbInput: {
    gridColumn: "1 / 3",
    alignContent: "center",
    justifyItems: "center",
    padding: "0",
    border: "none",
    borderBottom: "2px solid #f15e22",
    backgroundColor: "transparent",
    textAlign: "center",
    fontSize: "calc(2vw + .5rem)",
    // borderBottomRightRadius: ".3rem",
    minWidth: "300px",
    maxWidth: "70%",
    margin: "0 auto",
    color: "white",
  },

  emailsDontMatch: {
    gridColumn: "1 / 3",
    gridRow: "3",
    textAlign: "center",
    color: "red",
    fontSize: "16px",
    fontWeight: "250px",
    textShadow: "1px 1px 16px rgba(50,50,50,.5)",
  },

  reCaptcha: {
    gridColumn: "1 / 3 ",
    margin: "0 auto",
    gridRow: "4",
    // maxWidth: "80%",
    transform: "scale(.9)",
  },

  jdbSubmitButtonId: {
    gridRow: "5",
    gridColumn: " 1 / 3",
    margin: "0 auto",
    fontSize: "calc(2vw + .5rem)",
    outline: "2px solid transparent",
    backgroundColor: "transparent",
    padding: "auto 1rem",
    border: "transparent",
    borderRadius: ".5rem",
    height: "70px",
    width: "150px",
    color: "white",
    textShadow: "1px 1px 2px black",
  },

  jdbResetButton: {
    margin: "1rem 1rem 2rem",
    width: "100px",
    outline: "2px solid #f15e22",
    backgroundColor: "transparent",
    padding: "1rem ",
    border: "transparent",
    borderRadius: ".5rem",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbContinueButton: {
    margin: "0 auto 2rem",
    width: "350px",
    outline: "2px solid transparent",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: ".5rem ",
    border: "transparent",
    borderRadius: ".5rem",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  noDecorationLinks: {
    textDecoration: "none",
    color: "inherit",
    padding: ".5rem",
    textShadow: "1px 1px 2px black",
  },
};
