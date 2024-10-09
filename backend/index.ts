import app from "./app";

const init = () => {
  const port = process.env.PORT || 5000;
  app.listen(port, (err?: Error) => {
    if (err) {
      console.error("Server failed to start:", err);
    } else {
      console.log(`Server listening on port ${port}`);
    }
  });
};

init();
