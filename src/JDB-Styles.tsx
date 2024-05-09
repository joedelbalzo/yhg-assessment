interface StyleSchema {
  [key: string]: React.CSSProperties;
}

export const styles: StyleSchema = {
  jdbHomeDiv: {
    width: "70%",
    margin: "0 auto",
  },
  jdbAnimationDiv: {
    margin: "1rem 0",
    minHeight: "200px",
  },
  jdbH2: {
    textAlign: "center",
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
    outline: "1px solid blue",
    padding: "0.5rem",
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
  },
  jdbSubmitButtonId: {
    outline: "1px solid blue",
    padding: "0.5rem",
    height: "40px",
    width: "100px",
  },
};
