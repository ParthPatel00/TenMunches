import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { inject } from "@vercel/analytics";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
// Defer analytics so it doesn't block first paint
if (typeof requestIdleCallback !== "undefined") {
  requestIdleCallback(() => inject(), { timeout: 2000 });
} else {
  setTimeout(() => inject(), 500);
}
