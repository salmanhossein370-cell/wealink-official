import { useTranslation } from "react-i18next";
import { useAdmin } from "@/contexts/AdminContext";
import bkashLogo from "@/assets/bkash-logo.svg";
import nagadLogo from "@/assets/nagad-logo.svg";

const QuickServices = () => {
  const { t } = useTranslation();
  const { bkashRate, nagadRate } = useAdmin();

  const services = [
    {
      name: "bKash",
      primaryLogo: "/quick-bkash.png",
      fallbackLogo: bkashLogo,
      bgColor: "#FFF5F5",
      borderColor: "#FEE2E2",
      rate: bkashRate
    },
    {
      name: "Nagad",
      primaryLogo: "/quick-nagad.png",
      fallbackLogo: nagadLogo,
      bgColor: "#FFF9F2",
      borderColor: "#FFEDD5",
      rate: nagadRate
    },
  ];

  return (
    <div id="quick-services-section" className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 id="quick-services-title" className="text-base font-bold text-foreground">{t("quick_services")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {services.map((s) => (
          <div
            id={`quick-service-card-${s.name.toLowerCase()}`}
            key={s.name}
            style={{ backgroundColor: s.bgColor, border: `1px solid ${s.borderColor}` }}
            className="rounded-2xl p-3 shadow-sm flex flex-col gap-2 select-none pointer-events-none transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm overflow-hidden flex-shrink-0 border border-slate-100">
                <img
                  id={`quick-service-logo-${s.name.toLowerCase()}`}
                  src={s.primaryLogo}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = s.fallbackLogo;
                  }}
                  alt={s.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span id={`quick-service-name-${s.name.toLowerCase()}`} className="font-bold text-sm text-[#0f172a]">{s.name}</span>
            </div>
            <p id={`quick-service-rate-container-${s.name.toLowerCase()}`} className="text-[11px] text-slate-500 font-medium">
              {t("rate")}: 1 EUR = <span id={`quick-service-rate-val-${s.name.toLowerCase()}`} className="font-bold text-[#0f172a]">{s.rate.toFixed(2)}</span> BDT
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickServices;
