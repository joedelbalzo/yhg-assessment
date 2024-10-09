import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import cors, { CorsOptionsDelegate, CorsRequest } from "cors";
import gas from "./gas";
import appRecaptcha from "./recaptcha";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
const whitelist: string[] = [
  "https://yhg-code-redemption.onrender.com",
  "https://yhg-code-redemption.onrender.com/",
  "https://yourhiddengenius.com",
  "https://yourhiddengenius.com/",
  "https://www.yourhiddengenius.com",
  "https://www.yourhiddengenius.com",
  "https://www.yourhiddengenius.com/",
  "https://daisy-buttercup-j6mf.squarespace.com",
  "https://daisy-buttercup-j6mf.squarespace.com/",
  "http://localhost:3000",
];
const corsOptions: CorsOptionsDelegate = (
  req: CorsRequest,
  callback: (err: Error | null, options?: cors.CorsOptions | undefined) => void
) => {
  const request = req as Request;

  const origin = req.headers.origin;
  if (!origin) {
    if (request.path.startsWith("/api")) {
      callback(new Error("API access without origin is not allowed"), { origin: false });
    } else {
      callback(null, { origin: true });
    }
  } else if (whitelist.includes(origin)) {
    callback(null, { origin: true });
  } else {
    callback(new Error("Not allowed by CORS"), { origin: false });
  }
};

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

const app: Express = express();

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(limiter);

app.use("/", express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api/gas", gas);
app.use("/api/recaptcha", appRecaptcha);
app.use(errorHandler);

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
