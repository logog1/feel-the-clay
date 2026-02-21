import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ShoppingBag, Plus, Check, Sparkles, Heart, GraduationCap, Crown, ChevronLeft, ChevronRight, Scissors } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";

// Static product images map
import productHeartMug from "@/assets/product-heart-mug.png";
import productTexturedBowlNew from "@/assets/product-textured-bowl-new.png";
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
import productRugGeometric from "@/assets/product-rug-geometric.png";
import productRugBlueWhite from "@/assets/product-rug-blue-white.png";
import productRugDiamond from "@/assets/product-rug-diamond.png";

const imageMap: Record<string, string> = {
  "product-heart-mug.png": productHeartMug,
  "product-textured-bowl-new.png": productTexturedBowlNew,
  "product-plate-bowl.png": productPlateBowl,
  "product-set.png": productSet,
  "product-carved-cup.png": productCarvedCup,
  "product-double-cup.png": productDoubleCup,
  "product-twin-cups.png": productTwinCups,
  "product-terraria-pot.png": productTerrariaPot,
  "product-terraria-pot-top.png": productTerrariaPotTop,
  "product-terraria-pot-closed.png": productTerrariaPotClosed,
  "product-simple-cup.png": productSimpleCup,
  "product-heart-cup-1.png": productHeartCup1,
  "product-heart-cup-2.png": productHeartCup2,
  "product-straw-cup.png": productStrawCup,
  "product-twisted-vase.png": productTwistedVase,
  "product-sticker-cup.png": productStickerCup,
  "product-cat-mug-1.png": productCatMug1,
  "product-cat-mug-2.png": productCatMug2,
  "product-rug-geometric.png": productRugGeometric,
  "product-rug-blue-white.png": productRugBlueWhite,
  "product-rug-diamond.png": productRugDiamond,
};

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  images: string[];
  category: string;
  stock: number;
  is_sold_out: boolean;
  is_promotion: boolean;
  promotion_label?: string | null;
  dimensions?: string | null;
}

const categoryIcons: Record<string, React.ElementType> = {
  terraria: Crown,
  artisan: Sparkles,
  traveler: Heart,
  student: GraduationCap,
  amazigh: Scissors,
};

