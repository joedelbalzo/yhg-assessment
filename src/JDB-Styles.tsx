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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "0.1rem auto",
  },
  jdbInput: {
    height: "40px",
    margin: "1rem",
    padding: "0 1rem",
    border: "none",
    borderBottom: "4px solid #253551",
    backgroundColor: "transparent",
    width: "300px",
    textAlign: "center",
    fontSize: "calc(1vw + .5rem)",
    borderRadius: "6px",
  },
  jdbSubmitButtonId: {
    fontSize: "calc(1vw + .5rem)",
    outline: "3px solid #253551",
    backgroundColor: "transparent",
    padding: "auto 1rem",
    border: "transparent",
    borderRadius: ".5rem",
    height: "70px",
    width: "100px",
  },
};
