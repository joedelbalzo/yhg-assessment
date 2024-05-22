interface StyleSchema {
  [key: string]: React.CSSProperties;
}

export const styles: StyleSchema = {
  jdbHomeDiv: {
    fontFamily: "'Roboto', sans-serif",
    width: "70%",
    margin: "1rem auto",
    backgroundColor: "#C0D0EA40",
    display: "flex",
    flexDirection: "column",
  },
  jdbAnimationDiv: {
    margin: "1rem 0",
    minHeight: "200px",
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
    fontWeight: "300",
    textAlign: "center",
    minWidth: "300px",
    maxWidth: "700px",
    margin: "0 auto 1rem",
  },
  jdbButtonId: {
    fontSize: "calc(1vw + .5rem)",
    outline: "3px solid #253551",
    backgroundColor: "transparent",
    padding: "auto 1rem",
    border: "transparent",
    borderRadius: ".5rem",
    height: "100px",
  },
  jdbForm: {
    display: "grid",
    gridTemplateColumns: "150px 300px",
    gridTemplateRows: "30px 30px 30px 16px 80px 70px",
    rowGap: "1rem",
    // flexDirection: "column",
    // alignItems: "flex-start",
    width: "450px",
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
    borderBottomRightRadius: "1rem",
    minWidth: "300px",
  },

  emailsDontMatch: {
    gridColumn: "1 / 3",
    gridRow: "4",
    textAlign: "center",

    color: "red",
    fontSize: "12px",
  },

  reCaptcha: {
    gridColumn: "1 / 3 ",
    margin: "0 auto",
    gridRow: "5",
  },

  jdbSubmitButtonId: {
    gridRow: "6",
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
    margin: "0 1rem 1rem",
    width: "100px",
    outline: "2px solid #253551",
    backgroundColor: "transparent",
    padding: "1rem ",
    border: "transparent",
    borderRadius: ".5rem",
  },
};
