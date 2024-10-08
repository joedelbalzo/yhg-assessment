"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importStar(require("express"));
const appRecaptcha = (0, express_1.Router)();
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
// Use URLSearchParams for URL encoding
const url_1 = require("url");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
appRecaptcha.use(express_1.default.json());
appRecaptcha.post("/verify-captcha", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.body.token;
    const version = req.body.version || "v3";
    const secret = version === "v3" ? process.env.GOOGLE_RECAPTCHA_V3_SECRET : process.env.GOOGLE_RECAPTCHA_V2_SECRET;
    if (!secret) {
        return res.status(500).send({ verified: false, message: "Server configuration error" });
    }
    const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    // Prepare the data to be sent in the request body
    const params = new url_1.URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    try {
        // Make the POST request with URL-encoded form data
        const response = yield axios_1.default.post(googleVerifyUrl, params.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const { success, score } = response.data;
        if (version === "v3" && success && score >= 0.5) {
            res.send({ verified: true, score });
        }
        else if (version === "v2" && success) {
            res.send({ verified: true });
        }
        else {
            res.send({
                verified: false,
                message: "Verification failed",
                errorCodes: response.data["error-codes"],
            });
        }
    }
    catch (error) {
        console.error("Error during reCAPTCHA verification:", error);
        res.status(500).send({ verified: false, message: "Server error" });
    }
}));
exports.default = appRecaptcha;
//# sourceMappingURL=recaptcha.js.map