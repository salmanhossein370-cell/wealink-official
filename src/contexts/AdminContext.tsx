import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TickerLogo {
  id: string;
  name: string;
  url: string;
}

export interface HeroSlide {
  id: string;
  url: string;
  title: string;
  subtitle: string;
}

export interface OnboardingSlide {
  id: string;
  url: string;
  title: string;
  subtitle: string;
}

interface AdminContextType {
  bankRate: number;
  setBankRate: (rate: number) => void;
  bkashMoneyRate: number;
  setBkashMoneyRate: (rate: number) => void;
  pinRate: number;
  setPinRate: (rate: number) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  logoUrl: string;
  heroUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  updateHeroSettings: (settings: { store_image_url: string; title: string; subtitle: string }) => Promise<void>;
  loading: boolean;
  tickerMoney: TickerLogo[];
  setTickerMoney: (logos: TickerLogo[]) => void;
  tickerSim: TickerLogo[];
  setTickerSim: (logos: TickerLogo[]) => void;
  partners: any[];
  setPartners: (partners: any[]) => void;
  heroSlides: HeroSlide[];
  setHeroSlides: (slides: HeroSlide[]) => void;
  onboardingSlides: OnboardingSlide[];
  setOnboardingSlides: (slides: OnboardingSlide[]) => void;
  shopBanners: any[];
  bkashRate: number;
  nagadRate: number;
}

export const AdminContext = createContext<AdminContextType | null>(null);

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "h1",
    url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
    title: "Wealink Money Transfer",
    subtitle: "Il tuo punto di riferimento per ricariche e trasferimenti",
  },
  {
    id: "h2",
    url: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80",
    title: "Global Money Transfer",
    subtitle: "Invia denaro in tutto il mondo in modo rapido e sicuro",
  },
  {
    id: "h3",
    url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    title: "Travel & Ticketing",
    subtitle: "Prenotazione biglietti aerei, treni e visti turistici",
  }
];

const DEFAULT_ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "o1",
    url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    title: "Wealink Money Transfer",
    subtitle: "Invia denaro in Bangladesh e Pakistan con le migliori tariffe garantite.",
  },
  {
    id: "o2",
    url: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80",
    title: "Ricariche Istantanee",
    subtitle: "Ricarica bKash, Nagad, Rocket e SIM locali italiane in pochi secondi.",
  },
  {
    id: "o3",
    url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=800&q=80",
    title: "Sicuro e Trasparente",
    subtitle: "Nessun costo nascosto. Monitora il tuo trasferimento in tempo reale.",
  }
];

const DEFAULT_TICKER_MONEY: TickerLogo[] = [
  { id: "m1", name: "bKash", url: "https://placehold.co/240x80?text=bKash" },
  { id: "m2", name: "Nagad", url: "https://placehold.co/240x80?text=Nagad" },
  { id: "m3", name: "Western Union", url: "https://placehold.co/240x80?text=Western+Union" },
  { id: "m4", name: "MoneyGram", url: "https://placehold.co/240x80?text=MoneyGram" },
  { id: "m5", name: "Wise", url: "https://placehold.co/240x80?text=Wise" },
  { id: "m6", name: "Ria", url: "https://placehold.co/240x80?text=Ria" },
  { id: "m7", name: "Remitly", url: "https://placehold.co/240x80?text=Remitly" },
  { id: "m8", name: "TapTap Send", url: "https://placehold.co/240x80?text=TapTap+Send" },
  { id: "m9", name: "WorldRemit", url: "https://placehold.co/240x80?text=WorldRemit" },
  { id: "m10", name: "Sonali Bank", url: "https://placehold.co/240x80?text=Sonali+Bank" },
];

const DEFAULT_TICKER_SIM: TickerLogo[] = [
  { id: "s1", name: "TIM", url: "https://placehold.co/240x80?text=TIM" },
  { id: "s2", name: "Vodafone", url: "https://placehold.co/240x80?text=Vodafone" },
  { id: "s3", name: "WindTre", url: "https://placehold.co/240x80?text=WindTre" },
  { id: "s4", name: "Iliad", url: "https://placehold.co/240x80?text=Iliad" },
  { id: "s5", name: "Fastweb", url: "https://placehold.co/240x80?text=Fastweb" },
  { id: "s6", name: "PosteMobile", url: "https://placehold.co/240x80?text=PosteMobile" },
  { id: "s7", name: "Ho. Mobile", url: "https://placehold.co/240x80?text=Ho.+Mobile" },
  { id: "s8", name: "Very Mobile", url: "https://placehold.co/240x80?text=Very+Mobile" },
  { id: "s9", name: "Kena Mobile", url: "https://placehold.co/240x80?text=Kena+Mobile" },
  { id: "s10", name: "CoopVoce", url: "https://placehold.co/240x80?text=CoopVoce" },
];

