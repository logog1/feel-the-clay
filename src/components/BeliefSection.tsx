import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

const BeliefSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section className="py-14 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <span className={cn(
          "text-[7rem] md:text-[14rem] font-bold text-terracotta/[0.03] leading-none tracking-tighter transition-all duration-1000",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-110"
        )}>
          {t("belief.bg")}
        </span>
      </div>
      <div ref={ref} className="container-narrow relative">
        <div className="flex flex-col items-center gap-6">
          <div className={cn("flex items-center gap-3 transition-all duration-700", isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75")}>
            <div className="w-12 h-px bg-cta" />
            <div className="w-2 h-2 rotate-45 border border-cta" />
            <div className="w-12 h-px bg-cta" />
          </div>
          <div className="text-center space-y-3">
            <p className={cn("text-xl md:text-3xl lg:text-4xl font-light text-foreground/90 tracking-wide transition-all duration-700 delay-100", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
              {t("belief.line1")}
            </p>
            <p className={cn("text-2xl md:text-4xl lg:text-5xl font-semibold text-terracotta transition-all duration-700 delay-200", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
              {t("belief.line2")}
            </p>
            <p className={cn("text-xl md:text-3xl lg:text-4xl font-light text-foreground/90 tracking-wide transition-all duration-700 delay-300", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
              {t("belief.line3")}
            </p>
          </div>
          <div className={cn("flex items-center gap-2 mt-4 transition-all duration-700 delay-500", isVisible ? "opacity-100" : "opacity-0")}>
            <div className="w-3 h-3 rounded-full bg-cta/30 animate-gentle-float" />
            <div className="w-2 h-2 rounded-full bg-terracotta/50 animate-gentle-float" style={{ animationDelay: '0.5s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-cta/40 animate-gentle-float" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeliefSection;
