import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { openWhatsApp } from "@/lib/whatsapp";

const RoundFlag = ({ src, alt }: { src: string; alt: string }) => (
  <span className="inline-block w-7 h-7 rounded-full overflow-hidden ring-1 ring-black/10 flex-shrink-0">
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </span>
);

const formatNum = (n: number) => {
  if (!isFinite(n)) return "0";
  if (n === 0) return "0";
  // Full precision up to 4 decimals, trim trailing zeros
  return parseFloat(n.toFixed(4)).toString();
};

// Dynamic font size based on string length to prevent overflow
const fontSizeFor = (val: string) => {
  const len = val.length;
  if (len <= 4) return "text-3xl";
  if (len <= 6) return "text-2xl";
  if (len <= 8) return "text-xl";
  if (len <= 11) return "text-base";
  if (len <= 14) return "text-sm";
  return "text-xs";
};

const TapTapCalculator = () => {
  const { exchangeRate } = useAdmin();
  const [eurValue, setEurValue] = useState<string>("0");
  const [bdtValue, setBdtValue] = useState<string>("0");

  const sanitize = (v: string) => {
    if (v === "" || v === ".") return v;
    const n = parseFloat(v);
    if (isNaN(n) || n < 0) return "";
    return v;
  };

  const onEurChange = (v: string) => {
    const clean = sanitize(v);
    setEurValue(clean);
    const n = parseFloat(clean);
    setBdtValue(isNaN(n) ? "0" : formatNum(n * exchangeRate));
  };

  const onBdtChange = (v: string) => {
    const clean = sanitize(v);
    setBdtValue(clean);
    const n = parseFloat(clean);
    setEurValue(isNaN(n) || exchangeRate === 0 ? "0" : formatNum(n / exchangeRate));
  };

  const handleFocus = (setter: (v: string) => void, current: string) => {
    if (current === "0") setter("");
  };
  const handleBlur = (setter: (v: string) => void, current: string) => {
    if (current === "") setter("0");
  };

  const handleSend = () => {
    openWhatsApp(
      `Ciao Wealink, vorrei inviare ${eurValue || 0} EUR (${bdtValue || 0} BDT) in Bangladesh.`
    );
  };

  return (
    <div className="px-4">
      <div className="rounded-3xl p-5 shadow-sm space-y-5 bg-white border border-black/5">
        {/* Top row: currency labels with round flags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RoundFlag src="https://flagcdn.com/w80/it.png" alt="Italia" />
            <span className="text-xl font-extrabold text-foreground tracking-tight">
              EUR
            </span>
          </div>
          <div className="flex items-center gap-2 bg-black/5 rounded-full px-4 py-2">
            <RoundFlag src="https://flagcdn.com/w80/bd.png" alt="Bangladesh" />
            <span className="text-base font-extrabold text-foreground tracking-tight">
              BDT
            </span>
          </div>
        </div>

        {/* Inputs row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 bg-white rounded-2xl px-3 py-3 border border-black/10 focus-within:border-black focus-within:border-2 transition-colors">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              value={eurValue}
              onFocus={() => handleFocus(setEurValue, eurValue)}
              onBlur={() => handleBlur(setEurValue, eurValue)}
              onChange={(e) => onEurChange(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className={`w-full bg-transparent ${fontSizeFor(eurValue)} font-light tracking-tight text-foreground outline-none placeholder:text-muted-foreground/60`}
            />
          </div>
          <ArrowLeftRight size={22} className="text-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0 bg-white rounded-2xl px-3 py-3 border border-black/10 focus-within:border-black focus-within:border-2 transition-colors">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*"
              value={bdtValue}
              onFocus={() => handleFocus(setBdtValue, bdtValue)}
              onBlur={() => handleBlur(setBdtValue, bdtValue)}
              onChange={(e) => onBdtChange(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className={`w-full bg-transparent ${fontSizeFor(bdtValue)} font-light tracking-tight text-foreground outline-none placeholder:text-muted-foreground/60`}
            />
          </div>
        </div>

        {/* Rate info */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: "#3F8F6A" }}>
            €1.00 = BDT {exchangeRate.toFixed(2)}
          </span>
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
        </div>

        {/* Promo */}
        <p className="text-lg font-bold" style={{ color: "#1F5E3E" }}>
          Recipients get an extra 2.5%!
        </p>

        {/* CTA */}
        <button
          onClick={handleSend}
          className="w-full font-extrabold tracking-wide py-4 rounded-full text-base hover:opacity-95 transition-opacity"
          style={{ backgroundColor: "#9ED5AE", color: "#0F3D2E" }}
        >
          SEND
        </button>
      </div>
    </div>
  );
};

export default TapTapCalculator;
