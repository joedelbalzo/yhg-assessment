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
const express_1 = __importDefault(require("express"));
const appRecaptcha = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
appRecaptcha.use(express_1.default.json());
appRecaptcha.post("/verify-captcha", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("verifying recaptcha");
    const token = req.body.token;
    const secret = process.env.GOOGLE_RECAPTCHA;
    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;
    try {
        const response = yield axios_1.default.post(googleVerifyUrl);
        const { success, score } = response.data;
        if (success) {
            console.log(`Score: ${score}`);
            if (score >= 0.5) {
                res.send({ verified: true, score });
            }
            else {
                res.send({ verified: false, score, message: "Verification failed due to low score" });
            }
        }
        else {
            res.send({ verified: false, message: "Verification failed", errorCodes: response.data["error-codes"] });
        }
    }
    catch (error) {
        console.error("Error during reCAPTCHA verification:", error);
        res.status(500).send({ verified: false, message: "Server error", error });
    }
}));
exports.default = appRecaptcha;
//# sourceMappingURL=recaptcha.js.map