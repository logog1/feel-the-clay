import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useWorkshopConfig } from "@/hooks/use-workshop-config";
import rugDiamond from "@/assets/product-rug-diamond.png";
import rugGeometric from "@/assets/product-rug-geometric.png";
import rugBlueWhite from "@/assets/product-rug-blue-white.png";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Carpets & Weaving Workshop in Tétouan",
  description: "Moroccan carpets workshop in Tétouan focused on weaving, Amazigh motifs, textures, and artisan stories.",
  provider: {
    "@type": "Organization",
    "@id": "https://www.terrariaworkshops.com/#organization",
    name: "Terraria Workshops",
    url: "https://www.terrariaworkshops.com",
  },
  url: "https://www.terrariaworkshops.com/workshop/carpets",
  inLanguage: ["en", "fr", "es", "ar"],
  teaches: "Moroccan weaving techniques, Amazigh symbols, textile craft",
  courseMode: "onsite",
  location: {
    "@type": "Place",
    name: "Terraria Workshops",
    address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
  },
  hasCourseInstance: { "@type": "CourseInstance", courseMode: "onsite", inLanguage: ["en", "fr", "es", "ar"] },
};

const CarpetsWorkshop = () => {
  const { language } = useLanguage();
  const { config } = useWorkshopConfig("carpets");
  const lang = language as "en" | "ar" | "es" | "fr";

  const workshop = {
    title: config?.title?.[lang] || "Carpets Workshop",
    tagline: config?.tagline?.[lang] || "A future weaving experience around Moroccan rugs, textures, symbols, and artisan stories.",
    price: config?.promo_enabled && config?.promo_price ? config.promo_price : (config?.price || "Coming soon"),
    originalPrice: config?.promo_enabled ? config?.price : undefined,
    promoLabel: config?.promo_enabled ? config?.promo_label : undefined,
    duration: config?.duration?.[lang] || "Coming soon",
    drink: config?.drink?.[lang] || "Tea included",
    location: config?.location?.[lang] || "Tetouan, Morocco",
    description: config?.descriptions?.length
      ? config.descriptions.map((d) => d[lang] || d.en).filter(Boolean)
      : ["A future textile workshop centered on Moroccan carpets, Amazigh motifs, and the rhythm of handmade weaving."],
    highlights: config?.highlights?.length
      ? config.highlights.map((h) => h[lang] || h.en).filter(Boolean)
      : ["Textile symbols and materials", "Artisan storytelling"],
    images: [rugDiamond, rugGeometric, rugBlueWhite],
    unavailable: config ? !config.is_available : true,
    popular: config?.is_popular || false,
  };

  return (
    <>
      <SEOHead
        title="Carpets Workshop in Tétouan"
        description="Coming soon: a Moroccan carpets workshop in Tétouan focused on weaving, Amazigh motifs, textures, and artisan stories."
        path="/workshop/carpets"
      />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/carpets" />
    </>
  );
};

export default CarpetsWorkshop;