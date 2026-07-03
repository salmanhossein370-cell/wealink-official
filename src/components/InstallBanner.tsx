import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import wealinkIcon from "@/assets/wealink-icon.png";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem("wealink_pwa_banner_dismissed") === "true";
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if the app is already running as a standalone PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                        (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("PWA Install click simulated. Native browser prompt is not available in the preview environment.");
      return;
    }

    // Show the native browser install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt choice: ${outcome}`);

    // Regardless of the outcome, we can clear the prompt state
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("wealink_pwa_banner_dismissed", "true");
    setIsDismissed(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      id="pwa-install-banner"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[94%] max-w-xl bg-white rounded-[32px] shadow-[0_16px_48px_rgba(0,0,0,0.12)] border border-gray-100 p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-6"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border border-slate-100 p-0.5 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
          <img
            id="pwa-logo"
            src="/wealink-final-logo.jpg.png"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = wealinkIcon;
            }}
            alt="Wealink Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="font-sans font-bold text-[#0f172a] text-[16px] sm:text-[19px] tracking-tight leading-tight">
            Installa Wealink
          </h4>
          <p className="text-[#64748b] text-[11px] sm:text-[13px] leading-snug font-normal truncate">
            Aprila a tutto schermo dal tuo telefono
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button
          id="pwa-btn-install"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 sm:gap-2 bg-black text-white hover:bg-zinc-800 font-sans font-bold text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
        >
          <Download className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] stroke-[2.5]" />
          <span>Installa</span>
        </button>
        <button
          id="pwa-btn-dismiss"
          onClick={handleDismiss}
          className="p-1 text-[#cbd5e1] hover:text-slate-500 rounded-full transition-colors duration-150"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;
