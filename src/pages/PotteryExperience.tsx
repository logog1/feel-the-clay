import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import workshop1 from "@/assets/workshop-1.jpg";
import workshop3 from "@/assets/workshop-3.jpg";
import workshop4 from "@/assets/workshop-4.jpg";
import workshop9 from "@/assets/workshop-9.jpg";

const PotteryExperience = () => {
  const { t } = useLanguage();
  const workshop = {
    title: t("pottery.title"),
    tagline: t("pottery.tagline"),
    price: t("pottery.price"),
    duration: t("pottery.duration"),
    drink: t("pottery.drink"),
    description: [t("pottery.desc1"), t("pottery.desc2")],
    highlights: [t("pottery.h1"), t("pottery.h2"), t("pottery.h3"), t("pottery.h4"), t("pottery.h5"), t("pottery.h6")],
    images: [workshop1, workshop3, workshop4, workshop9],
  };

  return <WorkshopPageLayout workshop={workshop} currentPath="/workshop/pottery-experience" />;
};

export default PotteryExperience;
