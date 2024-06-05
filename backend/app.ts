import express, { Express, Request, Response } from "express";
import path from "path";
import cors, { CorsOptionsDelegate, CorsRequest } from "cors";
import ccs from "./ccs";
import appRecaptcha from "./recaptcha";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
const whitelist: string[] = [
  "https://yhg-assessment.onrender.com/",
  "https://yourhiddengenius.com",
  "https://daisy-buttercup-j6mf.squarespace.com/",
  "http://localhost:3000",
];
const corsOptions: CorsOptionsDelegate = (
  req: CorsRequest,
  callback: (err: Error | null, options?: cors.CorsOptions | undefined) => void
) => {
  let origin = req.headers.origin!;
  if (whitelist.indexOf(origin) !== -1) {
    callback(null, { origin: true });
  } else {
    callback(new Error("Not allowed by CORS"), { origin: false });
  }
};

const app: Express = express();

app.set("trust proxy", 1);
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
