import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, TrendingUp, RefreshCw } from "lucide-react";

interface RateEntry {
  code: string;
  name: string;
  flag: string;
  rate: number | null;
}

const COUNTRIES: Omit<RateEntry, "rate">[] = [
  { code: "USD", name: "United States", flag: "🇺🇸" },
  { code: "GBP", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CHF", name: "Switzerland", flag: "🇨🇭" },
  { code: "JPY", name: "Japan", flag: "🇯🇵" },
  { code: "CAD", name: "Canada", flag: "🇨🇦" },
  { code: "AUD", name: "Australia", flag: "🇦🇺" },
  { code: "CNY", name: "China", flag: "🇨🇳" },
  { code: "INR", name: "India", flag: "🇮🇳" },
  { code: "BDT", name: "Bangladesh", flag: "🇧🇩" },
  { code: "PKR", name: "Pakistan", flag: "🇵🇰" },
  { code: "SAR", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AED", name: "UAE", flag: "🇦🇪" },
  { code: "TRY", name: "Turkey", flag: "🇹🇷" },
  { code: "BRL", name: "Brazil", flag: "🇧🇷" },
  { code: "MXN", name: "Mexico", flag: "🇲🇽" },
  { code: "SEK", name: "Sweden", flag: "🇸🇪" },
  { code: "NOK", name: "Norway", flag: "🇳🇴" },
  { code: "DKK", name: "Denmark", flag: "🇩🇰" },
  { code: "PLN", name: "Poland", flag: "🇵🇱" },
  { code: "CZK", name: "Czech Republic", flag: "🇨🇿" },
  { code: "HUF", name: "Hungary", flag: "🇭🇺" },
  { code: "RON", name: "Romania", flag: "🇷🇴" },
  { code: "BGN", name: "Bulgaria", flag: "🇧🇬" },
  { code: "HRK", name: "Croatia", flag: "🇭🇷" },
  { code: "RUB", name: "Russia", flag: "🇷🇺" },
  { code: "ZAR", name: "South Africa", flag: "🇿🇦" },
  { code: "EGP", name: "Egypt", flag: "🇪🇬" },
  { code: "NGN", name: "Nigeria", flag: "🇳🇬" },
  { code: "KES", name: "Kenya", flag: "🇰🇪" },
  { code: "GHS", name: "Ghana", flag: "🇬🇭" },
  { code: "MAD", name: "Morocco", flag: "🇲🇦" },
  { code: "THB", name: "Thailand", flag: "🇹🇭" },
  { code: "KRW", name: "South Korea", flag: "🇰🇷" },
  { code: "SGD", name: "Singapore", flag: "🇸🇬" },
  { code: "MYR", name: "Malaysia", flag: "🇲🇾" },
  { code: "PHP", name: "Philippines", flag: "🇵🇭" },
  { code: "IDR", name: "Indonesia", flag: "🇮🇩" },
  { code: "VND", name: "Vietnam", flag: "🇻🇳" },
  { code: "COP", name: "Colombia", flag: "🇨🇴" },
  { code: "ARS", name: "Argentina", flag: "🇦🇷" },
  { code: "CLP", name: "Chile", flag: "🇨🇱" },
  { code: "PEN", name: "Peru", flag: "🇵🇪" },
  { code: "QAR", name: "Qatar", flag: "🇶🇦" },
  { code: "KWD", name: "Kuwait", flag: "🇰🇼" },
  { code: "BHD", name: "Bahrain", flag: "🇧🇭" },
  { code: "OMR", name: "Oman", flag: "🇴🇲" },
  { code: "JOD", name: "Jordan", flag: "🇯🇴" },
  { code: "ILS", name: "Israel", flag: "🇮🇱" },
  { code: "NZD", name: "New Zealand", flag: "🇳🇿" },
  { code: "TWD", name: "Taiwan", flag: "🇹🇼" },
];

const GlobalExchangeRates = () => {
  const { t } = useTranslation();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/EUR");
      const data = await res.json();
      setRates(data.rates || {});
      setLastUpdated(new Date());
    } catch {
      console.error("Failed to fetch exchange rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    ).map((c) => ({ ...c, rate: rates[c.code] ?? null }));
  }, [search, rates]);

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" />
          {t("global_rates")}
        </h2>
        <button
          onClick={fetchRates}
          disabled={loading}
          className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-muted-foreground">
          {t("last_updated")}: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
        <Search size={16} className="text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_country")}
          className="bg-transparent text-sm text-foreground outline-none flex-1"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 px-3 py-2.5 border-b border-border bg-muted/30">
          <span className="text-xs font-bold text-muted-foreground">{t("flag_col")}</span>
          <span className="text-xs font-bold text-muted-foreground">{t("country")}</span>
          <span className="text-xs font-bold text-muted-foreground text-right">1 EUR =</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {loading && filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">{t("loading")}...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">{t("no_results")}</div>
          ) : (
            filtered.map((c) => (
              <div key={c.code} className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center px-3 py-2.5 hover:bg-muted/20 transition-colors">
                <span className="text-xl">{c.flag}</span>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-foreground block truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.code}</span>
                </div>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {c.rate !== null ? c.rate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalExchangeRates;
