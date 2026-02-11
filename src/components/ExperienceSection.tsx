import { useLanguage } from "@/i18n/LanguageContext";

const ExperienceSection = () => {
  const { t } = useLanguage();
  const experiences = [
    { text: t("exp.1"), number: "01" },
    { text: t("exp.2"), number: "02" },
    { text: t("exp.3"), number: "03" },
  ];

  return (
    <section id="experience" className="py-16 md:py-24 bg-gradient-to-b from-transparent via-sand/30 to-transparent">
      <div className="container-narrow">
        <div className="mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-cta font-medium">{t("exp.label")}</span>
          <h2 className="text-3xl md:text-4xl font-light mt-3">
            {t("exp.title")}{" "}
            <span className="font-semibold text-terracotta italic">{t("exp.title_highlight")}</span>
          </h2>
        </div>
        <div className="space-y-4">
          {experiences.map((experience, index) => (
            <div key={index} className="group relative" style={{ marginInlineStart: `${index * 8}%` }}>
              <div className="flex items-stretch gap-4 md:gap-6 p-5 md:p-6 bg-background/80 backdrop-blur-sm rounded-2xl border border-terracotta/10 hover:border-cta/30 transition-all duration-500 hover:shadow-lg hover:shadow-cta/5">
                <div className="flex-shrink-0 w-12 md:w-16 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-cta/20 group-hover:text-cta/40 transition-colors">{experience.number}</span>
                </div>
                <div className="w-px bg-gradient-to-b from-transparent via-terracotta/30 to-transparent" />
                <div className="flex items-center flex-1">
                  <p className="text-lg md:text-xl text-foreground/80 group-hover:text-foreground transition-colors">{experience.text}</p>
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
