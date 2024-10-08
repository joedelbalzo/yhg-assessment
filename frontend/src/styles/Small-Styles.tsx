import loadFonts from "../components/FontLoader";

loadFonts();

interface StyleSchema {
  [key: string]: React.CSSProperties;
}

export const smallStyles: StyleSchema = {
  jdbH1: {
    fontFamily: "'Gilroy-SemiBold', 'Tahoma', sans-serif",
    width: "99%",
    margin: "1rem auto",
    textAlign: "center",
    fontSize: "28px",
    letterSpacing: ".5px",
    textShadow: "rgba(0,0,0,.7)",
  },
  jdbHomeDiv: {
    fontFamily: "'Gilroy-Regular', 'Tahoma', sans-serif",
    width: "100%",
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
    margin: "1.5rem 0",
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
    flexWrap: "wrap",
  },
  flexChild: {
    margin: "8px .25rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  jdbButtonId: {
    fontFamily: "'Gilroy-Regular', 'Tahoma', sans-serif",

    fontSize: "calc(11px + .5vw)",
    outline: "2px solid transparent",
    backgroundColor: "transparent",
    padding: "auto 2px",
    border: "transparent",
    borderRadius: ".5rem",
    height: "55px",
    minWidth: "75px",
    maxWidth: "100px",
    wordWrap: "normal",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbQuestions: {
    fontSize: "calc(16px + 1vw)",
    wordWrap: "normal",
    lineHeight: "1.3rem",
    fontWeight: "300",
    textAlign: "center",
    maxWidth: "90%",
    margin: "1.5rem auto",
    height: "fit-content",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbQuestionSmallerFont: {
    fontSize: "calc(12px + 1vw)",
    fontFamily: "'Gilroy-Regular', 'Tahoma', sans-serif",
    wordWrap: "normal",
    lineHeight: "1.3rem",
    fontWeight: "300",
    textAlign: "center",
    maxWidth: "90%",
    margin: "1.5rem auto",
    height: "fit-content",
    color: "white",
    textShadow: "1px 1px 2px black",
  },

  jdbCodeForm: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridAutoRows: "auto",
    rowGap: ".2rem",
    minWidth: "75%",
    maxWidth: "95%",
    margin: "1rem auto 0",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbEmailForm: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridAutoRows: "auto",
    rowGap: ".4rem",
    minWidth: "85%",
    maxWidth: "95%",
    margin: "1rem auto 0",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbEmailPrivacyAndTOC: {
    fontFamily: "'Gilroy-Light', 'Tahoma', sans-serif",
    fontSize: "11px",
    margin: "auto",
    gridColumn: "1 / 3",
    gridRow: "4",
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
    fontSize: "calc(2vw + .2rem)",
    // borderBottomRightRadius: ".3rem",
    minWidth: "80%",
    maxWidth: "90%",
    margin: "0 auto",
    color: "white",
  },

  emailsDontMatch: {
    gridColumn: "1 / 3",
    gridRow: "3",
    textAlign: "center",
    color: "red",
    fontSize: "16px",
    height: "19px",
    fontWeight: "250px",
    textShadow: "1px 1px 16px rgba(50,50,50,.5)",
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
    height: "60px",
    width: "150px",
    color: "white",
    textShadow: "1px 1px 2px black",
  },

  jdbResetButton: {
    margin: "1rem 1rem 2rem",
    width: "100px",
    outline: "1px solid #f15e22",
    backgroundColor: "transparent",
    padding: "1rem ",
    border: "transparent",
    borderRadius: ".25rem",
    color: "white",
    textShadow: "1px 1px 2px black",
  },
  jdbContinueButton: {
    margin: ".5rem auto 1rem",
    width: "90%",
    outline: "2px solid transparent",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textWrap: "wrap",
    padding: ".2rem ",
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
