"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const init = () => {
    const port = process.env.PORT || 5000;
    app_1.default.listen(port, (err) => {
        if (err) {
            console.error("Server failed to start:", err);
        }
        else {
            console.log(`Server listening on port ${port}`);
        }
    });
};
init();
//# sourceMappingURL=index.js.map