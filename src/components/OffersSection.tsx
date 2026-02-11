import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import workshop2 from "@/assets/workshop-2.jpg";
import workshop7 from "@/assets/workshop-7.jpg";
import workshop17 from "@/assets/workshop-17.jpg";

const OffersSection = () => {
  const { t } = useLanguage();

  const offers = [
    { title: t("offers.pottery"), image: workshop2, link: "/workshop/pottery-experience" },
    { title: t("offers.handbuilding"), image: workshop7, link: "/workshop/handbuilding", popular: true },
    { title: t("offers.embroidery"), image: workshop17, link: "/workshop/embroidery" },
  ];

  return (
    <section id="offers" className="py-16 md:py-24 bg-sand-light/30">
      <div className="container-wide px-6">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-cta font-medium">{t("offers.title")}</span>
          <div className="w-8 h-px bg-cta mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {offers.map((offer, index) => (
            <Link
              key={offer.title}
              to={offer.link}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] block hover:shadow-2xl transition-shadow duration-500"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {offer.popular && (
                <span className="absolute top-3 start-3 z-10 bg-cta text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md animate-pulse">
                  {t("offers.popular")}
                </span>
              )}
              <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                <h3 className="text-white text-lg md:text-xl font-medium leading-tight">{offer.title}</h3>
                <p className="text-white/60 text-xs mt-2 group-hover:text-white transition-colors flex items-center gap-1">
                  {t("offers.tap")}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Store CTA - enhanced */}
        <div className="mt-14 text-center">
          <Link
            to="/store"
            className="group inline-flex items-center gap-3 bg-terracotta text-primary-foreground px-8 py-4 rounded-full text-sm font-semibold hover:bg-terracotta-light transition-all duration-300 hover:shadow-xl hover:shadow-terracotta/20 hover:scale-105"
          >
            <ShoppingBag size={18} />
            <span>🏺 {t("offers.store")}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
