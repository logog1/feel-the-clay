import heroBg from "@/assets/hero-bg.jpg";
import tetouanCity from "@/assets/tetouan-city.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section id="hero" className="min-h-[85vh] md:min-h-screen flex flex-col justify-end md:justify-center section-padding pb-16 md:pb-0 pt-24 md:pt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 md:hidden bg-gradient-to-b from-transparent via-transparent to-background" style={{ top: '60%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/80" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-cta/40 rounded-full animate-gentle-float" />
        <div className="absolute top-[25%] right-[15%] w-3 h-3 bg-terracotta/30 rounded-full animate-gentle-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[30%] left-[20%] w-1.5 h-1.5 bg-cta/50 rounded-full animate-gentle-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="container-narrow relative z-10">
        <div className="space-y-6 animate-fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-balance text-foreground drop-shadow-sm">
            {t("hero.title1")}{" "}
            <span className="relative inline-block">
              {t("hero.highlight")}
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-cta rounded-full" />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 font-light max-w-sm drop-shadow-sm">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Tetouan city highlight */}
        <div className="mt-10 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
            <img src={tetouanCity} alt="Tetouan, Morocco" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t("hero.city_name")}</p>
            <p className="text-xs text-foreground/60">{t("hero.city_desc")}</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '1s' }}>
        <div className="w-6 h-10 border-2 border-foreground/40 rounded-full flex justify-center pt-2 backdrop-blur-sm">
          <div className="w-1.5 h-3 bg-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terracotta/30 to-transparent" />
    </section>
  );
};

export default HeroSection;
