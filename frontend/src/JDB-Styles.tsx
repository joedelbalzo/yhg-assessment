interface StyleSchema {
  [key: string]: React.CSSProperties;
}

export const styles: StyleSchema = {
  jdbHomeDiv: {
    fontFamily: "'Roboto', sans-serif",
    width: "70%",
    margin: "0 auto",
    backgroundColor: "#C0D0EA",
  },
  jdbAnimationDiv: {
    margin: "1rem 0",
    minHeight: "200px",
  },
  jdbH2: {
    textAlign: "center",
    fontWeight: "300",
    fontSize: "2rem",
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
    textAlign: "center",
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
    gridTemplateRows: "30px 30px 30px 20px 100px 70px",
    rowGap: "1rem",
    // flexDirection: "column",
    // alignItems: "flex-start",
    width: "450px",
    margin: "1rem auto",
  },
  jdbLabel: {
    gridColumn: "1",
    fontSize: "1rem",
    alignContent: "center",
  },
  jdbInput: {
    gridColumn: "2",
    alignContent: "center",
    justifyItems: "center",
    padding: "0",
    border: "none",
    borderBottom: "2px solid #253551",
    backgroundColor: "transparent",
    textAlign: "center",
    fontSize: "calc(1vw + .5rem)",
    borderBottomRightRadius: "6px",
  },

  emailsDontMatch: {
    gridColumn: "2",
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
    width: "100px",
  },
};
