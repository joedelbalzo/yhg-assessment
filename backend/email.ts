import { google } from "googleapis";
import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface ServiceAccountKeys {
  client_email: string;
  private_key: string;
}

const { GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_USER_EMAIL } = process.env;

if (!GOOGLE_APPLICATION_CREDENTIALS || !GOOGLE_USER_EMAIL) {
  throw new Error("Missing environment variables");
}

const keys: ServiceAccountKeys = JSON.parse(readFileSync(GOOGLE_APPLICATION_CREDENTIALS, "utf8"));

export async function sendEmail(email: string, url: string) {
  const jwtClient = new google.auth.JWT(
    keys.client_email,
    undefined,
    keys.private_key.replace(/\\n/g, "\n"),
    ["https://mail.google.com/"],
    GOOGLE_USER_EMAIL
  );

  try {
    console.log("in the try");

    const tokens = await jwtClient.authorize();
    console.log("we got a token!");

    if (!tokens.access_token) {
      console.error("Authorization successful, but no access token was returned.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: GOOGLE_USER_EMAIL,
        accessToken: tokens.access_token,
      },
    });

    const mailOptions = {
      from: GOOGLE_USER_EMAIL,
      to: email,
      subject: "Test email from YHG",
      text: `Here's your unique URL: ${url}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  } catch (err) {
    console.error("Authorization error:", err);
  }
}
