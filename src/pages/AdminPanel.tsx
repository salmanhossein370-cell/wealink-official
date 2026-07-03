import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Plus, Trash2, ArrowLeft, Image as ImageIcon, Layers, HelpCircle, Upload, Check, Loader2, Users, MessageSquare, UserMinus, ArrowUp, ArrowDown, Edit2, Globe } from "lucide-react";
import { APP_VERSION } from "@/version";

// Client-side image compression utility
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<{ blob: Blob; base64: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Contesto canvas non disponibile"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL("image/jpeg", quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, base64 });
            } else {
              reject(new Error("Errore durante la creazione del blob compresso"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Client-side lightweight translation utility using Google Translate undoc endpoint + MyMemory fallback
const translateText = async (text: string, targetLang: string, sourceLang = "auto"): Promise<string> => {
  if (!text || !text.trim()) return "";
  const trimmed = text.trim();
  
  // Clean translation request using Google Translate (extremely fast & free)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
    }
  } catch (err) {
    console.error(`Google Translate failed for ${targetLang}, trying MyMemory...`, err);
  }

  // Backup translation API: MyMemory (free, no auth)
  try {
    const pair = sourceLang === "auto" ? `it|${targetLang}` : `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${pair}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch (err) {
    console.error(`MyMemory Translate failed for ${targetLang}:`, err);
  }

  // Final fallback (just return the trimmed source text)
  return trimmed;
};

export default function AdminPanel() {
  const { 
    tickerMoney, 
    setTickerMoney, 
    tickerSim, 
    setTickerSim, 
    partners, 
    setPartners, 
    heroSlides, 
    setHeroSlides,
    heroUrl,
    heroTitle,
    heroSubtitle,
    updateHeroSettings,
    bankRate,
    setBankRate,
    bkashMoneyRate,
    setBkashMoneyRate,
    pinRate,
    setPinRate,
    onboardingSlides,
    setOnboardingSlides
  } = useAdmin();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("wealink_admin_authenticated") === "true";
  });
  const [passError, setPassError] = useState("");
  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'tickers' | 'clients' | 'onboarding'>('general');

  // Onboarding settings form states
  const [newOnboardTitleIt, setNewOnboardTitleIt] = useState("");
  const [newOnboardTitleEn, setNewOnboardTitleEn] = useState("");
  const [newOnboardTitleBn, setNewOnboardTitleBn] = useState("");
  const [newOnboardTitleUr, setNewOnboardTitleUr] = useState("");

  const [newOnboardSubtitleIt, setNewOnboardSubtitleIt] = useState("");
  const [newOnboardSubtitleEn, setNewOnboardSubtitleEn] = useState("");
  const [newOnboardSubtitleBn, setNewOnboardSubtitleBn] = useState("");
  const [newOnboardSubtitleUr, setNewOnboardSubtitleUr] = useState("");

  const [newOnboardImage, setNewOnboardImage] = useState("");
  const [newOnboardFileLoading, setNewOnboardFileLoading] = useState(false);
  const [newOnboardValidationError, setNewOnboardValidationError] = useState("");
  const [isTranslatingNew, setIsTranslatingNew] = useState(false);
  const [isTranslatingEdit, setIsTranslatingEdit] = useState(false);

  // Edit slide state
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editingTitleIt, setEditingTitleIt] = useState("");
  const [editingTitleEn, setEditingTitleEn] = useState("");
  const [editingTitleBn, setEditingTitleBn] = useState("");
  const [editingTitleUr, setEditingTitleUr] = useState("");

  const [editingSubtitleIt, setEditingSubtitleIt] = useState("");
  const [editingSubtitleEn, setEditingSubtitleEn] = useState("");
  const [editingSubtitleBn, setEditingSubtitleBn] = useState("");
  const [editingSubtitleUr, setEditingSubtitleUr] = useState("");

  // Exchange rate input states
  const [inputBankRate, setInputBankRate] = useState(bankRate || 125.50);
  const [inputBkashRate, setInputBkashRate] = useState(bkashMoneyRate || 124.00);
  const [inputPinRate, setInputPinRate] = useState(pinRate || 123.00);

  // Hero settings form states
  const [inputHeroTitle, setInputHeroTitle] = useState(heroTitle || "");
  const [inputHeroSubtitle, setInputHeroSubtitle] = useState(heroSubtitle || "");
  const [inputHeroUrl, setInputHeroUrl] = useState(heroUrl || "");
  const [heroFileLoading, setHeroFileLoading] = useState(false);
  const [heroSaveLoading, setHeroSaveLoading] = useState(false);
  const [heroValidationError, setHeroValidationError] = useState("");

  // Slide creation states
  const [newSlideTitle, setNewSlideTitle] = useState("");
  const [newSlideSubtitle, setNewSlideSubtitle] = useState("");
  const [newSlideImage, setNewSlideImage] = useState("");
  const [newSlideFileLoading, setNewSlideFileLoading] = useState(false);
  const [newSlideValidationError, setNewSlideValidationError] = useState("");

  // Sync state when context values are loaded
  useEffect(() => {
    if (heroTitle !== undefined) setInputHeroTitle(prev => prev !== heroTitle ? heroTitle : prev);
    if (heroSubtitle !== undefined) setInputHeroSubtitle(prev => prev !== heroSubtitle ? heroSubtitle : prev);
    if (heroUrl !== undefined) setInputHeroUrl(prev => prev !== heroUrl ? heroUrl : prev);
    if (bankRate !== undefined) setInputBankRate(bankRate);
    if (bkashMoneyRate !== undefined) setInputBkashRate(bkashMoneyRate);
    if (pinRate !== undefined) setInputPinRate(pinRate);
  }, [heroTitle, heroSubtitle, heroUrl, bankRate, bkashMoneyRate, pinRate]);

  // Clients CRM State
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [greetings, setGreetings] = useState<Record<string, string>>({});
  const [savingGreetingId, setSavingGreetingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const loadClients = async () => {
    try {
      setClientsLoading(true);
      let allClients: any[] = [];

      // 1. Load from Supabase
      const { data, error } = await (supabase.from('clients') as any).select('*');
      if (error) {
        console.error("Error fetching clients from Supabase:", error);
      } else if (data) {
        allClients = [...data];
      }

      // 2. Load and merge with LocalStorage backup
      const localClientsStr = localStorage.getItem("wealink_local_clients");
      if (localClientsStr) {
        try {
          const localClients = JSON.parse(localClientsStr);
          localClients.forEach((lc: any) => {
            if (!allClients.some((c: any) => c.id === lc.id)) {
              allClients.push(lc);
            }
          });
        } catch (e) {
          console.error("Error parsing local clients backup:", e);
        }
      }

      // 3. Filter out deleted clients (blacklist) to guarantee instant, permanent UI removal
      const deletedIdsStr = localStorage.getItem("wealink_deleted_clients") || "[]";
      try {
        const deletedIds = JSON.parse(deletedIdsStr);
        allClients = allClients.filter((c: any) => !deletedIds.includes(c.id));
      } catch (e) {
        console.error("Error filtering deleted clients:", e);
      }

      const sorted = allClients.sort((a: any, b: any) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      setClients(sorted);
      
      const initialGreetings: Record<string, string> = {};
      sorted.forEach((c: any) => {
        initialGreetings[c.id] = c.custom_greeting || "";
      });
      setGreetings(initialGreetings);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadClients();
    }
  }, [isAuthenticated]);

  const handleGreetingChange = (id: string, text: string) => {
    setGreetings(prev => ({ ...prev, [id]: text }));
  };

  const handleSaveGreeting = async (id: string) => {
    const greetingText = greetings[id] || "";
    try {
      setSavingGreetingId(id);
      
      // Update in Supabase
      const { error } = await (supabase.from('clients') as any).update({ custom_greeting: greetingText }).eq('id', id);
      if (error) {
        console.warn("Could not save greeting to Supabase:", error);
      }

      // Update in LocalStorage backup
      const localClientsStr = localStorage.getItem("wealink_local_clients");
      if (localClientsStr) {
        try {
          const localClients = JSON.parse(localClientsStr);
          const updated = localClients.map((c: any) => {
            if (c.id === id) {
              return { ...c, custom_greeting: greetingText };
            }
            return c;
          });
          localStorage.setItem("wealink_local_clients", JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }

      toast.success("Saluto personalizzato salvato con successo!");
      loadClients();
    } catch (err) {
      console.error(err);
      toast.error("Errore di rete durante il salvataggio.");
    } finally {
      setSavingGreetingId(null);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    try {
      // 0. Instantly filter out from React local state for immediate feedback
      setClients((prev) => prev.filter((c: any) => c.id !== id));

      // 1. Save to deleted clients blacklist immediately to prevent any restoration
      const deletedIdsStr = localStorage.getItem("wealink_deleted_clients") || "[]";
      try {
        const deletedIds = JSON.parse(deletedIdsStr);
        if (!deletedIds.includes(id)) {
          deletedIds.push(id);
          localStorage.setItem("wealink_deleted_clients", JSON.stringify(deletedIds));
        }
      } catch (e) {
        console.error("Error saving blacklist ID:", e);
      }

      // 2. Delete from LocalStorage backup immediately
      const localClientsStr = localStorage.getItem("wealink_local_clients");
      if (localClientsStr) {
        try {
          const localClients = JSON.parse(localClientsStr);
          const updated = localClients.filter((c: any) => c.id !== id);
          localStorage.setItem("wealink_local_clients", JSON.stringify(updated));
        } catch (e) {
          console.error("Error filtering local clients backup:", e);
        }
      }

      // 3. Clear self logged in session if it's our own profile being deleted
      if (localStorage.getItem("wealink_client_id") === id) {
        localStorage.removeItem("wealink_client_id");
        localStorage.removeItem("wealink_client_name");
        localStorage.removeItem("wealink_client_phone");
      }

      // 4. Delete from Supabase
      const { error } = await (supabase.from('clients') as any).delete().eq('id', id);
      if (error) {
        console.warn("Could not delete from Supabase:", error);
      }

      toast.success(`Cliente "${name}" eliminato con successo.`);
      // Reload from DB and LocalStorage to synchronize final states
      loadClients();
    } catch (err) {
      console.error(err);
      toast.error("Errore durante l'eliminazione del cliente.");
    }
  };

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroValidationError(""); // Reset any previous validation error

    // 1. Controllo del Formato (Solo Immagini: PNG, JPG, JPEG, WEBP)
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = "Formato non valido! Puoi caricare solo immagini (JPG, PNG, WEBP).";
      setHeroValidationError(errorMsg);
      toast.error(errorMsg);
      e.target.value = ""; // Reset the input field
      return;
    }

    // 2. Limite di Peso (Max 2MB)
    if (file.size > 2000000) {
      const errorMsg = "File troppo pesante! Massimo 2MB per garantire la velocità della pagina.";
      setHeroValidationError(errorMsg);
      toast.error(errorMsg);
      e.target.value = ""; // Reset the input field
      return;
    }

    const bucketName = "hero-images";
    setHeroFileLoading(true);

    try {
      // Compress the image before uploading or converting
      console.log("[Self-Healing] Compressing image on-the-fly to optimize weight...");
      const { blob, base64 } = await compressImage(file, 1200, 1200, 0.7);
      console.log(`[Self-Healing] Image compressed successfully! Original size: ${(file.size / 1024).toFixed(1)}KB, Compressed size: ${(blob.size / 1024).toFixed(1)}KB`);

      // 1. Try to ensure the bucket exists first
      try {
        console.log(`[Self-Healing] Trying to create/verify storage bucket "${bucketName}"...`);
        await supabase.storage.createBucket(bucketName, { public: true });
      } catch (bucketErr) {
        console.log("[Self-Healing] Programmatic bucket creation bypassed/completed:", bucketErr);
      }

      // 2. Try standard storage upload using the compressed blob
      const cleanedName = file.name.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `hero_bg_${Date.now()}_${cleanedName}.jpg`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob, {
          contentType: "image/jpeg"
        });

      if (error) {
        throw error;
      }

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        setInputHeroUrl(urlData.publicUrl);
        toast.success("Immagine caricata correttamente nello Storage di Supabase!");
      } else {
        throw new Error("Impossibile recuperare l'URL pubblico.");
      }
    } catch (err: any) {
      console.log("[Self-Healing] Storage upload failed. Falling back to robust Base64 database injection using lightweight compressed image...", err);
      
      // 3. Fallback: use the already compressed base64 image (typically under 100KB)
      try {
        // Re-compress if not already compressed, but we already have `base64` from compressImage!
        let compactBase64 = "";
        try {
          const compressed = await compressImage(file, 1000, 1000, 0.6); // Extra aggressive fallback compression
          compactBase64 = compressed.base64;
        } catch (compErr) {
          console.warn("[Self-Healing] Failed aggressive compression fallback, using standard compressed version", compErr);
          const { base64: standardBase64 } = await compressImage(file, 1200, 1200, 0.7);
          compactBase64 = standardBase64;
        }

        setInputHeroUrl(compactBase64);
        toast.success(
          <div className="space-y-1">
            <p className="font-bold text-emerald-600">Caricamento completato (Modalità Fallback)</p>
            <p className="text-xs text-slate-600">
              Immagine ottimizzata e memorizzata direttamente in modalità Base64. Non scadrà mai e non dipende dalle policy del bucket!
            </p>
          </div>,
          { duration: 6000 }
        );
      } catch (fallbackErr) {
        console.error("Critical: Base64 conversion/compression failed", fallbackErr);
        toast.error("Impossibile convertire o caricare l'immagine. Riprova.");
      }
    } finally {
      setHeroFileLoading(false);
    }
  };

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setHeroSaveLoading(true);
      
      // Save exchange rates
      setBankRate(Number(inputBankRate));
      setBkashMoneyRate(Number(inputBkashRate));
      setPinRate(Number(inputPinRate));
      
      // Save hero settings
      await updateHeroSettings({
        store_image_url: inputHeroUrl,
        title: inputHeroTitle,
        subtitle: inputHeroSubtitle
      });
      toast.success("Impostazioni Generali e Tassi di Cambio salvati con successo!");
    } catch (err) {
      console.error(err);
      toast.error("Errore durante il salvataggio delle impostazioni.");
    } finally {
      setHeroSaveLoading(false);
    }
  };

  // Simple form states
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerLogo, setNewPartnerLogo] = useState("");
  const [category, setCategory] = useState<"money" | "sim">("money");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const activeList = category === "money" ? tickerMoney : tickerSim;
  const isLimitReached = (activeList || []).length >= 10;

  const processFile = (file: File) => {
    // Limit to 250KB to preserve localStorage quota
    if (file.size > 250000) {
      setFileError("File troppo grande. Seleziona un'immagine inferiore a 250KB.");
      toast.error("Immagine troppo grande! Massimo 250KB");
      return;
    }

    setFileError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPartnerLogo(reader.result as string);
      toast.success("Immagine caricata e pronta!");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem("wealink_admin_authenticated", "true");
      setPassError("");
      toast.success("Accesso eseguito con successo!");
    } else {
      setPassError("Password errata. Riprova.");
      toast.error("Password errata!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("wealink_admin_authenticated");
    toast.info("Sessione terminata.");
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      toast.error("Limite massimo di 10 loghi raggiunto per questa categoria!");
      return;
    }
    if (!newPartnerName.trim()) {
      toast.error("Inserisci il nome del partner");
      return;
    }
    if (!newPartnerLogo) {
      toast.error("Carica un file logo");
      return;
    }

    const newLogo = {
      id: "logo_" + Date.now(),
      name: newPartnerName.trim(),
      url: newPartnerLogo,
      logo: newPartnerLogo
    };

    if (category === "money") {
      setTickerMoney([...tickerMoney, newLogo]);
    } else if (category === "sim") {
      setTickerSim([...tickerSim, newLogo]);
    } else {
      setPartners([...partners, newLogo]);
    }

    // Reset form
    setNewPartnerName("");
    setNewPartnerLogo("");
    toast.success("Logo aggiunto permanentemente al ticker!");
  };

  const handleDeletePartner = (id: string, categoryType: "money" | "sim" | "partners", name: string) => {
    if (categoryType === "money") {
      setTickerMoney(tickerMoney.filter((p) => p.id !== id));
    } else if (categoryType === "sim") {
      setTickerSim(tickerSim.filter((p) => p.id !== id));
    } else {
      setPartners(partners.filter((p) => p.id !== id));
    }
    toast.success(`Logo "${name}" eliminato.`);
  };

  // Hero Carousel Slides handlers
  const handleNewSlideFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewSlideValidationError("");

    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = "Formato non valido! Puoi caricare solo immagini (JPG, PNG, WEBP).";
      setNewSlideValidationError(errorMsg);
      toast.error(errorMsg);
      e.target.value = "";
      return;
    }

    if (file.size > 2000000) {
      const errorMsg = "File troppo pesante! Massimo 2MB per garantire la velocità della pagina.";
      setNewSlideValidationError(errorMsg);
      toast.error(errorMsg);
      e.target.value = "";
      return;
    }

    setNewSlideFileLoading(true);

    try {
      console.log("[Self-Healing] Compressing hero slide image...");
      const { blob, base64 } = await compressImage(file, 1200, 800, 0.7);
      setNewSlideImage(base64);
      toast.success("Immagine slide caricata ed ottimizzata con successo!");
    } catch (err) {
      console.error(err);
      toast.error("Errore nel caricamento del file.");
    } finally {
      setNewSlideFileLoading(false);
    }
  };

  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSlides.length >= 10) {
      toast.error("Limite massimo di 10 slide raggiunto!");
      return;
    }
    if (!newSlideImage) {
      toast.error("Carica o seleziona un'immagine per la slide!");
      return;
    }

    const newSlide = {
      id: "slide_" + Date.now(),
      url: newSlideImage,
      title: newSlideTitle.trim() || "Nuovo Servizio Wealink",
      subtitle: newSlideSubtitle.trim() || "Scopri i nostri servizi in sede"
    };

    setHeroSlides([...heroSlides, newSlide]);
    setNewSlideTitle("");
    setNewSlideSubtitle("");
    setNewSlideImage("");
    toast.success("Nuova slide aggiunta con successo al carosello!");
  };

  const handleDeleteSlide = (id: string) => {
    if (heroSlides.length <= 1) {
      toast.error("Devi mantenere almeno una slide nel carosello!");
      return;
    }
    setHeroSlides(heroSlides.filter(s => s.id !== id));
    toast.success("Slide rimossa correttamente.");
  };

  // Onboarding Slides Management Helpers
  const handleNewOnboardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewOnboardFileLoading(true);
    try {
      console.log("[Self-Healing] Compressing onboarding slide image...");
      const { blob, base64 } = await compressImage(file, 1200, 800, 0.7);
      setNewOnboardImage(base64);
      toast.success("Immagine slide caricata ed ottimizzata con successo!");
    } catch (err) {
      console.error(err);
      toast.error("Errore nel caricamento del file.");
    } finally {
      setNewOnboardFileLoading(false);
    }
  };

  const handleAutoTranslateNew = async () => {
    // Find whichever field has text to translate from
    const sourceTitle = newOnboardTitleIt.trim() || newOnboardTitleEn.trim();
    const sourceSubtitle = newOnboardSubtitleIt.trim() || newOnboardSubtitleEn.trim();

    if (!sourceTitle && !sourceSubtitle) {
      toast.error("Inserisci prima il Titolo o la Descrizione in Italiano o Inglese!");
      return;
    }

    setIsTranslatingNew(true);
    const translationToast = toast.loading("Traduzione automatica in corso...");

    try {
      // Determine source language
      const sourceLang = newOnboardTitleIt.trim() ? "it" : "en";

      if (sourceTitle) {
        const [itT, enT, bnT, urT] = await Promise.all([
          sourceLang === "it" ? sourceTitle : translateText(sourceTitle, "it", sourceLang),
          sourceLang === "en" ? sourceTitle : translateText(sourceTitle, "en", sourceLang),
          translateText(sourceTitle, "bn", sourceLang),
          translateText(sourceTitle, "ur", sourceLang)
        ]);
        if (itT) setNewOnboardTitleIt(itT);
        if (enT) setNewOnboardTitleEn(enT);
        if (bnT) setNewOnboardTitleBn(bnT);
        if (urT) setNewOnboardTitleUr(urT);
      }

      if (sourceSubtitle) {
        const [itS, enS, bnS, urS] = await Promise.all([
          sourceLang === "it" ? sourceSubtitle : translateText(sourceSubtitle, "it", sourceLang),
          sourceLang === "en" ? sourceSubtitle : translateText(sourceSubtitle, "en", sourceLang),
          translateText(sourceSubtitle, "bn", sourceLang),
          translateText(sourceSubtitle, "ur", sourceLang)
        ]);
        if (itS) setNewOnboardSubtitleIt(itS);
        if (enS) setNewOnboardSubtitleEn(enS);
        if (bnS) setNewOnboardSubtitleBn(bnS);
        if (urS) setNewOnboardSubtitleUr(urS);
      }

      toast.success("Testi tradotti con successo!", { id: translationToast });
    } catch (err) {
      console.error(err);
      toast.error("Errore durante la traduzione automatica.", { id: translationToast });
    } finally {
      setIsTranslatingNew(false);
    }
  };

  const handleAutoTranslateEdit = async () => {
    const sourceTitle = editingTitleIt.trim() || editingTitleEn.trim();
    const sourceSubtitle = editingSubtitleIt.trim() || editingSubtitleEn.trim();

    if (!sourceTitle && !sourceSubtitle) {
      toast.error("Inserisci prima il Titolo o la Descrizione in Italiano o Inglese!");
      return;
    }

    setIsTranslatingEdit(true);
    const translationToast = toast.loading("Traduzione automatica in corso...");

    try {
      const sourceLang = editingTitleIt.trim() ? "it" : "en";

      if (sourceTitle) {
        const [itT, enT, bnT, urT] = await Promise.all([
          sourceLang === "it" ? sourceTitle : translateText(sourceTitle, "it", sourceLang),
          sourceLang === "en" ? sourceTitle : translateText(sourceTitle, "en", sourceLang),
          translateText(sourceTitle, "bn", sourceLang),
          translateText(sourceTitle, "ur", sourceLang)
        ]);
        if (itT) setEditingTitleIt(itT);
        if (enT) setEditingTitleEn(enT);
        if (bnT) setEditingTitleBn(bnT);
        if (urT) setEditingTitleUr(urT);
      }

      if (sourceSubtitle) {
        const [itS, enS, bnS, urS] = await Promise.all([
          sourceLang === "it" ? sourceSubtitle : translateText(sourceSubtitle, "it", sourceLang),
          sourceLang === "en" ? sourceSubtitle : translateText(sourceSubtitle, "en", sourceLang),
          translateText(sourceSubtitle, "bn", sourceLang),
          translateText(sourceSubtitle, "ur", sourceLang)
        ]);
        if (itS) setEditingSubtitleIt(itS);
        if (enS) setEditingSubtitleEn(enS);
        if (bnS) setEditingSubtitleBn(bnS);
        if (urS) setEditingSubtitleUr(urS);
      }

      toast.success("Testi tradotti con successo!", { id: translationToast });
    } catch (err) {
      console.error(err);
      toast.error("Errore durante la traduzione automatica.", { id: translationToast });
    } finally {
      setIsTranslatingEdit(false);
    }
  };

  const handleAddOnboardSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardingSlides.length >= 10) {
      toast.error("Limite massimo di 10 banner raggiunto!");
      return;
    }
    if (!newOnboardImage) {
      toast.error("Carica o inserisci un'immagine per il banner!");
      return;
    }

    // Determine the source text
    let tIt = newOnboardTitleIt.trim();
    let tEn = newOnboardTitleEn.trim();
    let tBn = newOnboardTitleBn.trim();
    let tUr = newOnboardTitleUr.trim();

    let sIt = newOnboardSubtitleIt.trim();
    let sEn = newOnboardSubtitleEn.trim();
    let sBn = newOnboardSubtitleBn.trim();
    let sUr = newOnboardSubtitleUr.trim();

    const sourceTitle = tIt || tEn;
    const sourceSubtitle = sIt || sEn;

    if (!sourceTitle) {
      toast.error("Il Titolo in Italiano o Inglese è obbligatorio!");
      return;
    }

    const sourceLang = tIt ? "it" : "en";

    // Auto-translation upon submission for any blank fields
    if (!tIt || !tEn || !tBn || !tUr || !sIt || !sEn || !sBn || !sUr) {
      const translationToast = toast.loading("Completamento automatico delle traduzioni mancanti...");
      try {
        if (!tIt) tIt = await translateText(sourceTitle, "it", sourceLang) || sourceTitle;
        if (!tEn) tEn = await translateText(sourceTitle, "en", sourceLang) || sourceTitle;
        if (!tBn) tBn = await translateText(sourceTitle, "bn", sourceLang) || sourceTitle;
        if (!tUr) tUr = await translateText(sourceTitle, "ur", sourceLang) || sourceTitle;

        const defaultSub = sourceSubtitle || "Wealink Transfer";
        if (!sIt) sIt = await translateText(defaultSub, "it", sourceLang) || defaultSub;
        if (!sEn) sEn = await translateText(defaultSub, "en", sourceLang) || defaultSub;
        if (!sBn) sBn = await translateText(defaultSub, "bn", sourceLang) || defaultSub;
        if (!sUr) sUr = await translateText(defaultSub, "ur", sourceLang) || defaultSub;

        toast.dismiss(translationToast);
      } catch (err) {
        console.error("Auto-translation on save failed:", err);
        toast.error("Errore nell'auto-traduzione di salvataggio, verranno usati i testi base.", { id: translationToast });
        tIt = tIt || sourceTitle;
        tEn = tEn || sourceTitle;
        tBn = tBn || sourceTitle;
        tUr = tUr || sourceTitle;
        sIt = sIt || sourceSubtitle || tIt;
        sEn = sEn || sourceSubtitle || tEn;
        sBn = sBn || sourceSubtitle || tBn;
        sUr = sUr || sourceSubtitle || tUr;
      }
    }

    const newSlide = {
      id: "onboard_" + Date.now(),
      url: newOnboardImage,
      title: tIt,
      subtitle: sIt,
      titles: {
        it: tIt,
        en: tEn,
        bn: tBn,
        ur: tUr
      },
      subtitles: {
        it: sIt,
        en: sEn,
        bn: sBn,
        ur: sUr
      }
    };

    setOnboardingSlides([...onboardingSlides, newSlide]);

    // Reset fields
    setNewOnboardTitleIt("");
    setNewOnboardTitleEn("");
    setNewOnboardTitleBn("");
    setNewOnboardTitleUr("");
    setNewOnboardSubtitleIt("");
    setNewOnboardSubtitleEn("");
    setNewOnboardSubtitleBn("");
    setNewOnboardSubtitleUr("");
    setNewOnboardImage("");
    toast.success("Nuovo banner onboarding aggiunto con successo!");
  };

  const handleDeleteOnboardSlide = (id: string) => {
    if (onboardingSlides.length <= 1) {
      toast.error("Devi mantenere almeno un banner nell'onboarding!");
      return;
    }
    setOnboardingSlides(onboardingSlides.filter(s => s.id !== id));
    toast.success("Banner rimosso correttamente.");
    if (editingSlideId === id) {
      setEditingSlideId(null);
    }
  };

  const handleStartEditOnboardSlide = (slide: any) => {
    setEditingSlideId(slide.id);
    setEditingTitleIt(slide.titles?.it || slide.title || "");
    setEditingTitleEn(slide.titles?.en || slide.title || "");
    setEditingTitleBn(slide.titles?.bn || slide.title || "");
    setEditingTitleUr(slide.titles?.ur || slide.title || "");

    setEditingSubtitleIt(slide.subtitles?.it || slide.subtitle || "");
    setEditingSubtitleEn(slide.subtitles?.en || slide.subtitle || "");
    setEditingSubtitleBn(slide.subtitles?.bn || slide.subtitle || "");
    setEditingSubtitleUr(slide.subtitles?.ur || slide.subtitle || "");
  };

  const handleSaveOnboardSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlideId) return;

    let tIt = editingTitleIt.trim();
    let tEn = editingTitleEn.trim();
    let tBn = editingTitleBn.trim();
    let tUr = editingTitleUr.trim();

    let sIt = editingSubtitleIt.trim();
    let sEn = editingSubtitleEn.trim();
    let sBn = editingSubtitleBn.trim();
    let sUr = editingSubtitleUr.trim();

    const sourceTitle = tIt || tEn;
    const sourceSubtitle = sIt || sEn;

    if (!sourceTitle) {
      toast.error("Il Titolo in Italiano o Inglese è obbligatorio!");
      return;
    }

    const sourceLang = tIt ? "it" : "en";

    // Auto-translation upon submission for any blank fields
    if (!tIt || !tEn || !tBn || !tUr || !sIt || !sEn || !sBn || !sUr) {
      const translationToast = toast.loading("Completamento automatico delle traduzioni mancanti...");
      try {
        if (!tIt) tIt = await translateText(sourceTitle, "it", sourceLang) || sourceTitle;
        if (!tEn) tEn = await translateText(sourceTitle, "en", sourceLang) || sourceTitle;
        if (!tBn) tBn = await translateText(sourceTitle, "bn", sourceLang) || sourceTitle;
        if (!tUr) tUr = await translateText(sourceTitle, "ur", sourceLang) || sourceTitle;

        const defaultSub = sourceSubtitle || "Wealink Transfer";
        if (!sIt) sIt = await translateText(defaultSub, "it", sourceLang) || defaultSub;
        if (!sEn) sEn = await translateText(defaultSub, "en", sourceLang) || defaultSub;
        if (!sBn) sBn = await translateText(defaultSub, "bn", sourceLang) || defaultSub;
        if (!sUr) sUr = await translateText(defaultSub, "ur", sourceLang) || defaultSub;

        toast.dismiss(translationToast);
      } catch (err) {
        console.error("Auto-translation on save failed:", err);
        toast.error("Errore nell'auto-traduzione di salvataggio, verranno usati i testi base.", { id: translationToast });
        tIt = tIt || sourceTitle;
        tEn = tEn || sourceTitle;
        tBn = tBn || sourceTitle;
        tUr = tUr || sourceTitle;
        sIt = sIt || sourceSubtitle || tIt;
        sEn = sEn || sourceSubtitle || tEn;
        sBn = sBn || sourceSubtitle || tBn;
        sUr = sUr || sourceSubtitle || tUr;
      }
    }

    const updatedSlides = onboardingSlides.map(s => {
      if (s.id === editingSlideId) {
        return {
          ...s,
          title: tIt,
          subtitle: sIt,
          titles: {
            it: tIt,
            en: tEn,
            bn: tBn,
            ur: tUr
          },
          subtitles: {
            it: sIt,
            en: sEn,
            bn: sBn,
            ur: sUr
          }
        };
      }
      return s;
    });

    setOnboardingSlides(updatedSlides);
    setEditingSlideId(null);
    toast.success("Modifiche salvate con successo!");
  };

  const handleMoveOnboardSlideUp = (index: number) => {
    if (index === 0) return;
    const updated = [...onboardingSlides];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setOnboardingSlides(updated);
    toast.success("Ordine aggiornato!");
  };

  const handleMoveOnboardSlideDown = (index: number) => {
    if (index === onboardingSlides.length - 1) return;
    const updated = [...onboardingSlides];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setOnboardingSlides(updated);
    toast.success("Ordine aggiornato!");
  };

  if (!isAuthenticated) {
    return (
      <div id="admin-login-container" className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-sans font-extrabold text-2xl text-slate-900 tracking-tight">
              Pannello Admin
            </h1>
            <p className="text-sm text-slate-500">
              Inserisci la password per gestire i loghi del ticker in tempo reale.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                placeholder="Password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-sans focus:border-black focus:bg-white focus:outline-none transition-all duration-150"
                required
              />
              {passError && (
                <p className="text-red-500 text-xs font-medium mt-1">{passError}</p>
              )}
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              className="w-full bg-black hover:bg-slate-800 text-white font-sans font-bold py-4 rounded-2xl transition-all duration-150 shadow-md active:scale-[0.98]"
            >
              Accedi
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Torna alla Home
            </Link>
          </div>

          <div className="text-center pt-4 border-t border-slate-100/80">
            <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
              Versione Applicazione: v{APP_VERSION}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-panel-container" className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Simplified Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-black text-2xl text-slate-900 tracking-tight">
                Pannello di Controllo Wealink
              </h1>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-200">
                v{APP_VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gestisci l'applicazione, le immagini di sfondo, i loghi scorrevoli dei partner e il CRM dei clienti registrati.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl transition-all"
            >
              Esci
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-black hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Torna alla Home
            </Link>
          </div>
        </div>

        {/* Tab switch navigation bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 bg-white border border-slate-100 p-1.5 rounded-2xl gap-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'general' ? 'bg-[#004D40] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Generale & Tassi
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'hero' ? 'bg-[#004D40] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Hero Home
          </button>
          <button
            onClick={() => setActiveTab('tickers')}
            className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'tickers' ? 'bg-[#004D40] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            Gestione Tickers
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'onboarding' ? 'bg-[#004D40] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Gestione Onboarding
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'clients' ? 'bg-[#004D40] text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Clienti CRM
          </button>
        </div>

        {activeTab === 'general' ? (
          <>
            {/* Configurazione Generale e Tassi di Cambio */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h2 className="font-sans font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#004D40]" />
                  Configurazione Generale & Tassi di Cambio
                </h2>
                <span className="text-xs font-bold text-[#004D40] bg-[#E6F4F1] px-2.5 py-1 rounded-full border border-teal-500/10">
                  Database & LocalStorage Synced
                </span>
              </div>

              <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
                
                {/* Exchange Rates inputs */}
                <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl space-y-4">
                  <h3 className="font-sans font-extrabold text-xs text-[#004D40] uppercase tracking-wider block border-b border-slate-200/50 pb-2">
                    Tassi di Cambio Attivi (Oggi)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* bKash Rate Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                        Tasso bKash (৳)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={inputBkashRate}
                        onChange={(e) => setInputBkashRate(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold shadow-sm"
                      />
                    </div>
                    {/* Bank Account Rate Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                        Tasso Bank Account (৳)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={inputBankRate}
                        onChange={(e) => setInputBankRate(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold shadow-sm"
                      />
                    </div>
                    {/* PIN/Nagad Rate Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                        Tasso PIN Number (৳)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={inputPinRate}
                        onChange={(e) => setInputPinRate(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={heroSaveLoading}
                    className="bg-[#004D40] hover:bg-[#00332a] text-white font-sans font-bold py-3 px-6 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-sm active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                  >
                    {heroSaveLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Salva Tassi di Cambio
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : activeTab === 'tickers' ? (
          <>

        {/* Upload Container - Highly Clean Layout */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <h2 className="font-sans font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload className="w-5 h-5 text-black" />
            Carica un Nuovo Logo
          </h2>

          <form onSubmit={handleAddPartner} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category Dropdown Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  1. Scegli Categoria Ticker
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </span>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as "money" | "sim");
                      setFileError("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-10 text-sm font-sans focus:border-[#004D40] focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer font-semibold"
                  >
                    <option value="money">Money Transfer</option>
                    <option value="sim">Sim Card</option>
                  </select>
                </div>
              </div>

              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  2. Nome del Partner / Brand
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <HelpCircle className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Es: Vodafone, bKash, TIM..."
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 pl-10 text-sm font-sans focus:border-black focus:bg-white focus:outline-none transition-all font-semibold"
                    required
                  />
                </div>
              </div>

            </div>

            {/* Massive Drag-and-drop or select button */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                3. Seleziona o Trascina l'Immagine
              </label>

              {newPartnerLogo ? (
                <div className="relative border-2 border-slate-200 bg-emerald-50/25 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="bg-white border border-slate-200/60 rounded-xl p-3 max-h-24 max-w-xs flex items-center justify-center shadow-sm overflow-hidden">
                    <img 
                      src={newPartnerLogo} 
                      alt="Anteprima" 
                      className="max-h-16 max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPartnerLogo("")}
                      className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors bg-white border border-red-200 py-1.5 px-3 rounded-lg"
                    >
                      Sostituisci Logo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-picker-btn")?.click()}
                  className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragging ? "border-black bg-slate-50" : "border-slate-300 hover:border-black hover:bg-slate-50"
                  }`}
                >
                  <Upload className="w-10 h-10 mb-3 text-slate-400 group-hover:text-black transition-transform duration-200 group-hover:-translate-y-0.5" />
                  
                  <span className="text-sm font-bold text-slate-800">
                    Scegli il file dal computer o trascinalo qui
                  </span>
                  
                  <span className="text-xs text-slate-400 mt-1">
                    PNG o SVG con sfondo trasparente consigliato (Fino a 250KB)
                  </span>

                  <input
                    id="file-picker-btn"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {fileError && (
                <p className="text-red-600 text-xs font-semibold mt-1">{fileError}</p>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={!newPartnerName.trim() || !newPartnerLogo || isLimitReached}
              className="w-full bg-black hover:bg-slate-800 text-white font-sans font-bold py-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Plus className="w-5 h-5" />
              Carica Logo Dinamico
            </button>
          </form>
        </div>

        {/* Current Logos List divided clearly by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Money Transfer Category List */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sans font-black text-base text-slate-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#004D40]"></span>
                Money Transfer Ticker
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                {tickerMoney.length} / 10
              </span>
            </div>

            {tickerMoney.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-150 rounded-2xl">
                Nessun logo caricato per Money Transfer.
              </p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {tickerMoney.map((logo) => (
                  <div
                    key={logo.id}
                    className="flex items-center justify-between gap-3 p-2 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-9 bg-white border border-slate-200/60 rounded-lg flex items-center justify-center p-1 overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={logo.url || (logo as any).logo}
                          alt={logo.name}
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">{logo.name}</p>
                    </div>

                    <button
                      onClick={() => handleDeletePartner(logo.id, "money", logo.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-bold mr-1"
                      title="Elimina logo"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Elimina</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sim Card Category List */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sans font-black text-base text-slate-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Sim Card Ticker
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
                {tickerSim.length} / 10
              </span>
            </div>

            {tickerSim.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-150 rounded-2xl">
                Nessun logo caricato per Sim Card.
              </p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {tickerSim.map((logo) => (
                  <div
                    key={logo.id}
                    className="flex items-center justify-between gap-3 p-2 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-9 bg-white border border-slate-200/60 rounded-lg flex items-center justify-center p-1 overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={logo.url || (logo as any).logo}
                          alt={logo.name}
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">{logo.name}</p>
                    </div>

                    <button
                      onClick={() => handleDeletePartner(logo.id, "sim", logo.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-bold mr-1"
                      title="Elimina logo"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Elimina</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
          </>
        ) : activeTab === 'hero' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* NEW SECTION: "Carica Hero della Home" (Home Hero Upload) */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="font-sans font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#004D40]" />
                  Carica Hero della Home
                </h2>
                <span className="text-xs font-bold text-white bg-[#004D40] px-3 py-1 rounded-full">
                  {heroSlides.length} / 10 Slide Attive
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Carica, modifica o elimina le immagini del carosello della schermata Home. Puoi impostare un titolo e un sottotitolo personalizzato per ogni singola slide che scorrerà automaticamente.
              </p>

              {/* Form to Add New Slide */}
              <form onSubmit={handleAddSlide} className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#004D40]" />
                  Aggiungi Nuova Slide (Max 10)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                      Titolo Slide
                    </label>
                    <input
                      type="text"
                      value={newSlideTitle}
                      onChange={(e) => setNewSlideTitle(e.target.value)}
                      placeholder="Es: Ricariche Internazionali Veloci"
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold"
                    />
                  </div>

                  {/* Subtitle Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                      Sottotitolo Slide
                    </label>
                    <input
                      type="text"
                      value={newSlideSubtitle}
                      onChange={(e) => setNewSlideSubtitle(e.target.value)}
                      placeholder="Es: Invia ricariche in oltre 120 paesi in pochi istanti"
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Drag and Drop or Paste Image Input */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Immagine Slide
                  </label>

                  {newSlideImage ? (
                    <div className="relative border border-dashed border-emerald-350 bg-emerald-50/20 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                      <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={newSlideImage}
                          alt="Anteprima slide"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewSlideImage("")}
                        className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors bg-white border border-red-150 py-1.5 px-3 rounded-lg shadow-xs"
                      >
                        Sostituisci Immagine
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={newSlideImage}
                          onChange={(e) => setNewSlideImage(e.target.value)}
                          placeholder="Incolla l'URL dell'immagine..."
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="new-slide-picker"
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleNewSlideFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={newSlideFileLoading}
                          onClick={() => document.getElementById("new-slide-picker")?.click()}
                          className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                        >
                          {newSlideFileLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          Sfoglia File
                        </button>
                      </div>
                    </div>
                  )}
                  {newSlideValidationError && (
                    <p className="text-xs font-semibold text-red-600 animate-pulse">{newSlideValidationError}</p>
                  )}
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={heroSlides.length >= 10 || !newSlideImage || newSlideFileLoading}
                    className="bg-[#004D40] hover:bg-[#00332a] text-white font-sans font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Aggiungi Slide
                  </button>
                </div>
              </form>

              {/* Slider Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Slide Attive nel Carosello Home</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
                    >
                      {/* Image Frame */}
                      <div className="relative h-32 bg-slate-100 overflow-hidden">
                        <img
                          src={slide.url}
                          alt={slide.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                          Slide #{index + 1}
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{slide.title}</h4>
                          <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{slide.subtitle}</p>
                        </div>

                        {/* Delete trigger */}
                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-[#004D40] bg-[#004D40]/5 px-2 py-0.5 rounded-md font-mono">
                            ATTIVA
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(slide.id)}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-bold hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Elimina
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add slide placeholder slot */}
                  {heroSlides.length < 10 && (
                    <div
                      onClick={() => {
                        window.scrollTo({ top: 300, behavior: "smooth" });
                        toast.info("Usa il modulo di inserimento sopra per caricare l'immagine!");
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-[#004D40] hover:bg-[#004D40]/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 h-[216px] group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#004D40] transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">Aggiungi Slide</span>
                      <span className="text-[10px] text-slate-400">Rimangono {10 - heroSlides.length} slot liberi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'onboarding' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* NEW SECTION: "Gestione Onboarding" */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="font-sans font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#004D40]" />
                  Gestione Onboarding
                </h2>
                <span className="text-xs font-bold text-white bg-[#004D40] px-3 py-1 rounded-full">
                  {onboardingSlides.length} / 10 Banner Attivi
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Carica, modifica o elimina i banner dello slider dell'Onboarding (Pagina 3). Per ogni banner, puoi definire un titolo ed una descrizione tradotti in tutte e 4 le lingue supportate (Italiano, English, Bengali, Urdu).
              </p>

              {/* Form to Add New Onboarding Banner */}
              <form onSubmit={handleAddOnboardSlide} className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#004D40]" />
                    Aggiungi Nuovo Banner (Max 10)
                  </h3>

                  <button
                    type="button"
                    disabled={isTranslatingNew || (!newOnboardTitleIt.trim() && !newOnboardTitleEn.trim() && !newOnboardSubtitleIt.trim() && !newOnboardSubtitleEn.trim())}
                    onClick={handleAutoTranslateNew}
                    className="bg-[#004D40] hover:bg-[#00332a] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-end sm:self-auto active:scale-[0.98]"
                    title="Traduci istantaneamente nelle altre lingue"
                  >
                    {isTranslatingNew ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Traduzione in corso...
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        ✨ Traduci in Automatico
                      </>
                    )}
                  </button>
                </div>

                {/* Auto-Translation Info Helper Panel */}
                <div className="bg-[#004D40]/5 rounded-xl p-3 border border-[#004D40]/10 text-xs text-slate-700 flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-[#004D40] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-extrabold text-[#004D40]">💡 Suggerimento:</span> Inserisci il Titolo e la Descrizione in una sola lingua (es. Italiano o Inglese). Puoi cliccare su <strong>"Traduci in Automatico"</strong> in alto a destra per compilare e rivedere istantaneamente le traduzioni delle altre lingue, oppure lascia semplicemente i campi vuoti e il sistema li tradurrà automaticamente al momento del salvataggio!
                  </div>
                </div>

                {/* Multilingual Titles Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Titoli Multilingua</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Italiano Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        🇮🇹 Italiano (Principale)
                      </label>
                      <input
                        type="text"
                        value={newOnboardTitleIt}
                        onChange={(e) => setNewOnboardTitleIt(e.target.value)}
                        placeholder="Es: Wealink Money Transfer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold"
                        required={!newOnboardTitleEn}
                      />
                    </div>

                    {/* English Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        🇬🇧 English
                      </label>
                      <input
                        type="text"
                        value={newOnboardTitleEn}
                        onChange={(e) => setNewOnboardTitleEn(e.target.value)}
                        placeholder="Es: Wealink Money Transfer"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold"
                        required={!newOnboardTitleIt}
                      />
                    </div>

                    {/* Bengali Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        🇧🇩 Bengali (বাংলা) <span className="text-[9px] text-[#004D40] lowercase font-normal">(Auto-generato)</span>
                      </label>
                      <input
                        type="text"
                        value={newOnboardTitleBn}
                        onChange={(e) => setNewOnboardTitleBn(e.target.value)}
                        placeholder="Lascia vuoto per auto-tradurre..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold bg-slate-50/30"
                      />
                    </div>

                    {/* Pakistani Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        🇵🇰 Urdu (اردو) <span className="text-[9px] text-[#004D40] lowercase font-normal">(Auto-generato)</span>
                      </label>
                      <input
                        type="text"
                        value={newOnboardTitleUr}
                        onChange={(e) => setNewOnboardTitleUr(e.target.value)}
                        placeholder="Lascia vuoto per auto-tradurre..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold bg-slate-50/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Multilingual Subtitles Grid */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Descrizioni Multilingua</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Italiano Subtitle */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">🇮🇹 Italiano (Principale)</label>
                      <textarea
                        value={newOnboardSubtitleIt}
                        onChange={(e) => setNewOnboardSubtitleIt(e.target.value)}
                        placeholder="Es: Invia denaro in Bangladesh e Pakistan con le migliori tariffe garantite."
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold resize-none"
                      />
                    </div>

                    {/* English Subtitle */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">🇬🇧 English</label>
                      <textarea
                        value={newOnboardSubtitleEn}
                        onChange={(e) => setNewOnboardSubtitleEn(e.target.value)}
                        placeholder="Es: Send money to Bangladesh and Pakistan with the best rates guaranteed."
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold resize-none"
                      />
                    </div>

                    {/* Bengali Subtitle */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">🇧🇩 Bengali (বাংলা) <span className="text-[9px] text-[#004D40] lowercase font-normal">(Auto-generato)</span></label>
                      <textarea
                        value={newOnboardSubtitleBn}
                        onChange={(e) => setNewOnboardSubtitleBn(e.target.value)}
                        placeholder="Lascia vuoto per auto-tradurre..."
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold resize-none bg-slate-50/30"
                      />
                    </div>

                    {/* Urdu Subtitle */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">🇵🇰 Urdu (اردو) <span className="text-[9px] text-[#004D40] lowercase font-normal">(Auto-generato)</span></label>
                      <textarea
                        value={newOnboardSubtitleUr}
                        onChange={(e) => setNewOnboardSubtitleUr(e.target.value)}
                        placeholder="Lascia vuoto per auto-tradurre..."
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold resize-none bg-slate-50/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Image Input with upload option */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Immagine Banner
                  </label>

                  {newOnboardImage ? (
                    <div className="relative border border-dashed border-emerald-300 bg-emerald-50/10 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                      <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={newOnboardImage}
                          alt="Anteprima banner"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewOnboardImage("")}
                        className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors bg-white border border-red-200 py-1.5 px-3 rounded-lg shadow-sm"
                      >
                        Sostituisci Immagine
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={newOnboardImage}
                          onChange={(e) => setNewOnboardImage(e.target.value)}
                          placeholder="Incolla l'URL dell'immagine..."
                          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-sans focus:border-[#004D40] focus:outline-none transition-all font-semibold"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="new-onboard-picker"
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleNewOnboardFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={newOnboardFileLoading}
                          onClick={() => document.getElementById("new-onboard-picker")?.click()}
                          className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                        >
                          {newOnboardFileLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-slate-600" />
                          )}
                          Sfoglia File
                        </button>
                      </div>
                    </div>
                  )}
                  {newOnboardValidationError && (
                    <p className="text-xs font-semibold text-red-600 animate-pulse">{newOnboardValidationError}</p>
                  )}
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={onboardingSlides.length >= 10 || !newOnboardImage || newOnboardFileLoading}
                    className="bg-[#004D40] hover:bg-[#00332a] text-white font-sans font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Aggiungi Banner Onboarding
                  </button>
                </div>
              </form>

              {/* Active Banner Control List (with inline editing / reordering) */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#004D40]" />
                  Lista dei Banner Caricati
                </h3>

                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse font-sans text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold text-xs uppercase tracking-wider">
                        <th className="p-4 w-16">Preview</th>
                        <th className="p-4">Titolo / Sottotitolo (Italiano)</th>
                        <th className="p-4">Traduzioni Attive</th>
                        <th className="p-4 text-right w-44">Azioni & Ordine</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {onboardingSlides.map((slide, index) => {
                        const hasIt = !!(slide.titles?.it || slide.title);
                        const hasEn = !!(slide.titles?.en);
                        const hasBn = !!(slide.titles?.bn);
                        const hasUr = !!(slide.titles?.ur);

                        return (
                          <React.Fragment key={slide.id}>
                            <tr className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                                  <img
                                    src={slide.url}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="max-w-md">
                                  <div className="font-extrabold text-slate-900 line-clamp-1">
                                    {slide.titles?.it || slide.title || "Wealink Transfer"}
                                  </div>
                                  <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                    {slide.subtitles?.it || slide.subtitle || "Invia denaro in tutto il mondo."}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-1">
                                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${hasIt ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                    IT
                                  </span>
                                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${hasEn ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                    EN
                                  </span>
                                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${hasBn ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                    BN
                                  </span>
                                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${hasUr ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                    UR
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {/* Up Arrow */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOnboardSlideUp(index)}
                                    disabled={index === 0}
                                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                                    title="Sposta Su"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Down Arrow */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveOnboardSlideDown(index)}
                                    disabled={index === onboardingSlides.length - 1}
                                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                                    title="Sposta Giù"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditOnboardSlide(slide)}
                                    className="p-1.5 rounded-lg bg-[#004D40]/5 text-[#004D40] hover:bg-[#004D40]/10 transition-colors cursor-pointer"
                                    title="Modifica Traduzioni"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOnboardSlide(slide.id)}
                                    disabled={onboardingSlides.length <= 1}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-30 transition-colors cursor-pointer"
                                    title="Elimina"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {editingSlideId === slide.id && (
                              <tr>
                                <td colSpan={4} className="bg-[#004D40]/5 p-5 animate-in slide-in-from-top-2 duration-150">
                                  <form onSubmit={handleSaveOnboardSlide} className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-[#004D40]/10 pb-2">
                                      <h4 className="text-xs font-extrabold text-[#004D40] uppercase flex items-center gap-1.5">
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Modifica Traduzioni Banner
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={() => setEditingSlideId(null)}
                                        className="text-xs font-bold text-slate-500 hover:text-slate-800"
                                      >
                                        Annulla
                                      </button>
                                    </div>

                                    {/* Edit Auto-Translation trigger */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 rounded-xl p-3 border border-[#004D40]/10 text-xs">
                                      <div className="text-[11px] text-slate-700 flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5 text-[#004D40] flex-shrink-0 animate-pulse" />
                                        <span>Modifica solo Italiano (o Inglese) e clicca per rigenerare le altre lingue:</span>
                                      </div>
                                      <button
                                        type="button"
                                        disabled={isTranslatingEdit || (!editingTitleIt.trim() && !editingTitleEn.trim() && !editingSubtitleIt.trim() && !editingSubtitleEn.trim())}
                                        onClick={handleAutoTranslateEdit}
                                        className="bg-[#004D40] hover:bg-[#00332a] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all flex items-center gap-1.5 self-end sm:self-auto active:scale-[0.98]"
                                      >
                                        {isTranslatingEdit ? (
                                          <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Traduzione...
                                          </>
                                        ) : (
                                          <>
                                            <Globe className="w-3.5 h-3.5" />
                                            ✨ Traduci in Automatico
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Titles */}
                                      <div className="space-y-2">
                                        <h5 className="text-[10px] font-extrabold text-[#004D40] uppercase tracking-wider">Titoli</h5>
                                        <div className="space-y-1.5">
                                          <div className="space-y-0.5">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">🇮🇹 Italiano</label>
                                            <input
                                              type="text"
                                              value={editingTitleIt}
                                              onChange={(e) => setEditingTitleIt(e.target.value)}
                                              placeholder="Italiano"
                                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                                              required={!editingTitleEn}
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">🇬🇧 English</label>
                                            <input
                                              type="text"
                                              value={editingTitleEn}
                                              onChange={(e) => setEditingTitleEn(e.target.value)}
                                              placeholder="English"
                                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                                              required={!editingTitleIt}
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">🇧🇩 Bengali (বাংলা)</label>
                                            <input
                                              type="text"
                                              value={editingTitleBn}
                                              onChange={(e) => setEditingTitleBn(e.target.value)}
                                              placeholder="Lascia vuoto per auto-tradurre..."
                                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">🇵🇰 Urdu (اردو)</label>
                                            <input
                                              type="text"
                                              value={editingTitleUr}
                                              onChange={(e) => setEditingTitleUr(e.target.value)}
                                              placeholder="Lascia vuoto per auto-tradurre..."
                                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Descriptions */}
                                      <div className="space-y-2">
                                        <h5 className="text-[10px] font-extrabold text-[#004D40] uppercase tracking-wider">Descrizioni</h5>
                                        <div className="space-y-1.5">
                                          <div className="space-y-0.5">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">🇮🇹 Italiano</label>
                                            <textarea
                                              value={editingSubtitleIt}
                                              onChange={(e) => setEditingSubtitleIt(e.target.value)}
                                              placeholder="Italiano"
                                              rows={1}
                                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">🇬🇧 English</label>
                                            <textarea
                                              value={editingSubtitleEn}
                                              onChange={(e) => setEditingSubtitleEn(e.target.value)}
                                              placeholder="English"
                                              rows={1}
                                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">🇧🇩 Bengali (বাংলা)</label>
                                            <textarea
                                              value={editingSubtitleBn}
                                              onChange={(e) => setEditingSubtitleBn(e.target.value)}
                                              placeholder="Lascia vuoto per auto-tradurre..."
                                              rows={1}
                                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                                            />
                                          </div>
                                          <div className="space-y-0.5">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase">🇵🇰 Urdu (اردو)</label>
                                            <textarea
                                              value={editingSubtitleUr}
                                              onChange={(e) => setEditingSubtitleUr(e.target.value)}
                                              placeholder="Lascia vuoto per auto-tradurre..."
                                              rows={1}
                                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                      <button
                                        type="submit"
                                        className="bg-[#004D40] hover:bg-[#00332a] text-white text-xs font-bold py-2 px-4 rounded-lg shadow"
                                      >
                                        Salva Modifiche
                                      </button>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="font-sans font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-black" />
                Gestione Clienti (CRM)
              </h2>
              <button
                onClick={loadClients}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-full transition-all"
              >
                Aggiorna Lista
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Qui puoi vedere l'elenco dei clienti registrati, impostare un saluto personalizzato ("Custom Greeting") che vedranno all'ingresso, oppure eliminare i profili non più attivi.
            </p>

            {clientsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <p className="text-xs text-slate-400 font-medium font-sans">Caricamento clienti...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Nessun cliente registrato</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto text-center">
                  I clienti verranno inseriti in questa lista non appena digiteranno il proprio nome nella schermata iniziale di benvenuto.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold text-xs uppercase tracking-wider">
                      <th className="p-4">Nome Cliente</th>
                      <th className="p-4">Saluto Personalizzato</th>
                      <th className="p-4 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clients.map((client) => {
                      // Parse safe serialized metadata inside client.phone
                      const parts = (client.phone || "").split(" ||| ");
                      const cleanPhone = parts[0] || client.phone || "";
                      const cleanNationality = parts[1] || "";
                      const cleanAvatarUrl = parts[2] || "";

                      return (
                        <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {/* Round Profile Avatar Circle */}
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/60 shadow-sm flex items-center justify-center">
                                {cleanAvatarUrl ? (
                                  <img src={cleanAvatarUrl} alt={client.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-[#004D40] font-black text-sm">
                                    {client.name ? client.name.charAt(0).toUpperCase() : "U"}
                                  </div>
                                )}
                              </div>

                              {/* Client Identity details */}
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center gap-2">
                                  {client.name}
                                  {cleanNationality && (
                                    <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded-full text-[10px] text-slate-600 font-bold">
                                      {cleanNationality === "Bangladesh" ? "🇧🇩" : "🇵🇰"} {cleanNationality}
                                    </span>
                                  )}
                                </div>
                                {cleanPhone && (
                                  <div className="text-xs text-[#004D40] font-bold mt-0.5">{cleanPhone}</div>
                                )}
                                <div className="text-[10px] text-slate-400 font-mono mt-1">
                                  Registrato: {new Date(client.created_at || Date.now()).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 max-w-md">
                            <input
                              type="text"
                              placeholder="Es: Assalamualaikum Rashed bhai!"
                              value={greetings[client.id] || ""}
                              onChange={(e) => handleGreetingChange(client.id, e.target.value)}
                              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-sans focus:border-black focus:bg-white focus:outline-none transition-all font-semibold font-bold"
                            />
                            <button
                              onClick={() => handleSaveGreeting(client.id)}
                              disabled={savingGreetingId === client.id}
                              className="bg-black hover:bg-slate-800 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
                            >
                              {savingGreetingId === client.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              Salva
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {confirmingDeleteId === client.id ? (
                            <div className="inline-flex items-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-200">
                              <span className="text-[10px] font-extrabold text-red-700 px-1 uppercase tracking-wider">Sicuro?</span>
                              <button
                                onClick={async () => {
                                  await handleDeleteClient(client.id, client.name);
                                  setConfirmingDeleteId(null);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
                              >
                                Sì, elimina
                              </button>
                              <button
                                onClick={() => setConfirmingDeleteId(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-black px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmingDeleteId(client.id)}
                              className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-bold hover:bg-red-50/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Elimina cliente"
                            >
                              <UserMinus className="w-4 h-4" />
                              Elimina
                            </button>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Persistent App Version Footer */}
        <div className="text-center pt-8 pb-4 border-t border-slate-200/40">
          <p className="text-[11px] font-mono text-slate-400">
            Pannello di Controllo Amministrativo • Versione Applicazione: <span className="font-bold text-slate-600">v{APP_VERSION}</span>
          </p>
          <p className="text-[9px] font-mono text-slate-400/80 mt-1">
            Sincronizzazione PWA Continua & Aggiornamento Automatico Attivo
          </p>
        </div>

      </div>
    </div>
  );
}
