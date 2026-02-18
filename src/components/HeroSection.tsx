import heroBg from "@/assets/hero-bg.jpg";
import tetouanCity from "@/assets/tetouan-city.jpg";
import { useLanguage } from "@/i18n/LanguageContext";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="hero" className="min-h-[85vh] md:min-h-screen flex flex-col justify-end md:justify-center section-padding pb-20 md:pb-0 pt-24 md:pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 md:hidden bg-gradient-to-b from-transparent via-transparent to-background" style={{ top: '60%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/80" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-cta/30 rounded-full animate-gentle-float" />
        <div className="absolute top-[25%] right-[15%] w-3 h-3 bg-terracotta/20 rounded-full animate-gentle-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[30%] left-[20%] w-1.5 h-1.5 bg-cta/40 rounded-full animate-gentle-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[25%] w-1 h-1 bg-terracotta/30 rounded-full animate-gentle-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container-narrow relative z-10">
        <div className="space-y-6 animate-fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] text-balance text-foreground drop-shadow-sm">
            {t("hero.title1")}{" "}
            <span className="relative inline-block">
              {t("hero.highlight")}
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-cta rounded-full animate-underline-grow origin-left" style={{ transformOrigin: 'left center' }} />
            </span>
          </h1>
          <p className="text-base md:text-xl text-foreground/80 font-light max-w-sm drop-shadow-sm leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Tetouan city highlight */}
        <div className="mt-10 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl flex-shrink-0 ring-2 ring-cta/20 ring-offset-2 ring-offset-background/50">
            <img src={tetouanCity} alt="Tetouan, Morocco" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t("hero.city_name")}</p>
            <p className="text-xs text-foreground/60">{t("hero.city_desc")}</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '1.2s' }}>
        <a href="#about" onClick={(e) => { e.preventDefault(); document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" }); }} className="flex flex-col items-center gap-1 text-foreground/40 hover:text-foreground/70 transition-colors">
          <span className="text-[10px] uppercase tracking-widest font-medium">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-gentle-float" />
        </a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terracotta/30 to-transparent" />
    </section>
  );
};

export default HeroSection;
