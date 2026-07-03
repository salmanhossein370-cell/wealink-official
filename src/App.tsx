import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AdminProvider } from "@/contexts/AdminContext";
import SplashScreen from "@/components/SplashScreen";
import WelcomeScreen from "@/components/WelcomeScreen";
import InstallBanner from "@/components/InstallBanner";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import "@/i18n";
import { APP_VERSION } from "./version";

const queryClient = new QueryClient();

const App = () => {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const lastVersion = localStorage.getItem("app_version");
    if (lastVersion && lastVersion !== APP_VERSION) {
      console.log(`[PWA Auto-Update] Version updated to ${APP_VERSION}. Clearing cache and reloading...`);
      if ("caches" in window) {
        caches.keys().then((names) => {
          Promise.all(names.map(name => caches.delete(name))).then(() => {
            localStorage.setItem("app_version", APP_VERSION);
            (window as any).location.reload();
          });
        }).catch(() => {
          localStorage.setItem("app_version", APP_VERSION);
          (window as any).location.reload();
        });
      } else {
        localStorage.setItem("app_version", APP_VERSION);
        (window as any).location.reload();
      }
    } else {
      localStorage.setItem("app_version", APP_VERSION);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminProvider>
          <Toaster />
          <Sonner position="top-center" />
          {!splashDone ? (
            <SplashScreen onDone={() => setSplashDone(true)} />
          ) : (
            <BrowserRouter>
              <div className="w-full max-w-7xl mx-auto relative min-h-screen">
                <InstallBanner />
                <Routes>
                  <Route path="/" element={<WelcomeScreen />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          )}
        </AdminProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

