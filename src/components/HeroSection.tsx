import heroBg from "@/assets/hero-bg.jpg";
import tetouanCity from "@/assets/tetouan-city.jpg";
import { useLanguage } from "@/i18n/LanguageContext";
import { ChevronDown } from "lucide-react";
import { useSiteImages } from "@/hooks/use-site-images";

const HeroSection = () => {
  const { t } = useLanguage();
  const siteImages = useSiteImages(["image_hero_bg"]);
  const bgImage = siteImages["image_hero_bg"] || heroBg;

  return (
    <section id="hero" className="min-h-[85vh] md:min-h-screen flex flex-col justify-end md:justify-center section-padding pb-20 md:pb-0 pt-24 md:pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-background/80" />

      <div className="container-narrow relative z-10">
        <div className="space-y-6 animate-fade-up">
          <span className="mono-label text-cta animate-fade-in" style={{ animationDelay: '0.2s' }}>Pottery Workshop · Tétouan</span>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-semibold leading-[0.95] text-primary-foreground">
            {t("hero.title1")}{" "}
            <span className="relative inline-block text-cta">
              {t("hero.highlight")}
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-cta rounded-full animate-underline-grow origin-left" />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 font-light max-w-md leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Tetouan city highlight */}
        <div className="mt-10 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="img-hover w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
            <img src={tetouanCity} alt="Tetouan, Morocco" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="mono-label text-primary-foreground">{t("hero.city_name")}</p>
            <p className="text-sm text-primary-foreground/60 mt-1">{t("hero.city_desc")}</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <a href="#about" onClick={(e) => { e.preventDefault(); document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" }); }} className="flex flex-col items-center gap-1 text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors duration-300">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-gentle-float" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
