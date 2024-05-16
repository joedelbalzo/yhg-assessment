"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const init = async () => {
    try {
        const port = process.env.PORT || 5000;
        app_1.default.listen(port, () => console.log(`Listening on port ${port}`));
    }
    catch (ex) {
        console.error(ex);
    }
};
init();
//# sourceMappingURL=index.js.map