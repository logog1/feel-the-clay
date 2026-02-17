import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import workshop2 from "@/assets/workshop-2.jpg";
import workshop7 from "@/assets/workshop-7.jpg";
import workshop17 from "@/assets/workshop-17.jpg";

const OffersSection = () => {
  const { t } = useLanguage();

  const offers = [
    { title: t("offers.handbuilding"), image: workshop7, link: "/workshop/handbuilding", popular: true },
    { title: t("offers.pottery"), image: workshop2, link: "/workshop/pottery-experience" },
    { title: t("offers.embroidery"), image: workshop17, link: "/workshop/embroidery" },
  ];

  return (
    <section id="offers" className="py-16 md:py-24 bg-sand-light/30">
      <div className="container-wide px-5 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-cta font-medium">{t("offers.title")}</span>
          <div className="w-8 h-px bg-cta mx-auto mt-4" />
        </div>

        {/* Horizontal scrolling on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {offers.map((offer) => (
            <Link
              key={offer.title}
              to={offer.link}
              className="group relative flex-shrink-0 w-[75vw] sm:w-[60vw] md:w-auto snap-center rounded-2xl overflow-hidden block hover:shadow-2xl transition-shadow duration-500"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </div>

              {/* Popular badge */}
              {offer.popular && (
                <span className="absolute top-3 start-3 z-10 bg-cta text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {t("offers.popular")}
                </span>
              )}

              {/* Bottom belt */}
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
          ))}
        </div>

        {/* Store CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/store"
            className="group inline-flex items-center gap-3 bg-terracotta text-primary-foreground px-8 py-4 rounded-full text-sm font-semibold hover:bg-terracotta-light transition-all duration-300 hover:shadow-xl hover:shadow-terracotta/20 hover:scale-105"
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
