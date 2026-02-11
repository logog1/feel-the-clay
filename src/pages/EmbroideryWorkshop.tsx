import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import workshop11 from "@/assets/workshop-11.jpg";
import workshop12 from "@/assets/workshop-12.jpg";
import workshop13 from "@/assets/workshop-13.jpg";
import workshop14 from "@/assets/workshop-14.jpg";

const EmbroideryWorkshop = () => {
  const { t } = useLanguage();
  const workshop = {
    title: t("embr.title"),
    tagline: t("embr.tagline"),
    price: t("embr.price"),
    duration: t("embr.duration"),
    drink: t("embr.drink"),
    location: t("embr.location"),
    description: [t("embr.desc1"), t("embr.desc2")],
    highlights: [t("embr.h1"), t("embr.h2"), t("embr.h3"), t("embr.h4"), t("embr.h5"), t("embr.h6"), t("embr.h7")],
    images: [workshop11, workshop12, workshop13, workshop14],
  };

  return <WorkshopPageLayout workshop={workshop} currentPath="/workshop/embroidery" />;
};

export default EmbroideryWorkshop;
