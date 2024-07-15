import express, { Request, Response } from "express";
const appRecaptcha = express();
import dotenv from "dotenv";
import path from "path";
import axios from "axios";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

appRecaptcha.use(express.json());

appRecaptcha.post("/verify-captcha", async (req: Request, res: Response) => {
  const token = req.body.token;
  const version = req.body.version || "v3";
  const secret = version === "v3" ? process.env.GOOGLE_RECAPTCHA_V3_SECRET : process.env.GOOGLE_RECAPTCHA_V2_SECRET;
  const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

  try {
    const response = await axios.post(googleVerifyUrl);
    const { success, score } = response.data;
    if (version === "v3" && success && score >= 0.5) {
      res.send({ verified: true, score });
    } else if (version === "v2" && success) {
      res.send({ verified: true });
    } else {
      res.send({ verified: false, message: "Verification failed", errorCodes: response.data["error-codes"] });
    }
  } catch (error) {
    console.error("Error during reCAPTCHA verification:", error);
    res.status(500).send({ verified: false, message: "Server error", error });
  }
});

export default appRecaptcha;
