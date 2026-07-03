import { Wallet, ShoppingCart, Send, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { openWhatsApp } from "@/lib/whatsapp";

const CategoryIcons = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const categories = [
    { icon: Wallet, label: t("money"), color: "text-blue-500", path: "/money" },
    { icon: ShoppingCart, label: t("shop"), color: "text-orange-500", path: "/shop" },
    { icon: Send, label: t("travel"), color: "text-primary", path: "/travel" },
    { icon: Smartphone, label: t("services"), color: "text-muted-foreground", action: "servizi" },
  ];

  const handleClick = (cat: typeof categories[0]) => {
    if (cat.path) {
      navigate(cat.path);
    } else if (cat.action === "servizi") {
      openWhatsApp("Ciao Wealink, vorrei informazioni sui vostri servizi.");
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2 px-4 py-4">
      {categories.map((c) => (
        <button key={c.label} onClick={() => handleClick(c)} className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full border-2 border-border bg-card flex items-center justify-center hover:scale-105 transition-transform">
            <c.icon size={24} className={c.color} />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">{c.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryIcons;
