"use strict";
/**
 * @fileoverview Server entry point. Starts the Express application on the specified port.
 *
 * @module index
 *
 * @description
 * Initializes the HTTP server using the Express app configured in app.ts.
 * Listens on PORT environment variable or defaults to 5000.
 *
 * **Usage**:
 * - Development: `npm run dev` (ts-node-dev with hot reload)
 * - Production: `npm start` (runs compiled backend/build/index.js)
 */
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