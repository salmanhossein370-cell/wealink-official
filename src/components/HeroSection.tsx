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
    <div id="hero-section" className="relative w-full h-56 overflow-hidden rounded-b-3xl bg-gray-100 shadow-inner">
      {/* Scrollable Container with Swipe & Auto-scroll capabilities */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="absolute inset-0 w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full h-full flex-shrink-0 snap-start">
            <img 
              src={slide.url} 
              alt={slide.title} 
              className="w-full h-full object-cover brightness-100 contrast-100" 
            />
            
            {/* Elegant centered text without the black background box, using a strong drop shadow for perfect legibility */}
            <div className="absolute inset-x-0 bottom-7 z-10 flex flex-col items-center justify-center px-6 text-center select-none">
              <h2 
                className="text-white text-sm sm:text-base md:text-lg font-black tracking-wider leading-tight uppercase"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.95)" }}
              >
                {slide.title}
              </h2>
              <p 
                className="text-white/95 text-xs sm:text-sm font-bold mt-1 leading-snug max-w-[90%] mx-auto"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.95)" }}
              >
                {slide.subtitle}
              </p>
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
            className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-lg"
          />
        ) : (
          <div className="w-12 h-12 rounded-full border-2 border-white/80 shadow-lg bg-white/20" />
        )}
        
        <button
          onClick={handleResetOnboarding}
          className="bg-black/40 backdrop-blur-md border border-white/15 hover:bg-white/15 text-white/90 hover:text-white p-2.5 rounded-full transition-all flex items-center justify-center shadow-lg active:scale-95 group"
          title="Ripristina e visualizza Welcome Onboarding"
        >
          <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
        </button>
      </div>

      <div className="absolute top-3 right-3 z-20">
        <LanguageSelector />
      </div>

      {/* CAROUSEL INDICATOR DOTS */}
      <div className="absolute bottom-2 z-20 flex justify-center gap-1.5 w-full">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
              currentSlide === index ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
