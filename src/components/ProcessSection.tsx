import { useLanguage } from "@/i18n/LanguageContext";

const ProcessSection = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-20">
      <div className="container-narrow">
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-medium">{t("process.title")}</h2>
          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>{t("process.text")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
