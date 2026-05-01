import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Signal the prerenderer (puppeteer) that the page is ready to be snapshotted.
// We wait two animation frames so React + Suspense + initial data fetches settle.
if (typeof window !== "undefined") {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.dispatchEvent(new Event("render-event"));
      }, 800);
    });
  });
}
