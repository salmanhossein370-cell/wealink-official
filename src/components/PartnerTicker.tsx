import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdmin } from "@/contexts/AdminContext";

const PartnerItem: React.FC<{ partner: any }> = ({ partner }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex items-center justify-center flex-shrink-0 h-8 w-[110px] px-2 text-center select-none pointer-events-none">
      {!hasError && partner.logo ? (
        <img 
          src={partner.logo} 
          alt={partner.name} 
          className="h-8 w-auto max-w-full object-contain pointer-events-none"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-xs font-bold text-muted-foreground truncate bg-muted px-2 py-1 rounded-lg w-full">
          {partner.name}
        </span>
      )}
    </div>
  );
};

const PartnerTicker = () => {
  const { t } = useTranslation();
  const { partners } = useAdmin();

  if (partners.length === 0) return null;

  // Render a single group of partners with exact tailing padding equal to gap
  const renderGroup = (ariaHidden: boolean) => (
    <div 
      className="flex shrink-0 items-center gap-10 pr-10" 
      aria-hidden={ariaHidden || undefined}
    >
      {partners.map((p, i) => (
        <PartnerItem key={`${p.id}-${i}`} partner={p} />
      ))}
    </div>
  );

  return (
    <div className="px-4">
      <h2 className="text-base font-bold text-foreground mb-2">{t("our_partners")}</h2>
      <div className="overflow-hidden rounded-xl bg-card border border-border py-3 flex items-center">
        <div className="flex flex-nowrap w-max animate-marquee-left">
          {renderGroup(false)}
          {renderGroup(true)}
        </div>
      </div>
    </div>
  );
};

export default PartnerTicker;

