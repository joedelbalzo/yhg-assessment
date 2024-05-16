import app from "./app";

const init = async () => {
  try {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`server listening ${port}`));
  } catch (ex) {
    console.error(ex);
  }
};

init();
