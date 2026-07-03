import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

// Fallback high-quality image placeholders instead of non-existent local files
const smartwatchImg = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60";
const iphoneImg = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60";

const fallbackImages: Record<string, string> = {
  Smartwatch: smartwatchImg,
  Cover: iphoneImg,
  Cuffie: smartwatchImg,
  Accessori: iphoneImg,
};

interface Props {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: string;
}

const ProductCard = ({ id, name, price, originalPrice, image, category }: Props) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const displayImage = image || (category ? fallbackImages[category] : smartwatchImg) || smartwatchImg;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div id={`product-card-${id}`} className="bg-card rounded-xl border border-border overflow-hidden group">
      {/* Image */}
      <div
        onClick={() => navigate(`/product/${id}`)}
        className="relative aspect-square overflow-hidden cursor-pointer"
      >
        <img src={displayImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 onClick={() => navigate(`/product/${id}`)} className="text-xs font-bold text-foreground truncate cursor-pointer leading-tight">
          {name}
        </h3>
        <div className="flex items-end justify-between mt-1.5">
          <div>
            <span className="text-base font-extrabold text-destructive">€{price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through ml-1">€{originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            id={`add-to-cart-btn-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              addItem({ id, name, price, originalPrice, image: displayImage });
            }}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform"
          >
            <ShoppingCart size={13} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
