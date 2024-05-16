"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
// import { fileURLToPath } from "url";
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const ccs_1 = __importDefault(require("./ccs"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
app.use("/yhg-assessment", express_1.default.static(path_1.default.join(__dirname, "../front")));
app.use("/api/ccs", 
// restrictAccess,
ccs_1.default);
app.get("*", (req, res) => {
    if (req.params.id) {
        console.log("rendering");
    }
    res.sendFile(path_1.default.join(__dirname, "../frontend/dist", "index.html"));
});
exports.default = app;
//# sourceMappingURL=app.js.map