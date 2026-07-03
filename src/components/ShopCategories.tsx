import { useTranslation } from "react-i18next";

const cats = ["cover", "smartwatch", "headphones", "accessories", "cables", "other"];

interface Props {
  selected?: string;
  onSelect?: (cat: string) => void;
}

const ShopCategories = ({ selected, onSelect }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-1 overflow-x-auto px-3 pb-2 no-scrollbar">
      <button
        id="shop-cat-all"
        onClick={() => onSelect?.("")}
        className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
          !selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}
      >
        {t("all")}
      </button>
      {cats.map((c) => (
        <button
          id={`shop-cat-${c}`}
          key={c}
          onClick={() => onSelect?.(c === selected ? "" : c)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
            selected === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          {t(c)}
        </button>
      ))}
    </div>
  );
};

export default ShopCategories;
