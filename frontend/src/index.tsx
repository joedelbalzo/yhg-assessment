import React from "react";
import { createRoot } from "react-dom/client";
import AppJDB from "./AppJDB";

const container = document.querySelector("#joesJavaScriptExample");
if (!container) {
  console.error("Container not found");
} else {
  const root = createRoot(container);
  console.log("launching");
  root.render(<AppJDB />);
}
