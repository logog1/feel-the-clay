import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

const ExperienceSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.15);
  const experiences = [
    { text: t("exp.1"), number: "01" },
    { text: t("exp.2"), number: "02" },
    { text: t("exp.3"), number: "03" },
  ];

  return (
    <section id="experience" className="py-14 md:py-24 bg-gradient-to-b from-transparent via-sand/30 to-transparent">
      <div ref={ref} className="container-narrow">
        <div className={cn("mb-10 md:mb-14 transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <span className="text-xs uppercase tracking-[0.3em] text-cta font-medium">{t("exp.label")}</span>
          <h2 className="text-2xl md:text-4xl font-light mt-3">
            {t("exp.title")}{" "}
            <span className="font-semibold text-terracotta italic">{t("exp.title_highlight")}</span>
          </h2>
        </div>
        <div className="space-y-3 md:space-y-4">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className={cn(
                "group relative transition-all duration-700",
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              )}
              style={{ transitionDelay: `${(index + 1) * 150}ms`, marginInlineStart: `${index * 6}%` }}
            >
              <div className="flex items-stretch gap-4 md:gap-6 p-4 md:p-6 glass-card hover:border-cta/30 transition-all duration-500 hover:shadow-lg hover:shadow-cta/5 hover:-translate-y-0.5">
                <div className="flex-shrink-0 w-10 md:w-14 flex items-center justify-center">
                  <span className="text-2xl md:text-4xl font-bold text-cta/20 group-hover:text-cta/50 transition-colors duration-500">{experience.number}</span>
                </div>
                <div className="w-px bg-gradient-to-b from-transparent via-terracotta/30 to-transparent" />
                <div className="flex items-center flex-1">
                  <p className="text-base md:text-xl text-foreground/80 group-hover:text-foreground transition-colors duration-300">{experience.text}</p>
                </div>
                <div className="absolute end-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cta scale-0 group-hover:scale-100 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
