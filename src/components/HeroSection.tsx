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
      <div className="absolute inset-0 bg-cover bg-no-repeat bg-center grayscale-[30%] contrast-125" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="absolute inset-0 bg-background/70 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background/90" />

      <div className="container-narrow relative z-10">
        <div className="space-y-6 animate-fade-up">
          {/* Mono label */}
          <span className="mono-label text-cta">Pottery Workshop · Tétouan</span>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] text-foreground">
            {t("hero.title1")}{" "}
            <span className="relative inline-block text-cta">
              {t("hero.highlight")}
              <span className="absolute -bottom-1 left-0 w-full h-[4px] bg-cta animate-underline-grow origin-left" />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 font-light max-w-md leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Tetouan city highlight — brutalist card */}
        <div className="mt-10 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 border-foreground flex-shrink-0">
            <img src={tetouanCity} alt="Tetouan, Morocco" className="w-full h-full object-cover grayscale-[20%]" />
          </div>
          <div>
            <p className="mono-label text-foreground">{t("hero.city_name")}</p>
            <p className="text-sm text-foreground/50 mt-1">{t("hero.city_desc")}</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <a href="#about" onClick={(e) => { e.preventDefault(); document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" }); }} className="flex flex-col items-center gap-1 text-foreground/30 hover:text-foreground/60 transition-colors">
          <span className="mono-label">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-foreground" />
    </section>
  );
};

export default HeroSection;
