import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import ProcessSection from "@/components/ProcessSection";
import { useSiteImages } from "@/hooks/use-site-images";
import { useSiteGallery } from "@/hooks/use-site-galleries";
import { useWorkshopConfig } from "@/hooks/use-workshop-config";
import workshop5 from "@/assets/workshop-5.jpg";
import workshop6 from "@/assets/workshop-6.jpg";
import workshop8 from "@/assets/workshop-8.jpg";
import workshop10 from "@/assets/workshop-10.jpg";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Handbuilding Pottery Workshop in Tétouan",
  description: "Clay handbuilding workshop for all levels in Tétouan, Morocco. Shape pottery by hand with traditional techniques. All materials and tea included.",
  provider: {
    "@type": "Organization",
    name: "Terraria Workshops",
    url: "https://www.terrariaworkshops.com",
  },
  url: "https://www.terrariaworkshops.com/workshop/handbuilding",
  courseMode: "onsite",
  location: {
    "@type": "Place",
    name: "Terraria Workshops",
    address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
  },
  offers: {
    "@type": "Offer",
    price: "100",
    priceCurrency: "MAD",
    availability: "https://schema.org/InStock",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "onsite",
    courseWorkload: "PT1H30M",
  },
};

const HandbuildingWorkshop = () => {
  const { t, language } = useLanguage();
  const siteImages = useSiteImages(["image_workshop_handbuilding"]);
  const managedGallery = useSiteGallery("gallery_workshop_handbuilding");
  const { config } = useWorkshopConfig("handbuilding");
  const heroImg = siteImages["image_workshop_handbuilding"];
  const lang = language as "en" | "ar" | "es" | "fr";

  const defaultImages = [workshop5, workshop6, workshop8, workshop10];
  const galleryImages = managedGallery && managedGallery.length > 0
    ? managedGallery.map((g) => g.url)
    : defaultImages;
  const images = heroImg ? [heroImg, ...galleryImages] : galleryImages;

  const workshop = {
    title: config?.title?.[lang] || t("hand.title"),
    tagline: config?.tagline?.[lang] || t("hand.tagline"),
    price: config?.promo_enabled && config?.promo_price ? config.promo_price : (config?.price || t("hand.price")),
    originalPrice: config?.promo_enabled ? config?.price : undefined,
    promoLabel: config?.promo_enabled ? config?.promo_label : undefined,
    duration: config?.duration?.[lang] || t("hand.duration"),
    drink: config?.drink?.[lang] || t("hand.drink"),
    location: config?.location?.[lang] || t("hand.location"),
    popular: config?.is_popular ?? true,
    description: config?.descriptions?.length
      ? config.descriptions.map((d) => d[lang] || d.en).filter(Boolean)
      : [t("hand.desc1"), t("hand.desc2")],
    highlights: config?.highlights?.length
      ? config.highlights.map((h) => h[lang] || h.en).filter(Boolean)
      : [t("hand.h1"), t("hand.h2"), t("hand.h3"), t("hand.h4"), t("hand.h5"), t("hand.h6"), t("hand.h7")],
    images,
    unavailable: config ? !config.is_available : false,
  };

  return (
    <>
      <SEOHead
        title="Handbuilding Pottery Workshop in Tétouan"
        description="Clay handbuilding workshop for all levels in Tétouan, Morocco. Shape pottery by hand with traditional techniques. All materials and tea included."
        path="/workshop/handbuilding"
        jsonLd={jsonLd}
      />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/handbuilding" />
      <ProcessSection />
    </>
  );
};

export default HandbuildingWorkshop;
