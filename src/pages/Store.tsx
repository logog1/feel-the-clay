import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, ShoppingBag, Plus, Check, Sparkles, Heart, GraduationCap, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";

// Product images - only real product photos
import productHeartMug from "@/assets/product-heart-mug.png";
import productTexturedBowl1 from "@/assets/product-textured-bowl-1.png";
import productTexturedBowl2 from "@/assets/product-textured-bowl-2.png";
import productPlateBowl from "@/assets/product-plate-bowl.png";
import productSet from "@/assets/product-set.png";
import productCarvedCup from "@/assets/product-carved-cup.png";
import productDoubleCup from "@/assets/product-double-cup.png";
import productTwinCups from "@/assets/product-twin-cups.png";
import productTerrariaPot from "@/assets/product-terraria-pot.png";
import productTerrariaPotTop from "@/assets/product-terraria-pot-top.png";
import productTerrariaPotClosed from "@/assets/product-terraria-pot-closed.png";
import productSimpleCup from "@/assets/product-simple-cup.png";
import productHeartCup1 from "@/assets/product-heart-cup-1.png";
import productHeartCup2 from "@/assets/product-heart-cup-2.png";
import productStrawCup from "@/assets/product-straw-cup.png";
import productTwistedVase from "@/assets/product-twisted-vase.png";
import productStickerCup from "@/assets/product-sticker-cup.png";
import productCatMug1 from "@/assets/product-cat-mug-1.png";
import productCatMug2 from "@/assets/product-cat-mug-2.png";

interface Product {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  images: string[];
  category: "terraria" | "artisan" | "traveler" | "student";
}

const products: Product[] = [
  // Terraria's Collection
  { id: "t1", name: "Terraria Signature Pot", price: 150, priceLabel: "150 DH", images: [productTerrariaPot, productTerrariaPotTop, productTerrariaPotClosed], category: "terraria" },
  { id: "t2", name: "Carved Cup Set", price: 120, priceLabel: "120 DH", images: [productCarvedCup, productTwinCups, productDoubleCup], category: "terraria" },
  { id: "t3", name: "Bowl & Plate Set", price: 180, priceLabel: "180 DH", images: [productPlateBowl, productSet], category: "terraria" },
  // Artisan
  { id: "1", name: "Textured Bowl", price: 80, priceLabel: "80 DH", images: [productTexturedBowl1, productTexturedBowl2], category: "artisan" },
  { id: "2", name: "Heart Mug", price: 60, priceLabel: "60 DH", images: [productHeartMug], category: "artisan" },
  { id: "3", name: "Simple Cup", price: 45, priceLabel: "45 DH", images: [productSimpleCup], category: "artisan" },
  // Traveler
  { id: "4", name: "Heart Cup", price: 50, priceLabel: "50 DH", images: [productHeartCup1, productHeartCup2], category: "traveler" },
  { id: "5", name: "Sticker Cup", price: 50, priceLabel: "50 DH", images: [productStickerCup, productStrawCup], category: "traveler" },
  { id: "6", name: "Twisted Vase", price: 50, priceLabel: "50 DH", images: [productTwistedVase], category: "traveler" },
  // Student
  { id: "7", name: "Cat Mug", price: 70, priceLabel: "70 DH", images: [productCatMug1, productCatMug2], category: "student" },
];

const categoryIcons = {
  terraria: Crown,
  artisan: Sparkles,
  traveler: Heart,
  student: GraduationCap,
};

const ImageCarousel = ({ images, alt }: { images: string[]; alt: string }) => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  if (images.length <= 1) {
    return <img src={images[0]} alt={alt} className="w-full h-full object-cover" loading="lazy" />;
  }

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          setCurrent((p) => diff > 0 ? Math.min(p + 1, images.length - 1) : Math.max(p - 1, 0));
        }
      }}
    >
      <img src={images[current]} alt={alt} className="w-full h-full object-cover transition-opacity duration-300" loading="lazy" />
      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === current ? "bg-white w-4" : "bg-white/50")} />
        ))}
      </div>
      {current > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrent(current - 1); }} className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 hover:bg-black/60">
          <ChevronLeft size={14} />
        </button>
      )}
      {current < images.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrent(current + 1); }} className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 hover:bg-black/60">
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0], category: product.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-card border-2 border-border/40 transition-all duration-300 active:scale-[0.97] active:shadow-xl active:shadow-cta/15 hover:border-cta/40 hover:shadow-2xl hover:shadow-cta/10 hover:-translate-y-2">
      <div className="aspect-[4/5] overflow-hidden relative">
        <ImageCarousel images={product.images} alt={product.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/50 shadow-lg">
          <span className="text-cta font-bold text-base">{product.priceLabel}</span>
        </div>
      </div>
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
    { key: "terraria" as const, title: t("store.terraria_title"), description: t("store.terraria_desc") },
    { key: "artisan" as const, title: t("store.artisan_title"), description: t("store.artisan_desc") },
    { key: "traveler" as const, title: t("store.traveler_title"), description: t("store.traveler_desc"), donation: true },
    { key: "student" as const, title: t("store.student_title"), description: t("store.student_desc") },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />

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
