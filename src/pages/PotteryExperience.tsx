import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import ProcessSection from "@/components/ProcessSection";
import { useSiteImages } from "@/hooks/use-site-images";
import { useSiteGallery } from "@/hooks/use-site-galleries";
import potteryEntrance from "@/assets/pottery-entrance.jpg";
import potteryGirls from "@/assets/pottery-girls.jpg";
import potteryMasters from "@/assets/pottery-masters.jpg";
import potteryClaySource from "@/assets/pottery-clay-source.jpg";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Pottery Wheel Workshop in Tétouan",
  description: "Hands-on pottery wheel throwing workshop for beginners and creatives in Tétouan, Morocco. All materials and tea included.",
  provider: {
    "@type": "Organization",
    name: "Terraria Workshops",
    url: "https://www.terrariaworkshops.com",
  },
  url: "https://www.terrariaworkshops.com/workshop/pottery-experience",
  courseMode: "onsite",
  location: {
    "@type": "Place",
    name: "Terraria Workshops",
    address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
  },
  offers: {
    "@type": "Offer",
    price: "150",
    priceCurrency: "MAD",
    availability: "https://schema.org/InStock",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "onsite",
    courseWorkload: "PT2H",
  },
};

const PotteryExperience = () => {
  const { t } = useLanguage();
  const siteImages = useSiteImages(["image_workshop_pottery"]);
  const managedGallery = useSiteGallery("gallery_workshop_pottery");
  const heroImg = siteImages["image_workshop_pottery"];

  const defaultImages = [potteryEntrance, potteryGirls, potteryMasters, potteryClaySource];
  const galleryImages = managedGallery && managedGallery.length > 0
    ? managedGallery.map((g) => g.url)
    : defaultImages;
  const images = heroImg ? [heroImg, ...galleryImages] : galleryImages;

  const workshop = {
    title: t("pottery.title"),
    tagline: t("pottery.tagline"),
    price: t("pottery.price"),
    duration: t("pottery.duration"),
    drink: t("pottery.drink"),
    description: [t("pottery.desc1"), t("pottery.desc2")],
    highlights: [t("pottery.h1"), t("pottery.h2"), t("pottery.h3"), t("pottery.h4"), t("pottery.h5"), t("pottery.h6")],
    images,
  };

  return (
    <>
      <SEOHead
        title="Pottery Wheel Workshop in Tétouan"
        description="Hands-on pottery wheel throwing workshop for beginners in Tétouan, Morocco. Learn from local artisans, all materials included. Book your spot today."
        path="/workshop/pottery-experience"
        jsonLd={jsonLd}
      />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/pottery-experience" />
      <ProcessSection />
    </>
  );
};

export default PotteryExperience;