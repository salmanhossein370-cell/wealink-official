import { useState, useEffect } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ShopBanner {
  id?: string;
  title: string;
  subtitle?: string;
  image?: string;
}

const ShopBannerCarousel = () => {
  const admin = useAdmin();
  const loading = admin.loading;

  // Fallback default banners to keep the build stable and UI beautiful if admin context doesn't have shopBanners yet
  const shopBanners: ShopBanner[] = (admin as any).shopBanners ?? [
    {
      id: "1",
      title: "Offerte Speciali",
      subtitle: "Fino al 50% di sconto sui migliori smartwatch",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: "2",
      title: "Nuovi Arrivi",
      subtitle: "Scopri le ultime cover per iPhone",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"
    }
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (shopBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % shopBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [shopBanners.length]);

  if (loading) {
    return <Skeleton className="mx-4 rounded-2xl h-36" />;
  }

  if (shopBanners.length === 0) return null;

  const banner = shopBanners[current];

  return (
    <div id="shop-banner-carousel" className="relative mx-4 rounded-2xl overflow-hidden h-36">
      {/* Background */}
      <div className="absolute inset-0 flash-banner" />
      {banner.image && (
        <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full p-5">
        <h2 className="text-white text-lg font-extrabold leading-tight">{banner.title}</h2>
        <p className="text-white/80 text-xs mt-1">{banner.subtitle}</p>
      </div>
      {/* Dots */}
      {shopBanners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {shopBanners.map((_, i) => (
            <button
              id={`shop-banner-dot-${i}`}
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-5" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
      {/* Nav arrows */}
      {shopBanners.length > 1 && (
        <>
          <button
            id="shop-banner-prev"
            onClick={() => setCurrent((current - 1 + shopBanners.length) % shopBanners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            id="shop-banner-next"
            onClick={() => setCurrent((current + 1) % shopBanners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 z-10"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
};

export default ShopBannerCarousel;
