"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const googleapis_1 = require("googleapis");
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = require("fs");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const { GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_USER_EMAIL } = process.env;
if (!GOOGLE_APPLICATION_CREDENTIALS || !GOOGLE_USER_EMAIL) {
    throw new Error("Missing environment variables");
}
const keys = JSON.parse((0, fs_1.readFileSync)(GOOGLE_APPLICATION_CREDENTIALS, "utf8"));
function sendEmail(email, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const jwtClient = new googleapis_1.google.auth.JWT(keys.client_email, undefined, keys.private_key.replace(/\\n/g, "\n"), ["https://mail.google.com/"], GOOGLE_USER_EMAIL);
        try {
            console.log("in the try");
            const tokens = yield jwtClient.authorize();
            console.log("we got a token!");
            if (!tokens.access_token) {
                console.error("Authorization successful, but no access token was returned.");
                return;
            }
            const transporter = nodemailer_1.default.createTransport({
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
                }
                else {
                    console.log("Email sent:", info.response);
                }
            });
        }
        catch (err) {
            console.error("Authorization error:", err);
        }
    });
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map