import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import handbuildingHero from "@/assets/handbuilding-hero.jpg";
import workshop5 from "@/assets/workshop-5.jpg";
import workshop6 from "@/assets/workshop-6.jpg";
import workshop8 from "@/assets/workshop-8.jpg";
import workshop10 from "@/assets/workshop-10.jpg";

const HandbuildingWorkshop = () => {
  const { t } = useLanguage();
  const workshop = {
    title: t("hand.title"),
    tagline: t("hand.tagline"),
    price: t("hand.price"),
    duration: t("hand.duration"),
    drink: t("hand.drink"),
    location: t("hand.location"),
    popular: true,
    description: [t("hand.desc1"), t("hand.desc2")],
    highlights: [t("hand.h1"), t("hand.h2"), t("hand.h3"), t("hand.h4"), t("hand.h5"), t("hand.h6"), t("hand.h7")],
    images: [handbuildingHero, workshop5, workshop6, workshop8, workshop10],
  };

  return (
    <>
      <SEOHead title="Handbuilding Workshop" description="Shape clay with your hands in a relaxing 3-hour handbuilding workshop in Tetouan, Morocco." path="/workshop/handbuilding" />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/handbuilding" />
    </>
  );
};

export default HandbuildingWorkshop;
