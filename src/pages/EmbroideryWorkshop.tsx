import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import { useSiteImages } from "@/hooks/use-site-images";
import { useSiteGallery } from "@/hooks/use-site-galleries";
import embrHero from "@/assets/embr-hero.jpg";
import embrGallery1 from "@/assets/embr-gallery-1.jpg";
import embrGallery2 from "@/assets/embr-gallery-2.jpg";
import embrGallery3 from "@/assets/embr-gallery-3.jpg";
import embrGallery4 from "@/assets/embr-gallery-4.jpg";
import embrGallery5 from "@/assets/embr-gallery-5.jpg";

const EmbroideryWorkshop = () => {
  const { t } = useLanguage();
  const siteImages = useSiteImages(["image_workshop_embroidery"]);
  const managedGallery = useSiteGallery("gallery_workshop_embroidery");
  const heroImg = siteImages["image_workshop_embroidery"];

  const defaultImages = [embrGallery1, embrGallery2, embrGallery3, embrGallery4, embrGallery5];
  const galleryImages = managedGallery && managedGallery.length > 0
    ? managedGallery.map((g) => g.url)
    : defaultImages;
  const images = heroImg ? [heroImg, ...galleryImages] : [embrHero, ...galleryImages];

  const workshop = {
    title: t("embr.title"),
    tagline: t("embr.tagline"),
    price: t("embr.price"),
    duration: t("embr.duration"),
    drink: t("embr.drink"),
    location: t("embr.location"),
    description: [t("embr.desc1"), t("embr.desc2")],
    highlights: [t("embr.h1"), t("embr.h2"), t("embr.h3"), t("embr.h4"), t("embr.h5"), t("embr.h6"), t("embr.h7")],
    images,
    unavailable: true,
  };

  return (
    <>
      <SEOHead title="Embroidery Workshop" description="Pottery workshops for beginners and creatives in Tétouan. Session details, schedule, pricing, and what's included." path="/workshop/embroidery" />
      <WorkshopPageLayout workshop={workshop} currentPath="/workshop/embroidery" />
    </>
  );
};

export default EmbroideryWorkshop;
