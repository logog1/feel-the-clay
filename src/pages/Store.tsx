import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import workshop15 from "@/assets/workshop-15.jpg";
import workshop16 from "@/assets/workshop-16.jpg";
import workshop18 from "@/assets/workshop-18.jpg";
import workshop19 from "@/assets/workshop-19.jpg";
import workshop20 from "@/assets/workshop-20.jpg";
import workshop21 from "@/assets/workshop-21.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  image: string;
  category: "artisan" | "traveler" | "student";
}

const products: Product[] = [
  { id: "1", name: "Handmade Bowl", price: 80, priceLabel: "80 DH", image: workshop15, category: "artisan" },
  { id: "2", name: "Glazed Mug", price: 60, priceLabel: "60 DH", image: workshop16, category: "artisan" },
  { id: "3", name: "Decorative Plate", price: 120, priceLabel: "120 DH", image: workshop18, category: "artisan" },
  { id: "4", name: "Traveler's Cup", price: 50, priceLabel: "50 DH", image: workshop19, category: "traveler" },
  { id: "5", name: "Memory Bowl", price: 50, priceLabel: "50 DH", image: workshop20, category: "traveler" },
  { id: "6", name: "Student Vase", price: 70, priceLabel: "70 DH", image: workshop21, category: "student" },
];

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 hover:border-cta/30 transition-all duration-300 hover:shadow-xl hover:shadow-cta/5 hover:-translate-y-1">
      <div className="aspect-square overflow-hidden relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm">{product.name}</h3>
          <p className="text-cta font-bold text-lg mt-1">{product.priceLabel}</p>
        </div>
        <button
          onClick={handleAdd}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300",
            added
              ? "bg-cta/20 text-cta border border-cta/30"
              : "bg-cta/10 text-cta border border-cta/20 hover:bg-cta hover:text-primary-foreground hover:border-cta"
          )}
        >
          {added ? <><Check size={16} /> {t("store.added")}</> : <><Plus size={16} /> {t("store.add_to_cart")}</>}
        </button>
      </div>
    </div>
  );
};

const Store = () => {
  const { t } = useLanguage();
  const { totalItems } = useCart();

  const categories = [
    { key: "artisan" as const, title: t("store.artisan_title"), description: t("store.artisan_desc") },
    { key: "traveler" as const, title: t("store.traveler_title"), description: t("store.traveler_desc"), donation: true },
    { key: "student" as const, title: t("store.student_title"), description: t("store.student_desc") },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Nav with cart icon */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-sm">
            <ArrowLeft size={16} /> {t("store.back")}
          </Link>
          <Link to="/cart" className="relative flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-sm">
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -end-2 w-5 h-5 bg-cta text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        {/* Hero header */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cta/10 border border-cta/20 rounded-full mb-6">
            <span className="text-lg">🏺</span>
            <span className="text-sm font-semibold text-cta">{t("nav.store")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("store.title")}</h1>
          <p className="text-foreground/50 max-w-lg mx-auto text-sm leading-relaxed">{t("store.subtitle")}</p>
        </div>

        {categories.map((cat, catIndex) => {
          const catProducts = products.filter((p) => p.category === cat.key);
          if (catProducts.length === 0) return null;

          return (
            <section key={cat.key} className="mb-16">
              <div className="mb-6 flex items-start gap-3">
                <div className="w-1 h-8 bg-cta rounded-full flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {cat.title}
                    {cat.donation && (
                      <span className="text-[10px] bg-cta/20 text-cta px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                        {t("store.donation")}
                      </span>
                    )}
                  </h2>
                  <p className="text-foreground/50 text-sm mt-1 leading-relaxed">{cat.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                {catProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Cart floating button */}
        {totalItems > 0 && (
          <Link
            to="/cart"
            className="fixed bottom-20 end-6 z-40 bg-cta text-white px-6 py-3 rounded-full shadow-2xl shadow-cta/30 flex items-center gap-2 font-semibold text-sm hover:scale-105 transition-transform animate-scale-in"
          >
            <ShoppingCart size={18} />
            {t("store.view_cart")} ({totalItems})
          </Link>
        )}
      </div>
    </main>
  );
};

export default Store;
