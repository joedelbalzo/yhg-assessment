import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.querySelector("#joesJavaScriptExample");
if (!container) {
  console.error("Container not found");
} else {
  const root = createRoot(container);
  console.log("Rendering React app");
  root.render(<App />);
  console.log("Rendering React app line 2");
}
