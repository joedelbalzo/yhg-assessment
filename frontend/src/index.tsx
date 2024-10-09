import React from "react";
import { createRoot } from "react-dom/client";
import AppJDB from "./AppJDB";
import { BookProvider } from "./BookContext";

const container = document.querySelector("#joesJavaScriptExample");
if (!container) {
  console.error("Container not found");
} else {
  const root = createRoot(container);
  root.render(
    <BookProvider>
      <AppJDB />
    </BookProvider>
  );
}
