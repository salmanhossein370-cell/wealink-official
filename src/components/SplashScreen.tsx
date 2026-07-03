import React, { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { motion, AnimatePresence } from "motion/react";

interface SplashScreenProps {
  onDone: () => void;
}

const SplashScreen = ({ onDone }: SplashScreenProps) => {
  const { loading } = useAdmin();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Minimum static duration of 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Exit once minTimePassed is true AND backend has finished preloading (loading is false)
  useEffect(() => {
    if (minTimePassed && !loading) {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        onDone();
      }, 400); // match exit transition duration
      return () => clearTimeout(exitTimer);
    }
  }, [minTimePassed, loading, onDone]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="splash-screen-root"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] pointer-events-auto select-none overflow-hidden"
        >
          {!imageError ? (
            <motion.img
              id="splash-bg"
              src="/wealinkfinal-final-splash.png.png"
              onError={() => setImageError(true)}
              alt="Wealink Splash Screen"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            // Full fallback clean background with the logo and slogan centered beautifully if the file isn't uploaded yet
            <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 gap-6 px-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center p-4">
                  <img 
                    src="/wealink-final-logo.jpg.png" 
                    alt="Wealink Logo" 
                    className="w-full h-full object-contain rounded-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/512x512?text=Wealink";
                    }}
                  />
                </div>
                <h2 className="font-sans font-extrabold text-2xl tracking-tight text-[#0f172a] mt-2">
                  Wealink
                </h2>
                <p className="text-xs text-[#64748b] font-semibold tracking-widest uppercase mt-1">
                  Excellence in Transfers and Travel
                </p>
              </motion.div>
            </div>
          )}

          {/* Minimalist loading indicator overlay (visible on top of the image or fallback) */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 w-[140px] z-10">
            <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-slate-800 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-800 uppercase select-none">
              Caricamento
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
