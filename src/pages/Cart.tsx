import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const { t } = useLanguage();

  const generateWhatsAppMessage = () => {
    let msg = "*New Order from Terraria Store*\n\n";
    items.forEach((item) => {
      msg += `• ${item.name} × ${item.quantity} — ${item.price * item.quantity} DH\n`;
    });
    msg += `\n*Total: ${totalPrice} DH*`;
    msg += `\n*Items: ${totalItems}*`;
    return encodeURIComponent(msg);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-6 pt-32 pb-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-cta/10 border-2 border-cta/20 flex items-center justify-center">
            <ShoppingBag size={40} className="text-cta/60" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("cart.empty_title")}</h1>
          <p className="text-muted-foreground text-sm mb-8">{t("cart.empty_desc")}</p>
          <Link to="/store">
            <Button variant="cta" size="lg" className="gap-2"><ShoppingBag size={16} /> {t("cart.browse")}</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-2 flex items-center justify-end">
        <button onClick={clearCart} className="text-xs text-foreground/40 hover:text-destructive transition-colors font-medium px-3 py-1.5 rounded-xl hover:bg-destructive/10">
          {t("cart.clear")}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-24 pb-32">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-cta/10 border-2 border-cta/20 flex items-center justify-center">
            <ShoppingCart size={18} className="text-cta" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("cart.title")} <span className="text-cta">({totalItems})</span></h1>
        </div>

        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-card border-2 border-border/40 hover:border-cta/20 transition-all duration-300 shadow-sm">
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-border/30">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-foreground truncate">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{item.category}</p>
                <p className="text-cta font-bold text-base mt-1">{item.price} DH</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item.id)} className="text-foreground/30 hover:text-destructive transition-colors p-1.5 rounded-xl hover:bg-destructive/10">
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-2 bg-card rounded-2xl px-1.5 py-1 border-2 border-border/40">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-cta/10 transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-bold w-5 text-center text-foreground">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-cta/10 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t-2 border-border/30 p-4 z-50 shadow-2xl shadow-foreground/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("cart.total")}</p>
            <p className="text-2xl font-bold text-foreground">{totalPrice} <span className="text-sm font-normal text-muted-foreground">DH</span></p>
          </div>
          <a
            href={`https://wa.me/message/SBUBJACPVCNGM1?text=${generateWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              supabase.functions.invoke("send-notification", {
                body: {
                  type: "purchase",
                  data: {
                    items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
                    totalPrice,
                    totalItems,
                  },
                },
              }).catch(console.error);
            }}
          >
            <Button variant="cta" size="lg" className="gap-2 px-8 shadow-xl shadow-cta/20">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              {t("cart.checkout")}
            </Button>
          </a>
        </div>
      </div>
    </main>
  );
};

export default Cart;
