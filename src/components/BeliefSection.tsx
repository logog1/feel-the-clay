import { useLanguage } from "@/i18n/LanguageContext";

const BeliefSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-12 md:py-32 relative">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <span className="text-[8rem] md:text-[16rem] font-bold text-terracotta/[0.03] leading-none tracking-tighter">
          {t("belief.bg")}
        </span>
      </div>
      <div className="container-narrow relative">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-cta" />
            <div className="w-2 h-2 rotate-45 border border-cta" />
            <div className="w-12 h-px bg-cta" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground/90 tracking-wide">{t("belief.line1")}</p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-terracotta">{t("belief.line2")}</p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground/90 tracking-wide">{t("belief.line3")}</p>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-3 h-3 rounded-full bg-cta/30" />
            <div className="w-2 h-2 rounded-full bg-terracotta/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-cta/40" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeliefSection;
