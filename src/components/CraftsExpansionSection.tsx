import { useLanguage } from "@/i18n/LanguageContext";

const CraftsExpansionSection = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-20 bg-sand-light/50">
      <div className="container-narrow">
        <div className="space-y-4 text-center max-w-md mx-auto">
          <p className="text-foreground/80 leading-relaxed">{t("crafts.text")}</p>
        </div>
      </div>
    </section>
  );
};

export default CraftsExpansionSection;