const ImageCarousel = ({ images, alt }: { images: string[]; alt: string }) => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  if (images.length <= 1) {
    return <img src={images[0]} alt={alt} className="w-full h-full object-cover" loading="lazy" />;
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          setCurrent((p) => diff > 0 ? Math.min(p + 1, images.length - 1) : Math.max(p - 1, 0));
        }
      }}
    >
      {/* All images are pre-rendered in the DOM; only CSS transform moves between them — no re-fetch */}
      <div
        className="flex h-full transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)`, width: `${images.length * 100}%` }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={i === 0 ? alt : ""}
            className="h-full object-cover flex-shrink-0"
            style={{ width: `${100 / images.length}%` }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} className={cn("h-1.5 rounded-full transition-all duration-200", i === current ? "bg-white w-4" : "bg-white/50 w-1.5")} />
        ))}
      </div>
      {/* Prev */}
      {current > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrent(current - 1); }} className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 hover:bg-black/60 transition-colors">
          <ChevronLeft size={14} />
        </button>
      )}
      {/* Next */}
      {current < images.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrent(current + 1); }} className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-10 hover:bg-black/60 transition-colors">
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

  const resolvedImages = product.images.map((img) => imageMap[img] || img);

  const handleAdd = () => {
    if (product.is_sold_out) return;
    addItem({ id: product.id, name: product.name, price: product.price, image: resolvedImages[0], category: product.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={cn(
      "group relative rounded-3xl overflow-hidden bg-card border-2 border-border/40 transition-all duration-300",
      product.is_sold_out ? "opacity-70" : "active:scale-[0.97] active:shadow-xl active:shadow-cta/15 hover:border-cta/40 hover:shadow-2xl hover:shadow-cta/10 hover:-translate-y-2"
    )}>
      <div className="aspect-[4/5] overflow-hidden relative">
        <ImageCarousel images={resolvedImages} alt={product.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent pointer-events-none" />
        {/* Badges */}
        {product.is_promotion && product.promotion_label && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg z-10">
            {product.promotion_label}
          </div>
        )}
        {product.is_sold_out && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="rotate-[-35deg] border-4 border-red-500 rounded-lg px-5 py-2 shadow-2xl">
              <span className="text-red-500 text-lg font-black uppercase tracking-widest drop-shadow">
                {t("store.sold_out")}
              </span>
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/50 shadow-lg">
          {product.original_price && product.original_price > product.price ? (
            <div className="flex items-center gap-1.5">
              <span className="text-cta font-bold text-base">{product.price} DH</span>
              <span className="text-muted-foreground line-through text-xs">{product.original_price} DH</span>
            </div>
          ) : (
            <span className="text-cta font-bold text-base">{product.price} DH</span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-2 bg-card">
        <h3 className="font-semibold text-sm text-foreground tracking-tight">{product.name}</h3>
        {product.dimensions && (
          <p className="text-xs text-muted-foreground">{t("store.dimensions")}: {product.dimensions}</p>
        )}
        <button
          onClick={handleAdd}
          disabled={product.is_sold_out}
          className={cn(
            "w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 border-2",
            product.is_sold_out
              ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
              : added
                ? "bg-cta/15 text-cta border-cta/30 scale-95"
                : "bg-cta text-primary-foreground border-cta hover:bg-cta-hover hover:shadow-lg hover:shadow-cta/20 active:scale-95"
          )}
        >
          {product.is_sold_out
            ? t("store.sold_out")
            : added
              ? <><Check size={16} /> {t("store.added")}</>
              : <><Plus size={16} /> {t("store.add_to_cart")}</>
          }
        </button>
      </div>
    </div>
  );
};

interface StoreSection {
  id: string;
  title_en: string; title_ar: string; title_es: string; title_fr: string;
  description_en: string; description_ar: string; description_es: string; description_fr: string;
  enabled: boolean;
  sort_order: number;
  donation: boolean;
}

const Store = () => {
  const { t, language } = useLanguage();
  const { totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<StoreSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, sectionsRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at"),
        supabase.from("store_sections").select("*").order("sort_order"),
      ]);
      if (productsRes.data) {
        setProducts(productsRes.data.map((p) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images as string[] : JSON.parse(p.images as string),
        })));
      }
      if (sectionsRes.data) {
        setSections(sectionsRes.data as StoreSection[]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Build categories from DB sections, falling back to translations for any missing
  const categories = sections.length > 0
    ? sections
        .filter((s) => s.enabled)
        .map((s) => ({
          key: s.id,
          title: (s as any)[`title_${language}`] || s.title_en,
          description: (s as any)[`description_${language}`] || s.description_en,
          donation: s.donation,
        }))
    : [
        { key: "terraria", title: t("store.terraria_title"), description: t("store.terraria_desc"), donation: false },
        { key: "artisan", title: t("store.artisan_title"), description: t("store.artisan_desc"), donation: false },
        { key: "traveler", title: t("store.traveler_title"), description: t("store.traveler_desc"), donation: true },
        { key: "student", title: t("store.student_title"), description: t("store.student_desc"), donation: false },
        { key: "amazigh", title: t("store.amazigh_title"), description: t("store.amazigh_desc"), donation: false },
      ];

  return (
    <main className="min-h-screen bg-background">
      <SEOHead title="Pottery Products" description="Handmade pottery pieces by Terraria Workshops. Available with cash on delivery (COD) or pick-up in Tétouan." path="/store" />
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
          <p className="text-sm text-muted-foreground mt-4 font-medium">💵 Cash on delivery / pay on pickup — No online payment.</p>
          <div className="w-16 h-1 bg-cta rounded-full mx-auto mt-6" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const catProducts = products.filter((p) => p.category === cat.key);
            if (catProducts.length === 0) return null;
            const Icon = categoryIcons[cat.key] || Sparkles;

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
          })
        )}

        {/* Bottom message */}
        <div className="mt-8 mb-4 text-center py-12 px-6 rounded-3xl bg-card border-2 border-border/40">
          <p className="text-lg md:text-xl font-medium text-foreground/80 italic leading-relaxed max-w-xl mx-auto">
            "Every piece tells a story."
          </p>
          <div className="w-12 h-1 bg-cta rounded-full mx-auto mt-4" />
          <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-bold">Terraria Workshops</p>
        </div>

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
