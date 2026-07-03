import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdmin } from "@/contexts/AdminContext";
import { openWhatsApp } from "@/lib/whatsapp";

const COMMISSION = 3;
const COMMISSION_THRESHOLD = 150;

const CommissionCalculator = () => {
  const { t } = useTranslation();
  const { exchangeRate } = useAdmin();
  const [amount, setAmount] = useState(100);

  const commission = amount < COMMISSION_THRESHOLD ? COMMISSION : 0;
  const netAmount = Math.max(amount - commission, 0);
  const result = (netAmount * exchangeRate).toFixed(2);

  return (
    <div className="px-4">
      <h2 className="text-base font-bold text-foreground mb-3">{t("instant_calculator")}</h2>
      <div className="flex gap-3">
        <div className="flex-1 gold-gradient p-4 flex flex-col justify-center rounded-sm">
          <span className="text-[11px] font-semibold text-accent-foreground/80">{t("you_receive")}</span>
          <span className="text-2xl font-extrabold text-accent-foreground">{result} BDT</span>
          <span className="text-[11px] text-accent-foreground/70 mt-1">{t("commission")}: {commission.toFixed(2)} EUR</span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="bg-card border border-border p-3 rounded-none">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-transparent text-lg font-bold text-foreground outline-none"
              placeholder={t("amount_eur")} />
            
            <span className="text-[11px] text-muted-foreground">{t("amount_eur")}</span>
          </div>
          <div className="bg-card border border-border p-3 rounded-none">
            <span className="text-sm font-semibold text-foreground">{t("commission")}: {commission.toFixed(2)} EUR</span>
          </div>
          <button
            onClick={() => openWhatsApp(`Ciao, vorrei inviare ${amount} EUR in Bangladesh. Tasso: ${exchangeRate} BDT/EUR.`)}
            className="bg-success text-success-foreground rounded-lg py-2 text-sm font-bold">
            
            {t("send_money")}
          </button>
        </div>
      </div>
    </div>);

};

export default CommissionCalculator;
