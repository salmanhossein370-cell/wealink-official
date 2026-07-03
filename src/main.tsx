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
      .register("/service-worker.js")
      .then((registration) => {
        console.log("ServiceWorker registered successfully with scope: ", registration.scope);
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}

// Global PWA Installation Event Handler
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event globally
  (window as any).deferredPrompt = e;
  // Dispatch custom event to notify components (like InstallBanner)
  window.dispatchEvent(new CustomEvent("pwaPromptAvailable"));
  console.log("PWA beforeinstallprompt event saved to global window.deferredPrompt instance.");
});
