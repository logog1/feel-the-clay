import { Clock, Infinity, Package, Coffee, Heart, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const DetailsSection = () => {
  const { t } = useLanguage();
  const details = [
    { icon: Clock, title: t("details.3h"), description: t("details.3h_desc") },
    { icon: Infinity, title: t("details.unlimited"), description: t("details.unlimited_desc") },
    { icon: Package, title: t("details.materials"), description: t("details.materials_desc") },
    { icon: Coffee, title: t("details.drink"), description: t("details.drink_desc") },
    { icon: Heart, title: t("details.beginner"), description: t("details.beginner_desc") },
    { icon: Users, title: t("details.group"), description: t("details.group_desc") },
  ];

  return (
    <section className="py-12 md:py-16 bg-sand-light">
      <div className="container-narrow">
        <h2 className="text-xl md:text-2xl font-medium text-center mb-8">{t("details.title")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {details.map((detail, index) => (
            <div key={index} className="bg-sand/60 rounded-2xl p-5 md:p-6 text-center space-y-3">
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto rounded-full bg-cta/20 flex items-center justify-center">
                <detail.icon className="w-5 h-5 md:w-6 md:h-6 text-cta" />
              </div>
              <h3 className="text-sm md:text-base font-medium text-terracotta">{detail.title}</h3>
              <p className="text-xs md:text-sm text-foreground/60">{detail.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetailsSection;
