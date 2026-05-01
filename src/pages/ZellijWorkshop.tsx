import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useWorkshopConfig } from "@/hooks/use-workshop-config";
import workshopTools from "@/assets/workshop-tools.jpg";
import workshop1 from "@/assets/workshop-1.jpg";
import workshop13 from "@/assets/workshop-13.jpg";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Zellij Workshop in Tétouan",
  description: "Moroccan zellij workshop in Tétouan focused on geometric patterns, color, and traditional tile craft.",
  provider: {
    "@type": "Organization",
    "@id": "https://www.terrariaworkshops.com/#organization",
    name: "Terraria Workshops",
    url: "https://www.terrariaworkshops.com",
  },
  url: "https://www.terrariaworkshops.com/workshop/zellij",
  inLanguage: ["en", "fr", "es", "ar"],
  teaches: "Moroccan zellij geometric patterns and decorative tile craft",
  courseMode: "onsite",
  location: {
    "@type": "Place",
    name: "Terraria Workshops",
    address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
  },
  hasCourseInstance: { "@type": "CourseInstance", courseMode: "onsite", inLanguage: ["en", "fr", "es", "ar"] },
};

const ZellijWorkshop = () => {
  const { language } = useLanguage();
  const { config } = useWorkshopConfig("zellij");
  const lang = language as "en" | "ar" | "es" | "fr";

  const workshop = {
    title: config?.title?.[lang] || "Zellij Workshop",
    tagline: config?.tagline?.[lang] || "Discover Moroccan geometric tile craft through pattern, color, and patient handwork.",
    price: config?.promo_enabled && config?.promo_price ? config.promo_price : (config?.price || "Coming soon"),
    originalPrice: config?.promo_enabled ? config?.price : undefined,
    promoLabel: config?.promo_enabled ? config?.promo_label : undefined,
    duration: config?.duration?.[lang] || "Coming soon",
    drink: config?.drink?.[lang] || "Tea included",
    location: config?.location?.[lang] || "Tetouan, Morocco",
    description: config?.descriptions?.length
      ? config.descriptions.map((d) => d[lang] || d.en).filter(Boolean)
      : ["A future workshop dedicated to Moroccan zellij, geometric thinking, and decorative craft traditions."],
    highlights: config?.highlights?.length
      ? config.highlights.map((h) => h[lang] || h.en).filter(Boolean)
      : ["Pattern and color introduction", "Local craft context"],
    images: [workshopTools, workshop1, workshop13],
    unavailable: config ? !config.is_available : true,
    popular: config?.is_popular || false,
  };

  return (
    <>
      <SEOHead
        title="Zellij Workshop in Tétouan"
        description="Coming soon: a Moroccan zellij workshop in Tétouan focused on pattern, color, geometry, and local craft culture."
        path="/workshop/zellij"
      />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/zellij" />
    </>
  );
};

export default ZellijWorkshop;