import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ShoppingCart, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { z } from "zod";

type Region = "north" | "morocco";

const DELIVERY_FEES: Record<Region, number> = {
  north: 20,
  morocco: 40,
};

const checkoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s\-()]+$/, "Invalid phone number format"),
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(300, "Address must be under 300 characters"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const { t } = useLanguage();
  const [region, setRegion] = useState<Region>("north");
  const [form, setForm] = useState<CheckoutForm>({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const deliveryFee = DELIVERY_FEES[region];
  const grandTotal = totalPrice + deliveryFee;

  const handleCheckout = async () => {
    if (honeypot) return; // bot detected

    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutForm, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof CheckoutForm;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSending(true);

    const validated = result.data;

    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "purchase",
          data: {
            items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            totalPrice,
            totalItems,
            deliveryFee,
            grandTotal,
            region: region === "north" ? "North (Tetouan/Tanger)" : "Rest of Morocco",
            customerName: validated.name,
            customerPhone: validated.phone,
            customerAddress: validated.address,
          },
        },
      });
    } catch (err) {
      console.error(err);
    }

    setSending(false);
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-6 pt-32 pb-12 text-center">
          <CheckCircle className="w-16 h-16 text-cta mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("cart.order_success")}</h1>
          <p className="text-muted-foreground text-sm mb-8">{t("cart.order_success_desc")}</p>
          <Link to="/store">
            <Button variant="cta" size="lg" className="gap-2"><ShoppingBag size={16} /> {t("cart.browse")}</Button>
          </Link>
        </div>
      </main>
    );
  }

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
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cta/10 border-2 border-cta/20 flex items-center justify-center">
              <ShoppingCart size={18} className="text-cta" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("cart.title")} <span className="text-cta">({totalItems})</span></h1>
          </div>
          <button onClick={clearCart} className="text-xs text-foreground/40 hover:text-destructive transition-colors font-medium px-3 py-1.5 rounded-xl hover:bg-destructive/10">
            {t("cart.clear")}
          </button>
        </div>

        {/* Items */}
        <div className="space-y-4 mb-8">
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

        {/* Delivery Region */}
        <div className="p-6 rounded-3xl bg-card border-2 border-border/40 shadow-sm space-y-4 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("cart.region")}</h3>
          <RadioGroup value={region} onValueChange={(v) => setRegion(v as Region)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                region === "north" ? "border-cta bg-cta/5" : "border-border/40 hover:border-cta/30"
              )}>
                <RadioGroupItem value="north" />
                <div>
                  <span className="text-sm font-medium block">{t("cart.region_north")}</span>
                  <span className="text-xs text-cta font-bold">20 DH</span>
                </div>
              </label>
              <label className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                region === "morocco" ? "border-cta bg-cta/5" : "border-border/40 hover:border-cta/30"
              )}>
                <RadioGroupItem value="morocco" />
                <div>
                  <span className="text-sm font-medium block">{t("cart.region_morocco")}</span>
                  <span className="text-xs text-cta font-bold">40 DH</span>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Customer Info */}
        <div className="p-6 rounded-3xl bg-card border-2 border-border/40 shadow-sm space-y-4 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("cart.customer_info")}</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cart-name">{t("cart.name")} *</Label>
              <Input id="cart-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cart-phone">{t("cart.phone")} *</Label>
              <Input id="cart-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212..." className="rounded-xl" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cart-address">{t("cart.address")} *</Label>
              <Textarea id="cart-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl min-h-[80px]" />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="p-6 rounded-3xl bg-card border-2 border-border/40 shadow-sm space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.subtotal")}</span>
            <span className="font-medium text-foreground">{totalPrice} DH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.delivery")}</span>
            <span className="font-medium text-foreground">{deliveryFee} DH</span>
          </div>
          <div className="border-t-2 border-border/30 pt-3 flex justify-between">
            <span className="font-bold text-foreground">{t("cart.total")}</span>
            <span className="text-xl font-bold text-cta">{grandTotal} DH</span>
          </div>
          {/* Honeypot */}
          <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
            <label htmlFor="cart-website">Website</label>
            <input id="cart-website" name="website" type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" tabIndex={-1} />
          </div>
          <Button
            variant="cta"
            size="xl"
            className="w-full shadow-xl shadow-cta/20 gap-2"
            onClick={handleCheckout}
            disabled={sending}
          >
            <Send size={16} />
            {sending ? t("cart.sending") : t("cart.checkout")}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Cart;
