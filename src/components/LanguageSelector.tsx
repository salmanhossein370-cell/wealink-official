import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Search, Check } from "lucide-react";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ur", label: "اردو", flag: "🇵🇰" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "fil", label: "Filipino", flag: "🇵🇭" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "he", label: "עברית", flag: "🇮🇱" },
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "ne", label: "नेपाली", flag: "🇳🇵" },
  { code: "si", label: "සිංහල", flag: "🇱🇰" },
  { code: "my", label: "မြန်မာ", flag: "🇲🇲" },
  { code: "km", label: "ខ្មែរ", flag: "🇰🇭" },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = languages.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-card/80 backdrop-blur border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-foreground"
      >
        <Globe size={14} />
        {languages.find((l) => l.code === i18n.language)?.flag || "🌍"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-lg w-64 overflow-hidden">
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 bg-background rounded-lg px-2 py-1.5">
                <Search size={14} className="text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search language..."
                  className="bg-transparent text-sm text-foreground outline-none flex-1"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filtered.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { i18n.changeLanguage(l.code); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-accent/10 transition-colors"
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="flex-1 text-left font-medium">{l.label}</span>
                  {i18n.language === l.code && <Check size={14} className="text-success" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No results</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
