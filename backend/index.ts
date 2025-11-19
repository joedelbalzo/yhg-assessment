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

import app from "./app";

const init = () => {
  const port = process.env.PORT || 5000;
  app.listen(port, (err?: Error) => {
    if (err) {
      console.error("Server failed to start:", err);
    } else {
      console.log(`Server listening on port ${port}`);
    }
  });
};

init();
