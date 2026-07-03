import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";

const FlashDealBanner = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 33, s: 29 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mx-4 flash-banner rounded-xl p-3 flex items-center gap-3">
      <div>
        <p className="text-accent font-extrabold text-sm">{t("flash_deals_title")} <Star size={14} className="inline text-accent" /></p>
        <div className="flex gap-1 mt-1">
          <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">{pad(timeLeft.h)}:{pad(timeLeft.m)}</span>
          <span className="text-primary-foreground text-xs font-bold py-0.5">{pad(timeLeft.s)}</span>
        </div>
      </div>
    </div>
  );
};

export default FlashDealBanner;
