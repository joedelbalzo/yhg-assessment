"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const ccs_1 = __importDefault(require("./ccs"));
const app = (0, express_1.default)();
console.log("the fuck is happening?");
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// app.use("/yhg-assessment", express.static(path.join(__dirname, "../frontend/dist")));
app.use("/api/ccs", 
// restrictAccess,
ccs_1.default);
app.get("*", (req, res) => {
    console.log(`Serving index.html for ${req.originalUrl}`);
    const indexPath = path_1.default.join(__dirname, "../frontend/dist", "index.html");
    const indexPath2 = path_1.default.join(__dirname, "../../frontend/dist", "index.html");
    console.log("1", indexPath);
    console.log("2", indexPath2);
    res.sendFile(indexPath, function (err) {
        if (err) {
            console.log(err);
            res.sendFile(indexPath2, function (err2) {
                console.log(err2);
                res.status(500).send("Error serving file: " + err.message);
            });
        }
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map