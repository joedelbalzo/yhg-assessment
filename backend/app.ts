import express, { Express, Request, Response } from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import ccs from "./ccs";

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/yhg-assessment", express.static(path.join(__dirname, "../frontend")));

app.use(
  "/api/ccs",
  // restrictAccess,
  ccs
);

app.get("*", (req: Request, res: Response) => {
  console.log(`Request for ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

export default app;
