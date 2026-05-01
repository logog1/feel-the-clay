import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import ProcessSection from "@/components/ProcessSection";
import { useSiteImages } from "@/hooks/use-site-images";
import { useSiteGallery } from "@/hooks/use-site-galleries";
import { useWorkshopConfig } from "@/hooks/use-workshop-config";
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
    "@id": "https://www.terrariaworkshops.com/#organization",
    name: "Terraria Workshops",
    url: "https://www.terrariaworkshops.com",
    sameAs: ["https://www.instagram.com/terraria_workshops"],
  },
  url: "https://www.terrariaworkshops.com/workshop/pottery-experience",
  inLanguage: ["en", "fr", "es", "ar"],
  educationalLevel: "Beginner",
  teaches: "Pottery wheel throwing, centering clay, shaping a bowl or cup",
  courseMode: "onsite",
  location: {
    "@type": "Place",
    name: "Terraria Workshops",
    address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressRegion: "Tanger-Tétouan-Al Hoceïma", addressCountry: "MA" },
  },
  offers: {
    "@type": "Offer",
    price: "150",
    priceCurrency: "MAD",
    availability: "https://schema.org/InStock",
    url: "https://www.terrariaworkshops.com/workshop/pottery-experience",
    category: "Workshop",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "onsite",
    courseWorkload: "PT2H",
    inLanguage: ["en", "fr", "es", "ar"],
    location: {
      "@type": "Place",
      name: "Terraria Workshops",
      address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
    },
  },
};

const PotteryExperience = () => {
  const { t, language } = useLanguage();
  const siteImages = useSiteImages(["image_workshop_pottery"]);
  const managedGallery = useSiteGallery("gallery_workshop_pottery");
  const { config } = useWorkshopConfig("pottery");
  const heroImg = siteImages["image_workshop_pottery"];
  const lang = language as "en" | "ar" | "es" | "fr";

  const defaultImages = [potteryEntrance, potteryGirls, potteryMasters, potteryClaySource];
  const galleryImages = managedGallery && managedGallery.length > 0
    ? managedGallery.map((g) => g.url)
    : defaultImages;
  const images = heroImg ? [heroImg, ...galleryImages] : galleryImages;

  const workshop = {
    title: config?.title?.[lang] || t("pottery.title"),
    tagline: config?.tagline?.[lang] || t("pottery.tagline"),
    price: config?.promo_enabled && config?.promo_price ? config.promo_price : (config?.price || t("pottery.price")),
    originalPrice: config?.promo_enabled ? config?.price : undefined,
    promoLabel: config?.promo_enabled ? config?.promo_label : undefined,
    duration: config?.duration?.[lang] || t("pottery.duration"),
    drink: config?.drink?.[lang] || t("pottery.drink"),
    description: config?.descriptions?.length
      ? config.descriptions.map((d) => d[lang] || d.en).filter(Boolean)
      : [t("pottery.desc1"), t("pottery.desc2")],
    highlights: config?.highlights?.length
      ? config.highlights.map((h) => h[lang] || h.en).filter(Boolean)
      : [t("pottery.h1"), t("pottery.h2"), t("pottery.h3"), t("pottery.h4"), t("pottery.h5"), t("pottery.h6")],
    images,
    unavailable: config ? !config.is_available : false,
    popular: config?.is_popular || false,
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