const DEFAULT_PARTNERS = [
  { id: "p1", name: "Partner 1", logo: "https://placehold.co/150x50?text=Partner+1" },
  { id: "p2", name: "Partner 2", logo: "https://placehold.co/150x50?text=Partner+2" },
  { id: "p3", name: "Partner 3", logo: "https://placehold.co/150x50?text=Partner+3" },
  { id: "p4", name: "Partner 4", logo: "https://placehold.co/150x50?text=Partner+4" },
  { id: "p5", name: "Partner 5", logo: "https://placehold.co/150x50?text=Partner+5" },
];

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [bankRate, setBankRateState] = useState<number>(() => {
    const saved = localStorage.getItem("wealink_bank_rate");
    return saved ? parseFloat(saved) : 125.50;
  });
  const [bkashMoneyRate, setBkashMoneyRateState] = useState<number>(() => {
    const saved = localStorage.getItem("wealink_bkash_rate");
    return saved ? parseFloat(saved) : 124.00;
  });
  const [pinRate, setPinRateState] = useState<number>(() => {
    const saved = localStorage.getItem("wealink_pin_rate");
    return saved ? parseFloat(saved) : 123.00;
  });
  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    const saved = localStorage.getItem("wealink_exchange_rate");
    return saved ? parseFloat(saved) : 125.50;
  });

  const setBankRate = (rate: number) => {
    setBankRateState(rate);
    localStorage.setItem("wealink_bank_rate", rate.toString());
  };
  const setBkashMoneyRate = (rate: number) => {
    setBkashMoneyRateState(rate);
    localStorage.setItem("wealink_bkash_rate", rate.toString());
  };
  const setPinRate = (rate: number) => {
    setPinRateState(rate);
    localStorage.setItem("wealink_pin_rate", rate.toString());
  };
  const setExchangeRate = (rate: number) => {
    setExchangeRateState(rate);
    localStorage.setItem("wealink_exchange_rate", rate.toString());
  };
  const [logoUrl] = useState<string>("/wealink-final-logo.jpg.png");
  
  // Dynamic Hero Settings from Supabase
  const [heroUrl, setHeroUrl] = useState<string>("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000");
  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize mock table data inside localStorage if not present
  useEffect(() => {
    try {
      if (!localStorage.getItem("mock_supabase_hero_settings")) {
        const defaultHero = [
          {
            id: "hero_default",
            key: "hero",
            store_image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000",
            title: "",
            subtitle: "Il tuo punto di riferimento per ricariche e trasferimenti",
            created_at: new Date().toISOString()
          }
        ];
        localStorage.setItem("mock_supabase_hero_settings", JSON.stringify(defaultHero));
      }
    } catch (err) {
      console.warn("[Self-Healing] Failed to initialize mock_supabase_hero_settings in localStorage. Using memory fallback.", err);
    }
  }, []);

  // Fetch Hero settings on load
  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await (supabase as any)
          .from('hero_settings')
          .select('*')
          .eq('key', 'hero')
          .single();

        if (data) {
          const d = data as any;
          if (d.store_image_url) setHeroUrl(d.store_image_url);
          if (d.title !== undefined) setHeroTitle(d.title || "");
          if (d.subtitle !== undefined) setHeroSubtitle(d.subtitle || "");
        } else {
          // Attempt first available record
          const { data: list } = await (supabase as any).from('hero_settings').select('*');
          if (list && list.length > 0) {
            const first = list[0] as any;
            if (first.store_image_url) setHeroUrl(first.store_image_url);
            if (first.title !== undefined) setHeroTitle(first.title || "");
            if (first.subtitle !== undefined) setHeroSubtitle(first.subtitle || "");
          }
        }
      } catch (err) {
        console.warn("Failed to fetch 'hero_settings' from Supabase. Falling back to default settings.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSettings();
  }, []);

  const updateHeroSettings = async (settings: { store_image_url: string; title: string; subtitle: string }) => {
    try {
      setLoading(true);
      const { error } = await (supabase as any)
        .from('hero_settings')
        .upsert({
          key: 'hero',
          store_image_url: settings.store_image_url,
          title: settings.title,
          subtitle: settings.subtitle,
          updated_at: new Date().toISOString()
        } as any);

      if (error) throw error;

      if (settings.store_image_url) setHeroUrl(settings.store_image_url);
      setHeroTitle(settings.title);
      setHeroSubtitle(settings.subtitle);
    } catch (err) {
      console.error("Failed to update hero settings in Supabase:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Default lists to prevent any empty screens or crashes
  const [tickerMoney, setTickerMoneyState] = useState<TickerLogo[]>(() => {
    const saved = localStorage.getItem("wealink_ticker_money");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TICKER_MONEY;
      }
    }
    return DEFAULT_TICKER_MONEY;
  });

  const [tickerSim, setTickerSimState] = useState<TickerLogo[]>(() => {
    const saved = localStorage.getItem("wealink_ticker_sim");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TICKER_SIM;
      }
    }
    return DEFAULT_TICKER_SIM;
  });

  const [partners, setPartnersState] = useState<any[]>(() => {
    const saved = localStorage.getItem("wealink_partners_logos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PARTNERS;
      }
    }
    return DEFAULT_PARTNERS;
  });
  const [heroSlides, setHeroSlidesState] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem("wealink_hero_slides");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_HERO_SLIDES;
      }
    }
    return DEFAULT_HERO_SLIDES;
  });
  
  const [onboardingSlides, setOnboardingSlidesState] = useState<OnboardingSlide[]>(() => {
    const saved = localStorage.getItem("wealink_onboarding_slides");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ONBOARDING_SLIDES;
      }
    }
    return DEFAULT_ONBOARDING_SLIDES;
  });

  const [shopBanners] = useState<any[]>([]);

  const setTickerMoney = (logos: TickerLogo[]) => {
    setTickerMoneyState(logos);
    localStorage.setItem("wealink_ticker_money", JSON.stringify(logos));
  };

  const setTickerSim = (logos: TickerLogo[]) => {
    setTickerSimState(logos);
    localStorage.setItem("wealink_ticker_sim", JSON.stringify(logos));
  };

  const setPartners = (newPartners: any[]) => {
    setPartnersState(newPartners);
    localStorage.setItem("wealink_partners_logos", JSON.stringify(newPartners));
  };

  const setHeroSlides = (slides: HeroSlide[]) => {
    setHeroSlidesState(slides);
    localStorage.setItem("wealink_hero_slides", JSON.stringify(slides));
  };

  const setOnboardingSlides = (slides: OnboardingSlide[]) => {
    setOnboardingSlidesState(slides);
    localStorage.setItem("wealink_onboarding_slides", JSON.stringify(slides));
  };

  return (
    <AdminContext.Provider value={{
      bankRate,
      setBankRate,
      bkashMoneyRate,
      setBkashMoneyRate,
      pinRate,
      setPinRate,
      exchangeRate,
      setExchangeRate,
      logoUrl,
      heroUrl,
      heroTitle,
      heroSubtitle,
      updateHeroSettings,
      loading,
      tickerMoney,
      setTickerMoney,
      tickerSim,
      setTickerSim,
      partners,
      setPartners,
      heroSlides,
      setHeroSlides,
      onboardingSlides,
      setOnboardingSlides,
      shopBanners,
      bkashRate: bkashMoneyRate,
      nagadRate: pinRate
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    // Provide safe defaults if used outside provider
    return {
      bankRate: 125.50,
      setBankRate: () => {},
      bkashMoneyRate: 124.00,
      setBkashMoneyRate: () => {},
      pinRate: 123.00,
      setPinRate: () => {},
      exchangeRate: 125.50,
      setExchangeRate: () => {},
      logoUrl: "/wealink-final-logo.jpg.png",
      heroUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000",
      heroTitle: "",
      heroSubtitle: "",
      updateHeroSettings: async () => {},
      loading: false,
      tickerMoney: DEFAULT_TICKER_MONEY,
      setTickerMoney: () => {},
      tickerSim: DEFAULT_TICKER_SIM,
      setTickerSim: () => {},
      partners: DEFAULT_PARTNERS,
      setPartners: () => {},
      heroSlides: DEFAULT_HERO_SLIDES,
      setHeroSlides: () => {},
      onboardingSlides: DEFAULT_ONBOARDING_SLIDES,
      setOnboardingSlides: () => {},
      shopBanners: [],
      bkashRate: 124.00,
      nagadRate: 123.00
    };
  }
  return context;
}
