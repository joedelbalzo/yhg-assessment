import express, { Express, Request, Response } from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import ccs from "./ccs";

const app: Express = express();

console.log("the fuck is happening?");

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use("/yhg-assessment", express.static(path.join(__dirname, "../frontend/dist")));

app.use(
  "/api/ccs",
  // restrictAccess,
  ccs
);

app.get("*", (req: Request, res: Response) => {
  console.log(`Serving index.html for ${req.originalUrl}`);
  const indexPath = path.join(__dirname, "../frontend/dist", "index.html");
  const indexPath2 = path.join(__dirname, "../../frontend/dist", "index.html");
  console.log("1", indexPath);
  console.log("2", indexPath2);
  res.sendFile(indexPath2, function (err) {
    if (err) {
      console.log("error in path", err);
    }
  });
});

export default app;
