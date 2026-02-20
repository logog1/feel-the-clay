import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Star, Clock, Infinity, Package, Coffee, Heart, Users, Ban } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import workshop2 from "@/assets/workshop-2.jpg";
import handbuildingHero from "@/assets/handbuilding-hero.jpg";
import embrHero from "@/assets/embr-hero.jpg";

// Fallback images per workshop type
const fallbackImages: Record<string, string> = {
  pottery: workshop2,
  handbuilding: handbuildingHero,
  embroidery: embrHero,
};

const OffersSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  // Fetch first product image per relevant category from the DB
  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await supabase
        .from("products")
        .select("category, images")
        .in("category", ["terraria", "artisan", "traveler"])
        .order("created_at", { ascending: true });

      if (!data) return;

      const map: Record<string, string> = {};
      for (const prod of data) {
        const raw = prod.images;
        const imgs: string[] = Array.isArray(raw)
          ? raw.map(String)
          : JSON.parse(typeof raw === "string" ? raw : "[]");
        const url = imgs.find((u) => typeof u === "string" && u.startsWith("http"));
        if (url && !map[prod.category]) {
          map[prod.category] = url;
        }
      }
      setProductImages(map);
    };
    fetchImages();
  }, []);

  const details = [
    { icon: Clock, label: t("details.3h") },
    { icon: Infinity, label: t("details.unlimited") },
    { icon: Package, label: t("details.materials") },
    { icon: Coffee, label: t("details.drink") },
    { icon: Heart, label: t("details.beginner") },
    { icon: Users, label: t("details.group") },
  ];

  const offers = [
    {
      title: t("offers.handbuilding"),
      image: productImages["artisan"] || fallbackImages.handbuilding,
      link: "/workshop/handbuilding",
      popular: true,
    },
    {
      title: t("offers.pottery"),
      image: productImages["terraria"] || fallbackImages.pottery,
      link: "/workshop/pottery-experience",
    },
    {
      title: t("offers.embroidery"),
      image: fallbackImages.embroidery,
      link: "/workshop/embroidery",
      unavailable: true,
    },
  ];

  return (
    <section id="offers" ref={ref} className="py-14 md:py-24 bg-sand-light/30">
      <div className="container-wide px-5 sm:px-6">
        <div className={cn("text-center mb-10 transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <span className="text-xs uppercase tracking-[0.3em] text-cta font-medium">{t("offers.title")}</span>
          <div className="w-8 h-px bg-cta mx-auto mt-4" />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:gap-5">
          {offers.map((offer, index) => (
            <div
              key={offer.title}
              className={cn(
                "flex-shrink-0 w-[68vw] sm:w-[50vw] md:w-auto snap-start rounded-2xl overflow-hidden bg-card border border-border/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <Link to={offer.link} className="group relative block">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className={cn("w-full h-full object-cover transition-transform duration-700", offer.unavailable ? "grayscale-[40%]" : "group-hover:scale-110")}
                    loading="lazy"
                  />
                  {offer.unavailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rotate-[-25deg] border-4 border-destructive/80 rounded-lg px-4 py-2 bg-background/10 backdrop-blur-[2px]">
                        <span className="text-destructive font-black text-lg md:text-xl tracking-[0.2em] uppercase drop-shadow-lg">Coming Soon</span>
                      </div>
                    </div>
                  )}
                </div>
                {offer.popular && (
                  <span className="absolute top-3 start-3 z-10 bg-cta text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {t("offers.popular")}
                  </span>
                )}
                <div className="bg-foreground/90 backdrop-blur-sm px-4 py-3.5 flex items-center justify-between gap-2">
                  <h3 className="text-background text-sm md:text-base font-medium leading-tight truncate">
                    {offer.title}
                  </h3>
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-cta group-hover:gap-2 transition-all duration-300">
                    {t("offers.learn_more")}
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>

              <div className="grid grid-cols-3 gap-px bg-border/20 p-3">
                {details.map((detail, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 py-2 px-1">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-cta/10 flex items-center justify-center">
                      <detail.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-cta" />
                    </div>
                    <span className="text-[9px] md:text-xs text-foreground/60 text-center leading-tight font-medium">{detail.label}</span>
                  </div>
                ))}
              </div>

              <div className="px-3 pb-3 pt-1 mt-auto">
                <Link
                  to={offer.link}
                  className="block w-full text-center bg-cta text-primary-foreground text-sm font-semibold py-2.5 rounded-full hover:bg-cta-hover transition-all duration-300 active:scale-95 shadow-md shadow-cta/20"
                >
                  {t("offers.book_now")}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className={cn("mt-12 text-center transition-all duration-700 delay-500", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <Link
            to="/store"
            className="group inline-flex items-center gap-3 bg-terracotta text-primary-foreground px-8 py-4 rounded-full text-sm font-semibold hover:bg-terracotta-light transition-all duration-300 hover:shadow-xl hover:shadow-terracotta/20 hover:scale-105 active:scale-95"
          >
            <ShoppingBag size={18} />
            <span>{t("offers.store")}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
