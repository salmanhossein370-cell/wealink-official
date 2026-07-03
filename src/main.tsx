import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force light mode as default
const saved = localStorage.getItem("theme");
if (saved === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
  localStorage.setItem("theme", "light");
}

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registered successfully with scope: ", registration.scope);
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}
