import { memo } from "react";
import { Home, Wallet, ShoppingBag, Plane, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BottomNav = memo(() => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { path: "/", label: t("home"), icon: Home },
    { path: "/money", label: t("money"), icon: Wallet },
    { path: "/shop", label: t("shop"), icon: ShoppingBag },
    { path: "/travel", label: t("travel"), icon: Plane },
    { path: "/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-7xl mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${active ? "text-accent" : "text-muted-foreground"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = "BottomNav";

export default BottomNav;
