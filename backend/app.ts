import express, { Express, Request, Response } from "express";
import path from "path";
// import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";
import ccs from "./ccs";

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/yhg-assessment", express.static(path.join(__dirname, "../front")));

app.use(
  "/api/ccs",
  // restrictAccess,
  ccs
);

app.get("*", (req: Request, res: Response) => {
  if (req.params.id) {
    console.log("rendering");
  }
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

export default app;
