import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, ShoppingBag, Plus, Check, Sparkles, Heart, GraduationCap } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/contexts/CartContext";
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

const categoryIcons = {
  artisan: Sparkles,
  traveler: Heart,
  student: GraduationCap,
};

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
    <div className="group relative rounded-3xl overflow-hidden bg-card border-2 border-border/40 hover:border-cta/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cta/10 hover:-translate-y-2">
      {/* Image with overlay gradient */}
      <div className="aspect-[4/5] overflow-hidden relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        {/* Price badge floating on image */}
        <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/50 shadow-lg">
          <span className="text-cta font-bold text-base">{product.priceLabel}</span>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 space-y-3 bg-card">
        <h3 className="font-semibold text-sm text-foreground tracking-tight">{product.name}</h3>
        <button
          onClick={handleAdd}
          className={cn(
            "w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 border-2",
            added
              ? "bg-cta/15 text-cta border-cta/30 scale-95"
              : "bg-cta text-primary-foreground border-cta hover:bg-cta-hover hover:shadow-lg hover:shadow-cta/20 active:scale-95"
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
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b-2 border-border/30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> {t("store.back")}
          </Link>
          <Link to="/cart" className="relative flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 px-4 py-2 rounded-2xl transition-all">
            <ShoppingCart size={18} className="text-foreground/70" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-cta text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in shadow-md shadow-cta/30">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Hero header */}
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-cta/10 border-2 border-cta/20 rounded-full mb-6 shadow-sm">
            <ShoppingBag size={16} className="text-cta" />
            <span className="text-sm font-bold text-cta uppercase tracking-wider">{t("nav.store")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">{t("store.title")}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">{t("store.subtitle")}</p>
          <div className="w-16 h-1 bg-cta rounded-full mx-auto mt-6" />
        </div>

        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.key);
          if (catProducts.length === 0) return null;
          const Icon = categoryIcons[cat.key];

          return (
            <section key={cat.key} className="mb-20">
              {/* Category header with framed design */}
              <div className="mb-8 p-6 rounded-3xl bg-card border-2 border-border/40 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cta/10 border-2 border-cta/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={22} className="text-cta" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3 tracking-tight">
                      {cat.title}
                      {cat.donation && (
                        <span className="text-[10px] bg-cta text-primary-foreground px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">
                          {t("store.donation")}
                        </span>
                      )}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{cat.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-6">
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
            className="fixed bottom-20 end-6 z-40 bg-cta text-primary-foreground px-7 py-4 rounded-full shadow-2xl shadow-cta/40 flex items-center gap-3 font-bold text-sm hover:scale-105 transition-all duration-300 animate-scale-in border-2 border-cta-hover"
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
