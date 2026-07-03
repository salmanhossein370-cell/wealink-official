import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAdmin } from "@/contexts/AdminContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Compass } from "lucide-react";

const HeroSection = () => {
  const { t } = useTranslation();
  const { logoUrl, heroUrl, heroTitle, heroSubtitle, loading, heroSlides } = useAdmin();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [
    {
      id: "1",
      url: heroUrl || "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
      title: heroTitle || "Wealink Money Transfer",
      subtitle: heroSubtitle || "Il tuo punto di riferimento per ricariche e trasferimenti",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80",
      title: "Global Money Transfer",
      subtitle: "Invia denaro in tutto il mondo in modo rapido e sicuro",
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
      title: "Travel & Ticketing",
      subtitle: "Prenotazione biglietti aerei, treni e visti turistici",
    }
  ];

  // Auto-scroll every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const nextSlide = (currentSlide + 1) % slides.length;
      const { clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        left: nextSlide * clientWidth,
        behavior: "smooth"
      });
      setCurrentSlide(nextSlide);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== currentSlide && index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  const handleDotClick = (index: number) => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    scrollContainerRef.current.scrollTo({
      left: index * clientWidth,
      behavior: "smooth"
    });
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="relative w-full h-56 overflow-hidden rounded-b-3xl">
        <Skeleton className="absolute inset-0 w-full h-full rounded-b-3xl" />
        <div className="absolute top-3 left-3 z-20">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
        <div className="absolute top-3 right-3 z-20">
          <Skeleton className="w-12 h-8 rounded-md" />
        </div>
      </div>
    );
  }

  const handleResetOnboarding = () => {
    try {
      localStorage.removeItem("onboarding_completed");
      (window as any).location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="hero-section" className="relative w-[calc(100%-2rem)] mx-4 h-[210px] overflow-hidden rounded-3xl bg-slate-50/80 border border-slate-100 mt-4">
      {/* Scrollable Container with Swipe & Auto-scroll capabilities */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="absolute inset-0 w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full h-full flex-shrink-0 snap-start flex items-center justify-between pl-6 pr-5 py-4 gap-4 bg-slate-50">
            {/* Left Column: Google-style Modern Text Content & solid black rounded button */}
            <div className="flex-1 pr-2 flex flex-col justify-center items-start text-left">
              <h2 className="text-slate-900 text-sm sm:text-base md:text-lg font-bold tracking-tight leading-snug font-sans max-w-[95%]">
                {slide.title}
              </h2>
              <p className="text-slate-500 text-[11px] sm:text-xs mt-1 leading-normal font-medium max-w-[95%] line-clamp-2">
                {slide.subtitle}
              </p>
              
              <button 
                onClick={() => {
                  const servicesEl = document.getElementById("services-section");
                  if (servicesEl) {
                    servicesEl.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollBy({ top: 400, behavior: "smooth" });
                  }
                }}
                className="mt-3 bg-slate-900 hover:bg-black text-white font-semibold text-[11px] px-4 py-2 rounded-full active:scale-95 transition-all cursor-pointer shadow-none"
              >
                Inizia ora
              </button>
            </div>
            
            {/* Right Column: Beautifully framed image */}
            <div className="w-1/3 sm:w-2/5 h-28 sm:h-32 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.03)] bg-white">
              <img 
                src={slide.url} 
                alt={slide.title} 
                className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02]" 
              />
            </div>
          </div>
        ))}
      </div>

      {/* STATIC CONTROLS OVERLAID ON THE CAROUSEL */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Wealink Logo"
            className="w-10 h-10 rounded-full object-cover border border-slate-200/60 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full border border-slate-200/60 shadow-sm bg-white" />
        )}
        
        <button
          onClick={handleResetOnboarding}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 p-2 rounded-full transition-all flex items-center justify-center shadow-sm active:scale-95 group"
          title="Ripristina e visualizza Welcome Onboarding"
        >
          <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
        </button>
      </div>

      <div className="absolute top-3 right-3 z-20">
        <LanguageSelector />
      </div>

      {/* CAROUSEL INDICATOR DOTS */}
      <div className="absolute bottom-2.5 z-20 flex justify-center gap-1.5 w-full">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
              currentSlide === index ? "w-4 bg-slate-900" : "w-1.5 bg-slate-300/70 hover:bg-slate-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
