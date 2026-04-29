import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { useSiteImages } from "@/hooks/use-site-images";
import { useWorkshopConfigs } from "@/hooks/use-workshop-config";
import handbuildingHero from "@/assets/handbuilding-hero.jpg";
import embrHero from "@/assets/embr-hero.jpg";
import potteryGirls from "@/assets/pottery-girls.jpg";
import tetouanCity from "@/assets/tetouan-city.jpg";

// Fallback images per workshop type
const fallbackImages: Record<string, string> = {
  pottery: potteryGirls,
  handbuilding: handbuildingHero,
  embroidery: embrHero,
};

const OffersSection = () => {
  const { t, language } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const siteImages = useSiteImages(["image_workshop_handbuilding", "image_workshop_pottery", "image_workshop_embroidery"]);
  const { configs } = useWorkshopConfigs();
  const lang = language as "en" | "ar" | "es" | "fr";

  const handConfig = configs.handbuilding;
  const potteryConfig = configs.pottery;
  const embrConfig = configs.embroidery;

  const offers = [
    {
      title: handConfig?.title?.[lang] || t("offers.handbuilding"),
      image: siteImages["image_workshop_handbuilding"] || fallbackImages.handbuilding,
      link: "/workshop/handbuilding",
      popular: handConfig?.is_popular ?? true,
      unavailable: handConfig ? !handConfig.is_available : false,
      promoLabel: handConfig?.promo_enabled ? handConfig.promo_label : undefined,
      price: handConfig?.promo_enabled && handConfig?.promo_price ? handConfig.promo_price : (handConfig?.price || t("hand.price")),
    },
    {
      title: potteryConfig?.title?.[lang] || t("offers.pottery"),
      image: siteImages["image_workshop_pottery"] || fallbackImages.pottery,
      link: "/workshop/pottery-experience",
      popular: potteryConfig?.is_popular || false,
      unavailable: potteryConfig ? !potteryConfig.is_available : false,
      promoLabel: potteryConfig?.promo_enabled ? potteryConfig.promo_label : undefined,
      price: potteryConfig?.promo_enabled && potteryConfig?.promo_price ? potteryConfig.promo_price : (potteryConfig?.price || t("pottery.price")),
    },
    {
      title: embrConfig?.title?.[lang] || t("offers.embroidery"),
      image: siteImages["image_workshop_embroidery"] || fallbackImages.embroidery,
      link: "/workshop/embroidery",
      unavailable: embrConfig ? !embrConfig.is_available : true,
      promoLabel: embrConfig?.promo_enabled ? embrConfig.promo_label : undefined,
      price: embrConfig?.promo_enabled && embrConfig?.promo_price ? embrConfig.promo_price : (embrConfig?.price || t("embr.price")),
    },
    {
      title: "EXODAYA",
      subtitle: "Art & Culture Residency",
      image: tetouanCity,
      link: "/exodaya",
      unavailable: false,
      promoLabel: "Exclusive",
      price: "Price on request",
      exclusive: true,
    },
  ];

  return (
    <section id="offers" ref={ref} className="py-14 md:py-24 bg-sand-light/30">
      <div className="container-wide px-5 sm:px-6">
        <div className={cn("text-center mb-10 transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <span className="text-xs uppercase tracking-[0.3em] text-cta font-medium">{t("offers.title")}</span>
          <div className="w-8 h-px bg-cta mx-auto mt-4" />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0 md:gap-5">
          {offers.map((offer, index) => (
            <div
              key={offer.title}
              className={cn(
                "flex-shrink-0 w-[68vw] sm:w-[46vw] md:w-auto snap-start overflow-hidden border border-border/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col",
                offer.exclusive ? "rounded-2xl bg-foreground text-background" : "rounded-2xl bg-card text-card-foreground",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <Link to={offer.link} className="group relative block">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className={cn("w-full h-full transition-transform duration-700", offer.exclusive ? "object-cover opacity-85" : "object-contain", offer.unavailable ? "grayscale-[40%]" : "group-hover:scale-105")}
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
                  <span className="absolute top-3 start-3 z-10 bg-cta text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {t("offers.popular")}
                  </span>
                )}
                {offer.promoLabel && (
                  <span className={cn("absolute top-3 end-3 z-10 text-xs font-bold px-3 py-1 rounded-full shadow-md", offer.exclusive ? "bg-background text-foreground" : "bg-destructive text-destructive-foreground")}>
                    {offer.promoLabel}
                  </span>
                )}
              </Link>

              <div className="p-4 mt-auto space-y-4">
                <div className="space-y-1">
                  {offer.subtitle && <p className="text-xs uppercase tracking-[0.18em] opacity-70">{offer.subtitle}</p>}
                  <h3 className="text-base md:text-lg font-semibold leading-tight">{offer.title}</h3>
                  <p className={cn("text-sm font-medium", offer.exclusive ? "text-background/75" : "text-muted-foreground")}>{offer.price}</p>
                </div>
                <Link
                  to={offer.link}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-full transition-all duration-300 active:scale-95 shadow-md",
                    offer.exclusive ? "bg-background text-foreground hover:bg-background/90" : "bg-cta text-primary-foreground hover:bg-cta-hover shadow-cta/20"
                  )}
                >
                  {offer.exclusive ? t("offers.learn_more") : t("offers.book_now")}
                  <ArrowRight size={14} />
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
