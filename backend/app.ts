import express, { Express, Request, Response } from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import ccs from "./ccs";
import appRecaptcha from "./recaptcha";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(limiter);

app.use("/", express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api/ccs", ccs);
app.use("/api/recaptcha", appRecaptcha);

app.get("*", (req: Request, res: Response) => {
  console.log(`Serving index.html for ${req.originalUrl}`);
  const indexPath = path.join(__dirname, "../../frontend/dist", "index.html");
  res.sendFile(indexPath, function (err) {
    if (err) {
      console.log("error in path", err);
    }
  });
});

export default app;
