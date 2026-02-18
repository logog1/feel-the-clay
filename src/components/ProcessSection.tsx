import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

const ProcessSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-14 md:py-20">
      <div className="container-narrow">
        <div className={cn("space-y-6 transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-cta rounded-full" />
            <h2 className="text-xl md:text-2xl font-medium">{t("process.title")}</h2>
          </div>
          <div className="space-y-4 text-foreground/80 leading-relaxed pl-5 border-l-2 border-border/50">
            <p className="text-sm md:text-base">{t("process.text")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
