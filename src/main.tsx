import { createRoot } from "react-dom/client";
import { init as initPlausible } from "@plausible-analytics/tracker";
import App from "./App.tsx";
import "./index.css";

// Initialize Plausible analytics
initPlausible({
  domain: window.location.hostname,
  captureOnLocalhost: true,
});

createRoot(document.getElementById("root")!).render(<App />);
