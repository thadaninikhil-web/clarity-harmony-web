import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { SHARED_INPUTS_KEY } from "@/lib/sharedInputs";

// Hard refresh resets the simulator: localStorage persists across reloads,
// but sessionStorage does not. Use a session flag to detect a fresh tab/load
// and clear any previously-saved shared inputs so the user starts fresh.
if (typeof window !== "undefined") {
  try {
    if (!window.sessionStorage.getItem("ba.session.alive")) {
      window.localStorage.removeItem(SHARED_INPUTS_KEY);
      window.localStorage.removeItem("ba.lastInputs.threeBucket");
      window.localStorage.removeItem("ba.lastInputs.twoBucket");
      window.sessionStorage.setItem("ba.session.alive", "1");
    }
  } catch {
    /* ignore */
  }
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
