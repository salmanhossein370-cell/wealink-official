import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  Landmark, 
  Lock, 
  Send, 
  Smartphone, 
  Plane, 
  ShoppingBag, 
  ArrowRight,
  Truck,
  FileText,
  Cpu,
  Heart,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Euro,
  Globe,
  ShoppingCart,
  Wallet,
  Home,
  Settings,
  Zap,
  Ticket
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LogoTicker from "@/components/LogoTicker";
import HeroSection from "@/components/HeroSection";
import QuickServices from "@/components/QuickServices";
import TapTapCalculator from "@/components/TapTapCalculator";

interface WelcomeScreenProps {
  onComplete?: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps = {}) {
  const navigate = useNavigate();
  const { logoUrl, bkashRate, bankRate, pinRate, tickerMoney, tickerSim, onboardingSlides } = useAdmin();
  const { i18n } = useTranslation();
  
  // Navigation states: 'welcome' | 'language' | 'intro_slider' | 'register_step1' | 'register_step2' | 'register_step3' | 'shop' | 'dashboard'
  const [step, setStep] = useState<"welcome" | "language" | "intro_slider" | "register_step1" | "register_step2" | "register_step3" | "shop" | "dashboard" >("welcome");
  const [ctaClicked, setCtaClicked] = useState(false);
  const [inizioClicked, setInizioClicked] = useState(false);
  const [avantiClicked, setAvantiClicked] = useState(false);
  const [creaProfiloClicked, setCreaProfiloClicked] = useState(false);
  const [giaProfiloClicked, setGiaProfiloClicked] = useState(false);
  const [containerWidth, setContainerWidth] = useState(350);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [onboardingSlideIndex, setOnboardingSlideIndex] = useState(0);

  // Auto-scroll logic for onboarding intro slider
  useEffect(() => {
    if (step === "intro_slider" && onboardingSlides && onboardingSlides.length > 0) {
      const interval = setInterval(() => {
        setOnboardingSlideIndex((prev) => (prev + 1) % onboardingSlides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [step, onboardingSlides?.length]);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [step]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCtaClick = () => {
    if (ctaClicked) return;
    setCtaClicked(true);
    setTimeout(() => {
      setStep("dashboard");
      setTimeout(() => setCtaClicked(false), 500);
    }, 400);
  };

  const handleInizioClick = () => {
    if (inizioClicked) return;
    setInizioClicked(true);
    setTimeout(() => {
      setStep("language");
      setTimeout(() => setInizioClicked(false), 500);
    }, 400);
  };

  const handleAvantiClick = () => {
    if (avantiClicked) return;
    setAvantiClicked(true);
    setTimeout(() => {
      setStep("intro_slider");
      setTimeout(() => setAvantiClicked(false), 500);
    }, 400);
  };

  const handleCreaProfiloClick = () => {
    if (creaProfiloClicked) return;
    setCreaProfiloClicked(true);
    setTimeout(() => {
      setStep("register_step1");
      setTimeout(() => setCreaProfiloClicked(false), 500);
    }, 400);
  };

  const handleGiaProfiloClick = () => {
    if (giaProfiloClicked) return;
    setGiaProfiloClicked(true);
    setTimeout(() => {
      setStep("register_step1");
      setTimeout(() => setGiaProfiloClicked(false), 500);
    }, 400);
  };

  const handleServiceClick = (serviceName: string) => {
    toast.info(`${serviceName} non attivo`, {
      description: "Il servizio sarà attivato a breve in questa versione."
    });
  };
  
  // States for manual registration input fields (First, Last, Phone)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneOnly, setPhoneOnly] = useState("");
  const [nationality, setNationality] = useState<"Bangladesh" | "Pakistan">("Bangladesh");
  const [avatarUrl, setAvatarUrl] = useState("");

  // States for Google simulated pop-up
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Home Screen Welcome overlay
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);
  const [isOverlayAnimatingOut, setIsOverlayAnimatingOut] = useState(false);

  // State for the currency calculator in the Shop Page (Screen 3)
  const [calcEur, setCalcEur] = useState("100");

  // Track name of logged-in user to show in personalized greeting
  const [userName, setUserName] = useState("Bhai");

  // Floating notification visibility
  const [showNotification, setShowNotification] = useState(false);

  // Trigger floating notification slide-in when arriving on the dashboard
  useEffect(() => {
    if (step === "dashboard") {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Timer for welcome popup
  useEffect(() => {
    if (showWelcomeOverlay) {
      const animTimer = setTimeout(() => {
        setIsOverlayAnimatingOut(true);
        const removeTimer = setTimeout(() => {
          setShowWelcomeOverlay(false);
          setIsOverlayAnimatingOut(false);
        }, 700);
        return () => clearTimeout(removeTimer);
      }, 3000);
      return () => clearTimeout(animTimer);
    }
  }, [showWelcomeOverlay]);

  // Handling Google mock login with simulated selection popup
  const handleGoogleSelect = async (gFirst: string, gLast: string) => {
    setGoogleLoading(true);
    setTimeout(() => {
      setFirstName(gFirst);
      setLastName(gLast);
      setGoogleLoading(false);
      setShowGoogleModal(false);
      toast.success("Collegato con Google!", {
        description: `Account: ${gFirst} ${gLast}`
      });
    }, 1200);
  };

  // Handling manual registration with name & phone
  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phoneOnly.trim()) {
      toast.error("Per favore, compila tutti i campi");
      return;
    }
    // Proceed to Step 2: Nationality (triggers slide)
    setStep("register_step2");
  };

  const handleFinishOnboarding = async () => {
    const trimmedName = `${firstName.trim()} ${lastName.trim()}`;
    const trimmedPhone = `+39 ${phoneOnly.trim()}`;
    const clientId = "client_" + Math.random().toString(36).substr(2, 9);
    
    setUserName(trimmedName);

    // Save in phone standard text field with safe separators to sync all 5 points
    const syncedPhoneValue = `${trimmedPhone} ||| ${nationality} ||| ${avatarUrl || ""}`;

    try {
      localStorage.setItem("wealink_client_name", trimmedName);
      localStorage.setItem("wealink_client_phone", trimmedPhone);
      localStorage.setItem("wealink_client_nationality", nationality);
      localStorage.setItem("wealink_client_avatar", avatarUrl || "");
      localStorage.setItem("wealink_client_id", clientId);

      // Local backup list with exact, clean fields
      const localClientsStr = localStorage.getItem("wealink_local_clients") || "[]";
      const localClients = JSON.parse(localClientsStr);
      localClients.push({
        id: clientId,
        name: trimmedName,
        phone: syncedPhoneValue, // sync through phone field
        nationality: nationality,
        avatar_url: avatarUrl || "",
        custom_greeting: "",
        created_at: new Date().toISOString()
      });
      localStorage.setItem("wealink_local_clients", JSON.stringify(localClients));

      // Save in mock/real database client profile
      await (supabase.from('clients') as any).insert({
        id: clientId,
        name: trimmedName,
        phone: syncedPhoneValue, // safely synchronized
        custom_greeting: ""
      });
    } catch (e) {
      console.warn("Storage or database error:", e);
    }
    
    // Move to Home screen (Page 3)
    setStep("shop");
    // Trigger welcome overlay immediately
    setShowWelcomeOverlay(true);
    setIsOverlayAnimatingOut(false);
  };

  const onboardingTranslations = {
    it: {
      langTitle: "Quale lingua parli?",
      langSub: "Scegli la tua lingua preferita per personalizzare la tua esperienza su Wealink.",
      btnNext: "Avanti",
      btnCreate: "Crea un nuovo profilo",
      btnHaveProfile: "Ho già un profilo",
      btnBack: "Indietro",
    },
    en: {
      langTitle: "Which language do you speak?",
      langSub: "Choose your preferred language to customize your experience on Wealink.",
      btnNext: "Next",
      btnCreate: "Create a new profile",
      btnHaveProfile: "I already have a profile",
      btnBack: "Back",
    },
    bn: {
      langTitle: "আপনি কোন ভাষায় কথা বলেন?",
      langSub: "Wealink-এ আপনার অভিজ্ঞতা কাস্টমাইজ করতে আপনার পছন্দের ভাষা চয়ন করুন।",
      btnNext: "পরবর্তী",
      btnCreate: "একটি নতুন প্রোফাইল তৈরি করুন",
      btnHaveProfile: "আমার ইতিমধ্যে একটি প্রোফail আছে",
      btnBack: "পিছনে",
    },
    ur: {
      langTitle: "آپ کونسی زبان بولتے ہیں؟",
      langSub: "Wealink پر اپنے تجربے کو ذاتی بنانے کے لیے اپنی پسندیدہ زبان منتخب کریں۔",
      btnNext: "اگلا",
      btnCreate: "ایک نیا پروفائل بنائیں",
      btnHaveProfile: "میرا پہلے سے ایک پروفائل ہے",
      btnBack: "پیچھے",
    }
  };

  const currentLang = (i18n.language || "it") as "it" | "en" | "bn" | "ur";
  const tOnboarding = onboardingTranslations[currentLang] || onboardingTranslations.it;

  return (
    <div 
      id="welcome-onboarding-screen"
      className="fixed inset-0 z-[9998] bg-white text-slate-900 overflow-hidden font-sans select-none"
    >
      {/* Sliding wrapper containing all eight screens side-by-side */}
      <div 
        className={`flex w-[800%] h-full transition-transform duration-500 ease-in-out ${
          step === "language" 
            ? "-translate-x-[12.5%]" 
            : step === "intro_slider" 
            ? "-translate-x-[25%]" 
            : step === "register_step1" 
            ? "-translate-x-[37.5%]" 
            : step === "register_step2"
            ? "-translate-x-[50%]"
            : step === "register_step3"
            ? "-translate-x-[62.5%]"
            : step === "shop"
            ? "-translate-x-[75%]"
            : step === "dashboard"
            ? "-translate-x-[87.5%]"
            : "translate-x-0"
        }`}
      >
        
        {/* ==================== SCHERMATA 1: WELCOME SCREEN ==================== */}
        <div className="w-[12.5%] h-full flex flex-col justify-between py-8 px-6 bg-white">
          {/* Top spacer for perfect centering */}
          <div className="flex-1" />

          {/* Central content: logo, title, payoffs */}
          <div className="flex flex-col items-center justify-center text-center">
            
            {/* Logo Container with soft shadow and large image scaling */}
            <div className="w-32 h-32 bg-white rounded-full border border-gray-100 flex items-center justify-center p-2.5 shadow-lg shadow-gray-100/50">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Wealink Logo" 
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-26 h-26 text-black" 
                  fill="currentColor"
                >
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M50 8 A35 42 0 0 0 50 92 A35 42 0 0 0 50 8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1,2" />
                  <path d="M50 8 A20 42 0 0 0 50 92 A20 42 0 0 0 50 8" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="50" y1="8" x2="50" y2="92" stroke="currentColor" strokeWidth="3" />
                  <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="3" />
                  <path d="M12 30 C 25 38, 75 38, 88 30" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 70 C 25 62, 75 62, 88 70" fill="none" stroke="currentColor" strokeWidth="2" />
                  
                  <path d="M22 35 Q 30 25 45 30 T 48 48 T 35 55 T 22 35 Z" fill="currentColor" opacity="0.85" />
                  <path d="M55 45 Q 68 35 78 40 T 75 65 T 60 55 T 55 45 Z" fill="currentColor" opacity="0.85" />
                  <path d="M35 68 Q 45 60 55 65 T 50 82 T 40 78 T 35 68 Z" fill="currentColor" opacity="0.85" />
                </svg>
              )}
            </div>

            {/* Brand Name */}
            <h1 className="text-black text-5xl font-black tracking-widest uppercase mt-8 mb-4">
              WEALINK
            </h1>
            
            {/* Slogans */}
            <p className="text-gray-700 text-2xl font-semibold text-center leading-snug">
              Semplifica la tua vita.
            </p>
            
            <p className="text-black text-xl font-extrabold tracking-wide mt-3 text-center">
              Italia ↔ Bangladesh
            </p>
          </div>

          {/* Bottom spacer */}
          <div className="flex-1" />

          {/* Lower action button */}
          <div className="w-full pb-4">
            <button
              onClick={handleInizioClick}
              className="group relative flex items-center justify-between w-full bg-black text-white font-bold h-16 rounded-full shadow-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:shadow-lg hover:shadow-black/10 active:scale-[0.98] cursor-pointer"
            >
              {/* Text - centered perfectly with spacing adjusting to avoid overlap */}
              <span className={`text-lg tracking-wide transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-full text-center ${
                inizioClicked ? "pr-16 pl-6 text-slate-300" : "pl-16 pr-6 text-white"
              }`}>
                Inizia
              </span>

              {/* Genzam Circular Icon Container (Slides from left to right on click) */}
              <div 
                className={`absolute top-2 w-12 h-12 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 shadow-md overflow-hidden flex items-center justify-center ${
                  inizioClicked ? "left-[calc(100%-3.5rem)] bg-slate-100" : "left-2 bg-white"
                }`}
              >
                {/* Arrow Icon 1 (visible initially, slides right on hover or click) */}
                <ArrowRight className={`w-5 h-5 text-black transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  inizioClicked ? "translate-x-10" : "group-hover:translate-x-10"
                }`} />
                
                {/* Arrow Icon 2 (hidden to left initially, slides to center on hover or click) */}
                <ArrowRight className={`absolute w-5 h-5 text-black -translate-x-10 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  inizioClicked ? "translate-x-0" : "group-hover:translate-x-0"
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* ==================== SCHERMATA 1.2: LINGUA SELECTION ==================== */}
        <div className="w-[12.5%] h-full flex flex-col justify-between py-8 px-6 bg-white relative overflow-y-auto">
          {/* Header Row with Back Button */}
          <div className="w-full flex items-center justify-between pt-4">
            <button 
              onClick={() => setStep("welcome")}
              className="p-2.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-700"
              aria-label="Torna indietro"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10" /> {/* Spacer */}
          </div>

          {/* Central select container */}
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight text-left mb-3">
              {tOnboarding.langTitle}
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-8">
              {tOnboarding.langSub}
            </p>

            {/* List of elegant options */}
            <div className="space-y-3 mb-8">
              {[
                { code: "it", label: "Italiano", sub: "Italian", flag: "🇮🇹" },
                { code: "en", label: "English", sub: "English", flag: "🇬🇧" },
                { code: "bn", label: "বাংলা", sub: "Bengali", flag: "🇧🇩" },
                { code: "ur", label: "اردو", sub: "Urdu", flag: "🇵🇰" },
              ].map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      toast.success(lang.code === 'it' ? `Lingua impostata: ${lang.label}` : `Language set to: ${lang.label}`);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left active:scale-[0.99] ${
                      isSelected
                        ? "border-black bg-slate-50 shadow-sm font-semibold"
                        : "border-slate-100 hover:border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl" role="img" aria-label={lang.label}>
                        {lang.flag}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-none">
                          {lang.label}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-medium leading-none">
                          {lang.sub}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="w-full pb-4 max-w-sm mx-auto">
            <button
              onClick={handleAvantiClick}
              className="group relative flex items-center justify-between w-full bg-black text-white font-bold h-16 rounded-full shadow-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:shadow-lg hover:shadow-black/10 active:scale-[0.98] cursor-pointer"
            >
              {/* Text - centered perfectly with spacing adjusting to avoid overlap */}
              <span className={`text-lg tracking-wide transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-full text-center ${
                avantiClicked ? "pr-16 pl-6 text-slate-300" : "pl-16 pr-6 text-white"
              }`}>
                {tOnboarding.btnNext}
              </span>

              {/* Circular Icon Container (Slides from left to right on click) */}
              <div 
                className={`absolute top-2 w-12 h-12 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 shadow-md overflow-hidden flex items-center justify-center ${
                  avantiClicked ? "left-[calc(100%-3.5rem)] bg-slate-100" : "left-2 bg-white"
                }`}
              >
                {/* Arrow Icon 1 */}
                <ArrowRight className={`w-5 h-5 text-black transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  avantiClicked ? "translate-x-10" : "group-hover:translate-x-10"
                }`} />
                
                {/* Arrow Icon 2 */}
                <ArrowRight className={`absolute w-5 h-5 text-black -translate-x-10 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  avantiClicked ? "translate-x-0" : "group-hover:translate-x-0"
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* ==================== SCHERMATA 1.3: INTRO SLIDER ==================== */}
        <div className="w-[12.5%] h-full flex flex-col justify-between py-8 px-6 bg-white relative overflow-y-auto">
          {/* Header Row: Globe icon on top left to change language */}
          <div className="w-full flex items-center justify-between pt-4">
            <button 
              onClick={() => setStep("language")}
              className="p-2.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-700 flex items-center gap-1.5 focus:outline-none"
              title="Cambia Lingua"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {i18n.language === "it" ? "IT" : i18n.language === "bn" ? "BN" : i18n.language === "ur" ? "UR" : "EN"}
              </span>
            </button>
            <div className="w-10 h-10" /> {/* Spacer */}
          </div>

          {/* Central content: Slider automatico & manuale */}
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-2 my-auto">
            
            {/* Banner Container */}
            <div 
              ref={containerRef}
              className="relative w-full h-56 sm:h-64 rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] bg-slate-50 flex-shrink-0 select-none touch-pan-y"
            >
              <motion.div
                className="flex h-full cursor-grab active:cursor-grabbing"
                style={{ 
                  width: `${onboardingSlides.length * 100}%`,
                }}
                drag="x"
                dragConstraints={{
                  left: -containerWidth * (onboardingSlides.length - 1),
                  right: 0
                }}
                dragElastic={0.2}
                animate={{ x: -onboardingSlideIndex * containerWidth }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                onDragEnd={(e, info) => {
                  const swipeThreshold = containerWidth * 0.15; // 15% of container width
                  const offset = info.offset.x;
                  const velocity = info.velocity.x;

                  if (offset < -swipeThreshold || velocity < -300) {
                    // Next slide
                    setOnboardingSlideIndex((prev) => Math.min(prev + 1, onboardingSlides.length - 1));
                  } else if (offset > swipeThreshold || velocity > 300) {
                    // Prev slide
                    setOnboardingSlideIndex((prev) => Math.max(prev - 1, 0));
                  }
                }}
              >
                {onboardingSlides.map((slide) => (
                  <div 
                    key={slide.id} 
                    style={{ width: `${100 / onboardingSlides.length}%` }} 
                    className="h-full relative overflow-hidden flex-shrink-0"
                  >
                    <img 
                      src={slide.url} 
                      alt={slide.title} 
                      className="w-full h-full object-cover pointer-events-none select-none" 
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Title & Subtitle under the banner */}
            <div className="text-center mt-6 min-h-[90px] flex flex-col justify-start">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {onboardingSlides[onboardingSlideIndex]?.titles?.[i18n.language as "it" | "en" | "bn" | "ur"] || onboardingSlides[onboardingSlideIndex]?.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 leading-relaxed max-w-[90%] mx-auto">
                {onboardingSlides[onboardingSlideIndex]?.subtitles?.[i18n.language as "it" | "en" | "bn" | "ur"] || onboardingSlides[onboardingSlideIndex]?.subtitle}
              </p>
            </div>

            {/* Dots under the texts */}
            <div className="flex justify-center gap-1.5 mt-4 mb-6">
              {onboardingSlides.slice(0, 10).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setOnboardingSlideIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                    onboardingSlideIndex === index ? "w-4 bg-black" : "w-1.5 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Vai alla slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Buttons: Two stacked overlay buttons */}
          <div className="w-full space-y-3 pb-4 max-w-sm mx-auto">
            {/* Button 1: Crea un nuovo profilo */}
            <button
              onClick={handleCreaProfiloClick}
              className="group relative flex items-center justify-between w-full bg-black text-white font-bold h-16 rounded-full shadow-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:shadow-lg hover:shadow-black/10 active:scale-[0.98] cursor-pointer"
            >
              {/* Text - centered perfectly with spacing adjusting to avoid overlap */}
              <span className={`text-sm sm:text-base tracking-wide transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-full text-center ${
                creaProfiloClicked ? "pr-16 pl-6 text-slate-300" : "pl-16 pr-6 text-white"
              }`}>
                {tOnboarding.btnCreate}
              </span>

              {/* Circular Icon Container (Slides from left to right on click) */}
              <div 
                className={`absolute top-2 w-12 h-12 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 shadow-md overflow-hidden flex items-center justify-center ${
                  creaProfiloClicked ? "left-[calc(100%-3.5rem)] bg-slate-100" : "left-2 bg-white"
                }`}
              >
                {/* Arrow Icon 1 */}
                <ArrowRight className={`w-5 h-5 text-black transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  creaProfiloClicked ? "translate-x-10" : "group-hover:translate-x-10"
                }`} />
                
                {/* Arrow Icon 2 */}
                <ArrowRight className={`absolute w-5 h-5 text-black -translate-x-10 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  creaProfiloClicked ? "translate-x-0" : "group-hover:translate-x-0"
                }`} />
              </div>
            </button>

            {/* Button 2: Ho già un profilo */}
            <button
              onClick={handleGiaProfiloClick}
              className="group relative flex items-center justify-between w-full bg-transparent border-2 border-black text-black font-bold h-16 rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-slate-50 active:scale-[0.98] cursor-pointer"
            >
              {/* Text - centered perfectly with spacing adjusting to avoid overlap */}
              <span className={`text-sm sm:text-base tracking-wide transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-full text-center ${
                giaProfiloClicked ? "pr-16 pl-6 text-slate-500" : "pl-16 pr-6 text-black"
              }`}>
                {tOnboarding.btnHaveProfile}
              </span>

              {/* Circular Icon Container (Slides from left to right on click) */}
              <div 
                className={`absolute top-1.5 w-12 h-12 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 shadow-sm overflow-hidden flex items-center justify-center ${
                  giaProfiloClicked ? "left-[calc(100%-3.5rem)] bg-black text-white" : "left-2 bg-black text-white"
                }`}
              >
                {/* Arrow Icon 1 */}
                <ArrowRight className={`w-5 h-5 text-white transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  giaProfiloClicked ? "translate-x-10" : "group-hover:translate-x-10"
                }`} />
                
                {/* Arrow Icon 2 */}
                <ArrowRight className={`absolute w-5 h-5 text-white -translate-x-10 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  giaProfiloClicked ? "translate-x-0" : "group-hover:translate-x-0"
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* ==================== SCHERMATA 2: ONBOARDING STEP 1 - REGISTRATION & GOOGLE LOGIN ==================== */}
        <div className="w-[12.5%] h-full flex flex-col justify-between py-10 px-8 bg-white relative overflow-y-auto">
          
          {/* Header Row: Back button & Centered Wealink Logo */}
          <div className="w-full flex flex-col items-center pt-4 relative">
            <div className="absolute left-0 top-3">
              <button 
                onClick={() => setStep("intro_slider")}
                className="p-2.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-700 focus:outline-none"
                aria-label="Torna indietro"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            
            {/* Logo at the very top (Page 1 matching scale) */}
            <div className="w-16 h-16 bg-white rounded-full border border-slate-100 flex items-center justify-center p-1.5 shadow-sm">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Wealink Logo" 
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-black">WL</div>
              )}
            </div>
          </div>

          {/* Central registration block with massive breathing room (respiro) */}
          <div className="w-full max-w-sm mx-auto px-2 mt-12 md:mt-16 flex-1 flex flex-col justify-center">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Crea il tuo account
              </h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Inizia ad inviare denaro in modo semplice e sicuro
              </p>
            </div>

            {/* Google Authentication Button - Identical to Google original */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm h-12 px-4 rounded-full border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-start gap-4 transition-all active:scale-[0.98] focus:outline-none cursor-pointer relative"
            >
              {/* Google official flat logo SVG */}
              <div className="flex-shrink-0 bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.15C3.26 21.17 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.24a7.15 7.15 0 0 1 0-4.48V6.61H1.29a11.94 11.94 0 0 0 0 10.78l3.98-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.31 0 3.26 2.83 1.29 6.61l3.98 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
              </div>
              <span className="flex-1 text-center font-bold text-slate-700 pr-8">Continua con Google</span>
            </button>

            {/* Separator block */}
            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Oppure</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Manual Fields Layout */}
            <form onSubmit={handleManualRegister} className="w-full space-y-5">
              
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider pl-1">Nome</label>
                <input
                  type="text"
                  placeholder="Es. Mohammad"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold placeholder-slate-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  required
                />
              </div>

              {/* Cognome */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider pl-1">Cognome</label>
                <input
                  type="text"
                  placeholder="Es. Hossein"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold placeholder-slate-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  required
                />
              </div>

              {/* Numero di telefono */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider pl-1">Numero di telefono</label>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center border border-slate-100 shadow-sm text-sm">
                      🇮🇹
                    </span>
                    <span className="text-sm font-bold text-slate-700">+39</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="345 6789012"
                    value={phoneOnly}
                    onChange={(e) => {
                      const cleanVal = e.target.value.replace(/[^0-9 ]/g, '');
                      setPhoneOnly(cleanVal);
                    }}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold placeholder-slate-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    required
                  />
                </div>
              </div>

              {/* CTA Action Button */}
              <button
                type="submit"
                disabled={!firstName.trim() || !lastName.trim() || !phoneOnly.trim()}
                className={`w-full font-bold text-base rounded-full py-4 text-center tracking-wide mt-8 transition-all duration-300 cursor-pointer ${
                  (!firstName.trim() || !lastName.trim() || !phoneOnly.trim())
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-black text-white shadow-md shadow-black/10 hover:bg-slate-900 active:scale-[0.98]"
                }`}
              >
                Procedi
              </button>
            </form>

          </div>

          {/* Safe padding footer spacer */}
          <div className="h-8" />

        </div>

        {/* ==================== SCHERMATA 3: ONBOARDING STEP 2 - NATIONALITY SELECTION ==================== */}
        <div className="w-[12.5%] h-full flex flex-col justify-between py-10 px-8 bg-white relative overflow-y-auto">
          
          {/* Top progress bar (Step 2/3) */}
          <div className="w-full">
            {/* Back button */}
            <div className="absolute left-4 top-6">
              <button 
                onClick={() => setStep("register_step1")}
                className="p-2.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-700 focus:outline-none"
                aria-label="Torna indietro"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Progress indicator */}
            <div className="mt-10 px-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                <span>Passo 2 di 3</span>
                <span className="text-slate-900 font-semibold">Nazionalità</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-black rounded-full transition-all duration-500" />
              </div>
            </div>
          </div>

          {/* Central selection block with breathing space (respiro) */}
          <div className="w-full max-w-sm mx-auto px-2 flex-1 flex flex-col justify-center mt-12 md:mt-16">
            
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Seleziona la tua nazionalità
              </h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Personalizzeremo la tua esperienza di invio denaro
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Option 1: Bangladesh */}
              <button
                onClick={() => setNationality("Bangladesh")}
                className={`flex items-center gap-4 p-5 bg-white border rounded-2xl transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow active:scale-[0.98] cursor-pointer text-left w-full relative ${
                  nationality === "Bangladesh" 
                    ? "border-black ring-1 ring-black bg-slate-50/10" 
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm">
                  <span className="text-4xl">🇧🇩</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Bangladesh</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Seleziona nazionalità</p>
                </div>
                {nationality === "Bangladesh" && (
                  <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0 ml-auto" strokeWidth={2.5} />
                )}
              </button>

              {/* Option 2: Pakistan */}
              <button
                onClick={() => setNationality("Pakistan")}
                className={`flex items-center gap-4 p-5 bg-white border rounded-2xl transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow active:scale-[0.98] cursor-pointer text-left w-full relative ${
                  nationality === "Pakistan" 
                    ? "border-black ring-1 ring-black bg-slate-50/10" 
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm">
                  <span className="text-4xl">🇵🇰</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Pakistan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Seleziona nazionalità</p>
                </div>
                {nationality === "Pakistan" && (
                  <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0 ml-auto" strokeWidth={2.5} />
                )}
              </button>
            </div>

            {/* Primary Action Button (Procedi) - Google style */}
            <button
              onClick={() => setStep("register_step3")}
              className="w-full bg-black hover:bg-slate-900 text-white font-bold text-base rounded-full py-4 text-center tracking-wide mt-12 shadow-md shadow-black/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              Procedi
            </button>
          </div>

          <div className="h-8" />

        </div>

        {/* ==================== SCHERMATA 4: ONBOARDING STEP 3 - PROFILE CONFIGURATION ==================== */}
        <div className="w-[12.5%] h-full flex flex-col justify-between py-10 px-8 bg-white relative overflow-y-auto">
          
          {/* Top progress bar (Step 3/3) */}
          <div className="w-full">
            {/* Back button */}
            <div className="absolute left-4 top-6">
              <button 
                onClick={() => setStep("register_step2")}
                className="p-2.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-700 focus:outline-none"
                aria-label="Torna indietro"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Progress indicator */}
            <div className="mt-10 px-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                <span>Passo 3 di 3</span>
                <span className="text-slate-900 font-bold">Completato</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-full h-full bg-black rounded-full transition-all duration-500" />
              </div>
            </div>
          </div>

          {/* Central config block */}
          <div className="w-full max-w-sm mx-auto px-2 flex-1 flex flex-col justify-center items-center mt-12 md:mt-16">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Aggiungi una foto profilo
              </h2>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Un'immagine ti aiuta a personalizzare il tuo portale clienti
              </p>
            </div>

            {/* Avatar Upload Container with minimal dashed light-grey line */}
            <div 
              className="relative group cursor-pointer mb-8" 
              onClick={() => document.getElementById("avatar-file-input")?.click()}
            >
              <div className="w-32 h-32 rounded-full border border-dashed border-slate-300 hover:border-slate-400 bg-white flex flex-col items-center justify-center overflow-hidden transition-all shadow-none">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 mb-2 border border-slate-100">
                      <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Carica Foto</span>
                    <span className="text-[8px] text-slate-400 mt-0.5">O lascia vuoto</span>
                  </div>
                )}
              </div>
              
              {/* Edit Camera Badge - Black solid minimal */}
              <div className="absolute bottom-1 right-1 bg-slate-900 text-white p-2.5 rounded-full shadow-sm border border-white hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </div>
            </div>

            <input 
              type="file" 
              id="avatar-file-input" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarUrl(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }} 
            />

            {/* Automatic pre-filled Name display */}
            <h2 className="text-xl font-bold text-slate-900 text-center leading-tight">
              {firstName} {lastName}
            </h2>
            <div className="text-[11px] text-slate-500 font-medium tracking-wide mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
              <span>{nationality === "Bangladesh" ? "🇧🇩" : "🇵🇰"}</span>
              <span className="capitalize">{nationality}</span>
            </div>

            <p className="text-xs text-slate-500 font-medium text-center mt-6 max-w-xs leading-relaxed">
              Il tuo account è pronto. Ora puoi completare il profilo ed accedere a tutti i servizi di ricarica, spedizione e tariffe speciali.
            </p>

            {/* Complete onboarding CTA */}
            <button
              onClick={handleFinishOnboarding}
              className="w-full bg-black hover:bg-slate-900 text-white font-bold text-base rounded-full py-4 text-center tracking-wide mt-10 shadow-md shadow-black/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              Completa Profilo & Entra
            </button>
          </div>

          <div className="h-8" />

        </div>

        {/* ==================== SCHERMATA 3: HOME SCREEN (ORIGINALE RIPRISTINATA CON LOGOTICKER E COPOREGISTRAZIONE) ==================== */}
        <div id="schermata-home-originale" className="w-[12.5%] h-full flex flex-col bg-white relative overflow-hidden">
          
          {/* Scrollable Main Area */}
          <div className={`flex-1 overflow-y-auto pb-24 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all duration-700 ${
            showWelcomeOverlay && !isOverlayAnimatingOut ? "filter blur-md select-none pointer-events-none" : ""
          }`}>
            
            {/* Header con banner del negozio reale */}
            <HeroSection />

            {/* 3 PREMIUM TRUST TAGS - Distanziati con respiro */}
            <div className="px-4 pt-8 pb-3">
              <div className="grid grid-cols-3 gap-2.5">
                {/* Tag 1 (Security) */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 flex flex-col items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:scale-[1.02] transition-transform">
                  <div className="w-7 h-7 bg-white rounded-full border border-slate-100 flex items-center justify-center text-slate-800 mb-1.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-800 leading-tight">Guaranteed High Security</span>
                </div>

                {/* Tag 2 (Social Proof) */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 flex flex-col items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:scale-[1.02] transition-transform">
                  <div className="w-7 h-7 bg-white rounded-full border border-slate-100 flex items-center justify-center text-slate-800 mb-1.5 shadow-sm">
                    <Users className="w-4 h-4 text-slate-700" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-800 leading-tight">270+ Satisfied Clients</span>
                </div>

                {/* Tag 3 (Authority) */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-2.5 flex flex-col items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:scale-[1.02] transition-transform">
                  <div className="w-7 h-7 bg-white rounded-full border border-slate-100 flex items-center justify-center text-slate-800 mb-1.5 shadow-sm">
                    <Award className="w-4 h-4 text-slate-700" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-800 leading-tight">Highly Trusted Proprietor</span>
                </div>
              </div>
            </div>

            {/* Logo Tickers Scorrevoli (posizionati sotto i trust tags con maggiore distanza verticale) */}
            <div className="pt-10 pb-4 space-y-8">
              {/* SEZIONE MONEY TRANSFER LOGO TICKER */}
              <LogoTicker 
                title="MONEY TRANSFER" 
                logos={(tickerMoney || []).slice(0, 10)} 
                speedSeconds={35} 
                direction="left" 
              />

              {/* SEZIONE SIM CARD LOGO TICKER */}
              <LogoTicker 
                title="SIM CARD" 
                logos={(tickerSim || []).slice(0, 10)} 
                speedSeconds={35} 
                direction="right" 
              />
            </div>

            {/* NUOVO: Titolo "All services needed in one platform" + Le 7 barre descrittive dei servizi */}
            <div className="px-4 pt-10 pb-8">
              <h2 className="text-[18px] font-black text-slate-900 leading-tight tracking-tight mb-5 uppercase">
                All services needed in one platform
              </h2>
              
              <div className="space-y-4">
                {/* 1. Money Transfer */}
                <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-black/20 transition-all shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-black">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-normal">Money Transfer</h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed mt-1">Invia denaro in modo rapido, sicuro e conveniente in tutto il mondo.</p>
                  </div>
                </div>

                {/* 2. Telecom & SIM Activation */}
                <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-black/20 transition-all shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-normal">Telecom & SIM Activation</h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed mt-1">Attivazione schede SIM e gestione dei principali operatori telefonici.</p>
                  </div>
                </div>

                {/* 3. Delivery Service */}
                <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-black/20 transition-all shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-normal">Delivery Service</h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed mt-1">Spedizioni e consegne affidabili per i tuoi pacchi e documenti.</p>
                  </div>
                </div>

                {/* 4. Curriculum / CV Maker */}
                <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-black/20 transition-all shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-normal">Curriculum / CV Maker</h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed mt-1">Crea il tuo curriculum vitae professionale in pochi minuti.</p>
                  </div>
                </div>

                {/* 5. Recharge */}
                <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-black/20 transition-all shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0 text-yellow-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-normal">Recharge</h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed mt-1">Ricariche telefoniche istantanee nazionali e internazionali.</p>
                  </div>
                </div>

                {/* 6. Ticketing */}
                <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-black/20 transition-all shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-800">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-normal">Ticketing</h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed mt-1">Prenotazione e acquisto di biglietti aerei, treni e visti turistici.</p>
                  </div>
                </div>

                {/* 7. Wealink Market & Online Orders */}
                <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-black/20 transition-all shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-rose-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-normal">Wealink Market & Online Orders</h3>
                    <p className="text-base font-medium text-gray-600 leading-relaxed mt-1">Acquista i prodotti esclusivi Wealink e gestisci i tuoi ordini online da Amazon e Temu.</p>
                  </div>
                </div>
              </div>
            </div>



            {/* PREMIUM DASHBOARD CTA WITH ANIMATING CIRCLE LEFT-TO-RIGHT ON CLICK */}
            <button
              onClick={handleCtaClick}
              className="group relative flex items-center justify-between w-[calc(100%-2rem)] mx-4 bg-black text-white font-bold h-16 rounded-full shadow-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:shadow-lg active:scale-[0.98] mt-10 mb-4 cursor-pointer"
            >
              {/* Text - positioned nicely so it does not overlap with the circle on the left or the right */}
              <span className={`text-lg tracking-wide transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-full text-center ${
                ctaClicked ? "pr-16 pl-6 text-slate-300" : "pl-16 pr-6 text-white"
              }`}>
                Accedi alla Dashboard
              </span>

              {/* Genzam Circular Icon Container (Slides from left to right on click) */}
              <div 
                className={`absolute top-2 w-12 h-12 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 shadow-md overflow-hidden flex items-center justify-center ${
                  ctaClicked ? "left-[calc(100%-3.5rem)] bg-slate-100" : "left-2 bg-white"
                }`}
              >
                {/* Arrow Icon 1 (visible initially, slides right on hover or click) */}
                <ArrowRight className={`w-5 h-5 text-black transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  ctaClicked ? "translate-x-10" : "group-hover:translate-x-10"
                }`} />
                
                {/* Arrow Icon 2 (hidden to left initially, slides to center on hover or click) */}
                <ArrowRight className={`absolute w-5 h-5 text-black -translate-x-10 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  ctaClicked ? "translate-x-0" : "group-hover:translate-x-0"
                }`} />
              </div>
            </button>

            {/* TASTO ACCESSO AREA ADMIN */}
            <div className="px-4 pb-10 flex justify-center">
              <button
                onClick={() => {
                  try {
                    localStorage.setItem("onboarding_completed", "true");
                  } catch (e) {
                    console.warn(e);
                  }
                  navigate("/admin");
                }}
                className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black py-2.5 px-5 rounded-full hover:bg-slate-100 hover:text-black transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-black" />
                Area Amministratore (Admin)
              </button>
            </div>

          </div>

          {/* Bottom Navigation Bar fissa */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 h-16 flex justify-around items-center px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            
            {/* Home Tab */}
            <button className="flex flex-col items-center gap-0.5 text-black focus:outline-none">
              <Home className="w-5 h-5 text-black" strokeWidth={2.5} />
              <span className="text-[9px] font-extrabold">Home</span>
            </button>

            {/* Invia Denaro */}
            <button 
              onClick={() => setStep("dashboard")} 
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-black transition-colors focus:outline-none"
            >
              <Wallet className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[9px] font-bold">Invia Denaro</span>
            </button>

            {/* Shop */}
            <button 
              onClick={() => setStep("dashboard")} 
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-black transition-colors focus:outline-none"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[9px] font-bold">Shop</span>
            </button>

            {/* Viaggi */}
            <button 
              onClick={() => setStep("dashboard")} 
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-black transition-colors focus:outline-none"
            >
              <Plane className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[9px] font-bold">Viaggi</span>
            </button>

            {/* Impostazioni */}
            <button 
              onClick={() => setStep("dashboard")} 
              className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-black transition-colors focus:outline-none"
            >
              <Settings className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[9px] font-bold">Impostazioni</span>
            </button>
          </div>

          {/* Page 3 Home Entrance Welcome Overlay */}
          {showWelcomeOverlay && (
            <div 
              className={`absolute inset-0 z-[100] flex flex-col items-center justify-center px-6 transition-all duration-700 ease-in-out ${
                isOverlayAnimatingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100 bg-slate-900/40 backdrop-blur-md"
              }`}
            >
              <div className="bg-white rounded-[2rem] p-8 border border-white/20 shadow-2xl shadow-black/20 text-center max-w-[85%] animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-black uppercase tracking-wide leading-tight">
                  Welcome to Wealink
                </h2>
                <p className="text-slate-800 text-sm font-bold mt-2 leading-relaxed">
                  Money Transfer and Travel
                </p>
                <div className="w-10 h-1 mt-4 bg-black rounded-full mx-auto animate-pulse" />
              </div>
            </div>
          )}

        </div>

        {/* ==================== SCHERMATA 4: FINTECH MOCK-DASHBOARD ==================== */}
        <div className="w-[12.5%] h-full flex flex-col justify-between pt-56 pb-12 px-6 bg-white relative overflow-y-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          
          {/* FLOATING NOTIFICATION */}
          <div 
            className={`absolute top-4 left-4 right-4 z-50 bg-white shadow-2xl rounded-2xl p-4 border border-gray-100 transition-all duration-500 flex items-center gap-3 ${
              showNotification ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="relative flex-shrink-0 w-11 h-11">
              <img 
                src={logoUrl || "/wealink-final-logo.jpg.png"} 
                alt="Admin Avatar" 
                className="w-full h-full object-contain rounded-full border border-gray-100"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black uppercase tracking-wide">Wealink Support</span>
                <span className="text-[10px] text-gray-400 font-mono">Adesso</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
                {(() => {
                  const nameStr = userName || localStorage.getItem("wealink_client_name") || "";
                  const cleanName = nameStr.trim();
                  const isNumeric = /^\d+$/.test(cleanName);
                  if (cleanName && !isNumeric) {
                    return `Assalamualaikum ${cleanName} bhai!`;
                  } else {
                    return "Assalamualaikum bhai!";
                  }
                })()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Benvenuto nel portale ufficiale.
              </p>
            </div>
          </div>

          {/* BLACK/DARK CURTAIN HEADER */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-black rounded-b-[2rem] px-6 pt-6 pb-6 text-white z-30 flex flex-col justify-between shadow-lg shadow-black/10">
            {/* Top row with Logo and Brand only (exclusively, no online badges or duplicate avatar) */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center p-0.5 shadow-sm">
                  <img 
                    src={logoUrl || "/wealink-final-logo.jpg.png"} 
                    alt="Wealink Logo" 
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-white text-xl font-black tracking-widest">WEALINK</span>
              </div>
            </div>

            {/* Bottom row inside curtain with mini stats/text */}
            <div className="flex items-end justify-between mt-1">
              <div>
                <h1 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Portale Clienti</h1>
                <p className="text-sm font-medium text-white/95 mt-0.5">Tassi di cambio in tempo reale</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">v1.2</span>
            </div>
          </div>

          {/* SEZIONE TASSI DI OGGI */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-tight">I TASSI DI OGGI</h2>
            <div className="grid grid-cols-3 gap-3">
              
              {/* Card 1: bKash */}
              <div className="bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 bg-fuchsia-50 rounded-full flex items-center justify-center text-fuchsia-600 mb-2">
                  {/* ICON PLACEHOLDER - EASILY REPLACEABLE WITH IMG/LOCAL SVG */}
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">bKash</span>
                <span className="text-lg font-bold text-gray-900 mt-1">৳{bkashRate ? bkashRate.toFixed(2) : "124.00"}</span>
              </div>

              {/* Card 2: Account */}
              <div className="bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-black mb-2">
                  {/* ICON PLACEHOLDER - EASILY REPLACEABLE WITH IMG/LOCAL SVG */}
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-wider text-gray-400 font-bold uppercase">Account</span>
                <span className="text-lg font-bold text-gray-900 mt-1">৳{bankRate ? bankRate.toFixed(2) : "125.50"}</span>
              </div>

              {/* Card 3: PIN Number */}
              <div className="bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-2">
                  {/* ICON PLACEHOLDER - EASILY REPLACEABLE WITH IMG/LOCAL SVG */}
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-wider text-gray-400 font-bold uppercase font-sans">PIN Number</span>
                <span className="text-lg font-bold text-gray-900 mt-1 font-mono">****</span>
              </div>

            </div>
          </div>

          {/* GRIGLIA GEOMETRICA SERVIZI CORE */}
          <div className="mb-6 flex-1">
            <h2 className="text-xs font-bold text-gray-400 tracking-wider mb-3 uppercase">I NOSTRI SERVIZI CORE</h2>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Invia Soldi */}
              <div 
                onClick={() => handleServiceClick("Invia Soldi")}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between h-[115px] shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-100 text-black p-2.5 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">Invia Soldi</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-1">Tassi live senza commissioni</div>
                </div>
              </div>

              {/* Ricariche */}
              <div 
                onClick={() => handleServiceClick("Ricariche")}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between h-[115px] shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-100 text-black p-2.5 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">Ricariche</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-1">SIM card e attivazioni nazionali</div>
                </div>
              </div>

              {/* Biglietteria */}
              <div 
                onClick={() => handleServiceClick("Biglietteria")}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between h-[115px] shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-100 text-black p-2.5 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">Biglietteria</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-1">Voli, biglietti aerei e visti</div>
                </div>
              </div>

              {/* Mercato */}
              <div 
                onClick={() => handleServiceClick("Mercato")}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between h-[115px] shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-100 text-black p-2.5 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">Mercato</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-1">Prodotti ed elettronica per te</div>
                </div>
              </div>

              {/* Spedisci */}
              <div 
                onClick={() => handleServiceClick("Spedisci")}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between h-[115px] shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-100 text-black p-2.5 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">Spedisci</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-1">Invia pacchi e merci in sicurezza</div>
                </div>
              </div>

              {/* Crea CV / Curriculum */}
              <div 
                onClick={() => handleServiceClick("Crea CV")}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between h-[115px] shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-100 text-black p-2.5 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">Crea CV</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-1">Format professionali per il lavoro</div>
                </div>
              </div>

              {/* Acquista SIM */}
              <div 
                onClick={() => handleServiceClick("Acquista SIM")}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col justify-between h-[115px] shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-100 text-black p-2.5 rounded-xl flex items-center justify-center">
                  <Cpu className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">Acquista SIM</div>
                  <div className="text-[11px] text-gray-400 leading-tight mt-1">Nuove schede e piani tariffari</div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Simulated Google login modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Google Header */}
            <div className="p-6 text-center border-b border-gray-100 flex flex-col items-center">
              <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.15C3.26 21.17 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24a7.15 7.15 0 0 1 0-4.48V6.61H1.29a11.94 11.94 0 0 0 0 10.78l3.98-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.31 0 3.26 2.83 1.29 6.61l3.98 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <h3 className="text-base font-black text-slate-800">Accedi con Google</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Scegli un account per continuare su Wealink</p>
            </div>

            {googleLoading ? (
              <div className="p-10 flex flex-col items-center justify-center space-y-3">
                <svg className="animate-spin h-8 w-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-bold text-slate-500">Connessione in corso...</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Account 1 */}
                <button
                  type="button"
                  onClick={() => handleGoogleSelect("Mohammad", "Hossein")}
                  className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    MH
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-800 truncate">Mohammad Hossein</div>
                    <div className="text-[10px] text-slate-400 font-semibold truncate">hossein.mohammad@gmail.com</div>
                  </div>
                </button>

                {/* Account 2 */}
                <button
                  type="button"
                  onClick={() => handleGoogleSelect("Salim", "Ahmed")}
                  className="w-full px-6 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    SA
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-800 truncate">Salim Ahmed</div>
                    <div className="text-[10px] text-slate-400 font-semibold truncate">salim.ahmed@gmail.com</div>
                  </div>
                </button>

                {/* Use another account */}
                <button
                  type="button"
                  onClick={() => {
                    setShowGoogleModal(false);
                    toast.info("Inserisci i tuoi dati manualmente nel modulo di registrazione.");
                  }}
                  className="w-full px-6 py-4 text-center text-xs font-black text-black hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Usa un altro account
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

