import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import { useSiteImages } from "@/hooks/use-site-images";
import { useSiteGallery } from "@/hooks/use-site-galleries";
import { useWorkshopConfig } from "@/hooks/use-workshop-config";
import embrHero from "@/assets/embr-hero.jpg";
import embrGallery1 from "@/assets/embr-gallery-1.jpg";
import embrGallery2 from "@/assets/embr-gallery-2.jpg";
import embrGallery3 from "@/assets/embr-gallery-3.jpg";
import embrGallery4 from "@/assets/embr-gallery-4.jpg";
import embrGallery5 from "@/assets/embr-gallery-5.jpg";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Traditional Embroidery Workshop in Tétouan",
  description: "Learn traditional Moroccan embroidery techniques in Tétouan. Hands-on craft workshop with local artisans. All materials included.",
  provider: {
    "@type": "Organization",
    "@id": "https://www.terrariaworkshops.com/#organization",
    name: "Terraria Workshops",
    url: "https://www.terrariaworkshops.com",
    sameAs: ["https://www.instagram.com/terraria_workshops"],
  },
  url: "https://www.terrariaworkshops.com/workshop/embroidery",
  inLanguage: ["en", "fr", "es", "ar"],
  educationalLevel: "Beginner",
  teaches: "Traditional Moroccan embroidery stitches and motifs",
  courseMode: "onsite",
  location: {
    "@type": "Place",
    name: "Terraria Workshops",
    address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressRegion: "Tanger-Tétouan-Al Hoceïma", addressCountry: "MA" },
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "onsite",
    inLanguage: ["en", "fr", "es", "ar"],
    location: {
      "@type": "Place",
      name: "Terraria Workshops",
      address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
    },
  },
};

const EmbroideryWorkshop = () => {
  const { t, language } = useLanguage();
  const siteImages = useSiteImages(["image_workshop_embroidery"]);
  const managedGallery = useSiteGallery("gallery_workshop_embroidery");
  const { config } = useWorkshopConfig("embroidery");
  const heroImg = siteImages["image_workshop_embroidery"];
  const lang = language as "en" | "ar" | "es" | "fr";

  const defaultImages = [embrGallery1, embrGallery2, embrGallery3, embrGallery4, embrGallery5];
  const galleryImages = managedGallery && managedGallery.length > 0
    ? managedGallery.map((g) => g.url)
    : defaultImages;
  const images = heroImg ? [heroImg, ...galleryImages] : [embrHero, ...galleryImages];

  const workshop = {
    title: config?.title?.[lang] || t("embr.title"),
    tagline: config?.tagline?.[lang] || t("embr.tagline"),
    price: config?.promo_enabled && config?.promo_price ? config.promo_price : (config?.price || t("embr.price")),
    originalPrice: config?.promo_enabled ? config?.price : undefined,
    promoLabel: config?.promo_enabled ? config?.promo_label : undefined,
    duration: config?.duration?.[lang] || t("embr.duration"),
    drink: config?.drink?.[lang] || t("embr.drink"),
    location: config?.location?.[lang] || t("embr.location"),
    description: config?.descriptions?.length
      ? config.descriptions.map((d) => d[lang] || d.en).filter(Boolean)
      : [t("embr.desc1"), t("embr.desc2")],
    highlights: config?.highlights?.length
      ? config.highlights.map((h) => h[lang] || h.en).filter(Boolean)
      : [t("embr.h1"), t("embr.h2"), t("embr.h3"), t("embr.h4"), t("embr.h5"), t("embr.h6"), t("embr.h7")],
    images,
    unavailable: config ? !config.is_available : true,
    popular: config?.is_popular || false,
  };

  return (
    <>
      <SEOHead
        title="Traditional Embroidery Workshop in Tétouan"
        description="Learn traditional Moroccan embroidery techniques in Tétouan. Hands-on craft workshop with local artisans. All materials included."
        path="/workshop/embroidery"
        jsonLd={jsonLd}
      />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/embroidery" />
    </>
  );
};

export default EmbroideryWorkshop;
