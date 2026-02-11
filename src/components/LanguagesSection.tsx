import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const LanguagesSection = () => {
  const { t } = useLanguage();
  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="flex items-center justify-center gap-4 text-foreground/80">
          <Globe className="w-5 h-5 text-cta" />
          <p className="text-lg">
            {t("languages.text")} <span className="font-medium">{t("languages.arabic")}</span> & <span className="font-medium">{t("languages.english")}</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LanguagesSection;
