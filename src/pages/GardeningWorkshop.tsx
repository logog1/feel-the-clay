import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useWorkshopConfig } from "@/hooks/use-workshop-config";
import { useSiteImages } from "@/hooks/use-site-images";
import { useSiteGallery } from "@/hooks/use-site-galleries";
import gardeningHero from "@/assets/gardening-workshop.jpg";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Paint a Pot & Plant Gardening Workshop in Tétouan",
  description:
    "Hands-on gardening workshop in Tétouan, Morocco. Paint your own terracotta pot, plant a small plant or succulent, and leave with a personalized care guide.",
  provider: {
    "@type": "Organization",
    "@id": "https://www.terrariaworkshops.com/#organization",
    name: "Terraria Workshops",
    url: "https://www.terrariaworkshops.com",
  },
  url: "https://www.terrariaworkshops.com/workshop/gardening",
  inLanguage: ["en", "fr", "es", "ar"],
  teaches: "Pot painting, plant potting, basic plant care",
  courseMode: "onsite",
  location: {
    "@type": "Place",
    name: "Terraria Workshops",
    address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "onsite",
    inLanguage: ["en", "fr", "es", "ar"],
  },
};

const GardeningWorkshop = () => {
  const { language } = useLanguage();
  const { config } = useWorkshopConfig("gardening");
  const siteImages = useSiteImages(["image_workshop_gardening"]);
  const managedGallery = useSiteGallery("gallery_workshop_gardening");
  const heroImg = siteImages["image_workshop_gardening"];
  const lang = language as "en" | "ar" | "es" | "fr";

  const defaultImages = [gardeningHero];
  const galleryImages =
    managedGallery && managedGallery.length > 0 ? managedGallery.map((g) => g.url) : defaultImages;
  const images = heroImg ? [heroImg, ...galleryImages] : galleryImages;

  const workshop = {
    title: config?.title?.[lang] || "Paint a Pot & Plant Workshop",
    tagline:
      config?.tagline?.[lang] ||
      "Paint your own terracotta pot, plant a small companion, and leave with a care guide for life at home.",
    price:
      config?.promo_enabled && config?.promo_price ? config.promo_price : config?.price || "150 DH",
    originalPrice: config?.promo_enabled ? config?.price : undefined,
    promoLabel: config?.promo_enabled ? config?.promo_label : undefined,
    duration: config?.duration?.[lang] || "About 2 hours",
    drink: config?.drink?.[lang] || "Mint tea included",
    location: config?.location?.[lang] || "Tetouan, Morocco",
    description: config?.descriptions?.length
      ? config.descriptions.map((d) => d[lang] || d.en).filter(Boolean)
      : [
          "A creative gardening workshop where you decorate your own handmade terracotta pot with paints inspired by Moroccan motifs.",
          "Then choose a small plant or succulent suited to your home, plant it in your pot, and walk away with a personalized care guide.",
        ],
    highlights: config?.highlights?.length
      ? config.highlights.map((h) => h[lang] || h.en).filter(Boolean)
      : [
          "Hand-painted terracotta pot to keep",
          "One small plant or succulent",
          "Soil, paints, brushes and tools provided",
          "Personalized plant care guide to take home",
          "Mint tea and a relaxed creative atmosphere",
        ],
    images,
    unavailable: config ? !config.is_available : false,
    popular: config?.is_popular || false,
  };

  return (
    <>
      <SEOHead
        title="Paint a Pot & Plant Workshop, Tétouan"
        description="Gardening workshop in Tétouan: paint a terracotta pot, plant a succulent or small plant, and take home a personalized plant care guide. All materials and tea included."
        path="/workshop/gardening"
        jsonLd={jsonLd}
      />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/gardening" />
    </>
  );
};

export default GardeningWorkshop;
