import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import potteryEntrance from "@/assets/pottery-entrance.jpg";
import potteryGirls from "@/assets/pottery-girls.jpg";
import potteryMasters from "@/assets/pottery-masters.jpg";
import potteryClaySource from "@/assets/pottery-clay-source.jpg";

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
    // entrance = hero (main), then gallery: girls, masters, clay source, + social story images
    images: [potteryEntrance, potteryGirls, potteryMasters, potteryClaySource],
  };

  return (
    <>
      <SEOHead title="Pottery Wheel Experience" description="Try a 3-hour pottery wheel session in Tetouan. No experience needed — create your own ceramic piece." path="/workshop/pottery-experience" />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/pottery-experience" />
    </>
  );
};

export default PotteryExperience;
