import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Home, ShoppingCart, CreditCard, X, MapPin, Truck, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { openWhatsApp } from "@/lib/whatsapp";
import { trackOrder } from "@/lib/analytics";

const ShopBottomBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [delivery, setDelivery] = useState<"ship" | "pickup">("ship");
  const [customerName, setCustomerName] = useState("");

  const handleCheckout = async () => {
    if (!customerName.trim()) return;
    const itemList = items.map((i) => `• ${i.name} x${i.quantity} — €${(i.price * i.quantity).toFixed(2)}`).join("\n");
    const mode = delivery === "ship" ? t("home_delivery") : t("pickup");

    await trackOrder(
      total,
      items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      customerName,
      mode
    );

    openWhatsApp(
      `📦 *NUOVO ORDINE*\n\n👤 Cliente: ${customerName}\n\n${itemList}\n\n💰 *${t("total")}: €${total.toFixed(2)}*\n📍 ${t("delivery_method")}: ${mode}`
    );
    clearCart();
    setShowCheckout(false);
    setShowCart(false);
    setCustomerName("");
  };

  return (
    <>
      <nav id="shop-bottom-nav" className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
          <button id="nav-home-btn" onClick={() => navigate("/")} className="flex flex-col items-center gap-0.5 px-4 py-1 text-muted-foreground">
            <Home size={20} strokeWidth={1.8} />
            <span className="text-[9px] font-semibold">{t("home")}</span>
          </button>
          <button id="nav-cart-btn" onClick={() => setShowCart(true)} className="flex flex-col items-center gap-0.5 px-4 py-1 text-muted-foreground relative">
            <ShoppingCart size={20} strokeWidth={1.8} />
            {itemCount > 0 && (
              <span id="cart-badge-count" className="absolute -top-0.5 right-2 bg-destructive text-destructive-foreground text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
            <span className="text-[9px] font-semibold">{t("cart")}</span>
          </button>
          <button
            id="nav-checkout-btn"
            onClick={() => { if (itemCount > 0) setShowCheckout(true); }}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 ${itemCount > 0 ? "text-success" : "text-muted-foreground/40"}`}
          >
            <CreditCard size={20} strokeWidth={1.8} />
            <span className="text-[9px] font-semibold">{t("checkout")}</span>
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      {showCart && (
        <div id="cart-drawer-backdrop" className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowCart(false)}>
          <div id="cart-drawer-container" className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-foreground">🛒 {t("cart")} ({itemCount})</h2>
                <button id="close-cart-btn" onClick={() => setShowCart(false)} className="p-1"><X size={20} className="text-muted-foreground" /></button>
              </div>

              {items.length === 0 ? (
                <div id="cart-empty-state" className="text-center py-10">
                  <ShoppingCart size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">{t("cart_empty")}</p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <div id={`cart-item-${item.id}`} key={item.id} className="flex items-center gap-3 bg-secondary rounded-xl p-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-sm font-extrabold text-destructive">€{(item.price * item.quantity).toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button id={`cart-item-minus-${item.id}`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <Minus size={12} className="text-foreground" />
                          </button>
                          <span id={`cart-item-qty-${item.id}`} className="text-xs font-bold text-foreground w-5 text-center">{item.quantity}</span>
                          <button id={`cart-item-plus-${item.id}`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <Plus size={12} className="text-foreground" />
                          </button>
                        </div>
                      </div>
                      <button id={`cart-item-remove-${item.id}`} onClick={() => removeItem(item.id)} className="text-destructive/70 hover:text-destructive text-[10px] font-bold bg-destructive/10 px-2 py-1 rounded-lg">
                        {t("remove")}
                      </button>
                    </div>
                  ))}

                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("total")}</span>
                    <span id="cart-total-amount" className="text-xl font-extrabold text-foreground">€{total.toFixed(2)}</span>
                  </div>

                  <button
                    id="cart-proceed-btn"
                    onClick={() => { setShowCart(false); setShowCheckout(true); }}
                    className="w-full bg-success text-success-foreground py-3 rounded-xl font-bold text-sm"
                  >
                    {t("proceed_checkout")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Drawer */}
      {showCheckout && (
        <div id="checkout-drawer-backdrop" className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowCheckout(false)}>
          <div id="checkout-drawer-container" className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-foreground">📦 {t("checkout")}</h2>
                <button id="close-checkout-btn" onClick={() => setShowCheckout(false)} className="p-1"><X size={20} className="text-muted-foreground" /></button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t("your_details")}</p>
                <input
                  id="checkout-name-input"
                  type="text"
                  placeholder={t("full_name_placeholder")}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="bg-secondary rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t("order_summary")}</p>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground truncate max-w-[60%]">{item.name} x{item.quantity}</span>
                    <span className="font-bold text-foreground">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-bold text-foreground">{t("total")}</span>
                  <span id="checkout-total-amount" className="text-lg font-extrabold text-destructive">€{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t("delivery_method")}</p>
                <button
                  id="delivery-ship-btn"
                  onClick={() => setDelivery("ship")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${delivery === "ship" ? "border-success bg-success/5" : "border-border bg-card"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${delivery === "ship" ? "bg-success/20" : "bg-secondary"}`}>
                    <Truck size={20} className={delivery === "ship" ? "text-success" : "text-muted-foreground"} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-foreground">{t("home_delivery")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("home_delivery_desc")}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${delivery === "ship" ? "border-success" : "border-muted-foreground/30"}`}>
                    {delivery === "ship" && <div className="w-2.5 h-2.5 rounded-full bg-success" />}
                  </div>
                </button>

                <button
                  id="delivery-pickup-btn"
                  onClick={() => setDelivery("pickup")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${delivery === "pickup" ? "border-success bg-success/5" : "border-border bg-card"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${delivery === "pickup" ? "bg-success/20" : "bg-secondary"}`}>
                    <MapPin size={20} className={delivery === "pickup" ? "text-success" : "text-muted-foreground"} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-foreground">{t("pickup")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("pickup_address")}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${delivery === "pickup" ? "border-success" : "border-muted-foreground/30"}`}>
                    {delivery === "pickup" && <div className="w-2.5 h-2.5 rounded-full bg-success" />}
                  </div>
                </button>
              </div>

              <button
                id="checkout-confirm-btn"
                onClick={handleCheckout}
                disabled={!customerName.trim()}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-opacity ${customerName.trim() ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground opacity-60"}`}
              >
                {t("confirm_order")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShopBottomBar;
