import express, { Request, Response } from "express";
const appRecaptcha = express();
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const axios = require("axios");

appRecaptcha.use(express.json());

appRecaptcha.post("/verify-captcha", async (req: Request, res: Response) => {
  const token = req.body.token;
  const secret = process.env.GOOGLE_RECAPTCHA;
  const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

  try {
    console.log("trying to verify");
    const response = await axios.post(googleVerifyUrl);
    const { success } = response.data;
    if (success) {
      res.send({ verified: true });
    } else {
      res.send({ verified: false, message: "Verification failed" });
    }
  } catch (error) {
    res.status(500).send({ verified: false, message: "Server error" });
  }
});

export default appRecaptcha;
