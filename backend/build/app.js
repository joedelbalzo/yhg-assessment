"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const gas_1 = __importDefault(require("./gas"));
const recaptcha_1 = __importDefault(require("./recaptcha"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Too many requests from this IP, please try again after 15 minutes",
});
const whitelist = [
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
const corsOptions = (req, callback) => {
    const request = req;
    const origin = req.headers.origin;
    if (!origin) {
        if (request.path.startsWith("/api")) {
            callback(new Error("API access without origin is not allowed"), { origin: false });
        }
        else {
            callback(null, { origin: true });
        }
    }
    else if (whitelist.includes(origin)) {
        callback(null, { origin: true });
    }
    else {
        callback(new Error("Not allowed by CORS"), { origin: false });
    }
};
const errorHandler = (err, _req, res, _next) => {
    console.error(`Error: ${err.message}`);
    res.status(res.statusCode !== 200 ? res.statusCode : 500);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(limiter);
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../../frontend/dist")));
app.use("/api/gas", gas_1.default);
app.use("/api/recaptcha", recaptcha_1.default);
app.use(errorHandler);
app.get("*", (req, res) => {
    console.log(`Serving index.html for ${req.originalUrl}`);
    const indexPath = path_1.default.join(__dirname, "../../frontend/dist", "index.html");
    res.sendFile(indexPath, function (err) {
        if (err) {
            console.log("error in path", err);
        }
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map