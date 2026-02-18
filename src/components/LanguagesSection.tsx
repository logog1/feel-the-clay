import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

const LanguagesSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section ref={ref} className="py-10 md:py-14">
      <div className="container-narrow">
        <div className={cn(
          "flex items-center justify-center gap-4 text-foreground/80 glass-card p-5 md:p-6 transition-all duration-700",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <div className="w-10 h-10 rounded-full bg-cta/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-cta" />
          </div>
          <p className="text-base md:text-lg">
            {t("languages.text")} <span className="font-semibold text-foreground">{t("languages.arabic")}</span> & <span className="font-semibold text-foreground">{t("languages.english")}</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LanguagesSection;
