import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BeliefSection from "@/components/BeliefSection";

import ExperienceSection from "@/components/ExperienceSection";

import GallerySection from "@/components/GallerySection";
import OffersSection from "@/components/OffersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import LanguagesSection from "@/components/LanguagesSection";
import BookingFormSection from "@/components/BookingFormSection";
import TrustSection from "@/components/TrustSection";
import B2BSection from "@/components/B2BSection";
import AnimatedSection from "@/components/AnimatedSection";

import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ScrollProgress from "@/components/ScrollProgress";
import { SeasonalThemeOverlay } from "@/components/SeasonalTheme";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.terrariaworkshops.com/#localbusiness",
  name: "Terraria Workshops",
  description: "Hands-on pottery workshops in Tétouan, Morocco. Wheel throwing, handbuilding, embroidery, zellij and weaving with local artisans. All materials and mint tea included.",
  url: "https://www.terrariaworkshops.com",
  image: "https://www.terrariaworkshops.com/og.jpg",
  logo: "https://www.terrariaworkshops.com/logo.png",
  priceRange: "MAD 100–500",
  currenciesAccepted: "MAD",
  paymentAccepted: "Cash, Card on site",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tétouan",
    addressRegion: "Tanger-Tétouan-Al Hoceïma",
    addressCountry: "MA",
  },
  areaServed: { "@type": "City", name: "Tétouan" },
  knowsLanguage: ["en", "fr", "es", "ar"],
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "10:00",
    closes: "19:00",
  }],
  parentOrganization: { "@id": "https://www.terrariaworkshops.com/#organization" },
  sameAs: [
    "https://www.instagram.com/terraria_workshops",
    "https://www.tiktok.com/@terraria_workshops",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Workshops",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Course", name: "Pottery Wheel Workshop", url: "https://www.terrariaworkshops.com/workshop/pottery-experience" } },
      { "@type": "Offer", itemOffered: { "@type": "Course", name: "Handbuilding Pottery Workshop", url: "https://www.terrariaworkshops.com/workshop/handbuilding" } },
      { "@type": "Offer", itemOffered: { "@type": "Course", name: "Traditional Embroidery Workshop", url: "https://www.terrariaworkshops.com/workshop/embroidery" } },
      { "@type": "Offer", itemOffered: { "@type": "Course", name: "Zellij Workshop", url: "https://www.terrariaworkshops.com/workshop/zellij" } },
      { "@type": "Offer", itemOffered: { "@type": "Course", name: "Carpets Workshop", url: "https://www.terrariaworkshops.com/workshop/carpets" } },
      { "@type": "Offer", itemOffered: { "@type": "Course", name: "Paint a Pot & Plant Gardening Workshop", url: "https://www.terrariaworkshops.com/workshop/gardening" } },
    ],
  },
};

/** Angled band separator — goes into a darker warm zone */
const SlantDown = () => (
  <div className="relative w-full overflow-hidden pointer-events-none" style={{ height: 64 }}>
    <div
      className="absolute inset-0"
      style={{
        background: "hsl(24 50% 87%)",
        clipPath: "polygon(0 0, 100% 40%, 100% 100%, 0 100%)",
      }}
    />
  </div>
);

const SlantUp = () => (
  <div className="relative w-full overflow-hidden pointer-events-none" style={{ height: 64 }}>
    <div
      className="absolute inset-0"
      style={{
        background: "hsl(24 50% 87%)",
        clipPath: "polygon(0 0, 100% 0, 100% 60%, 0 100%)",
      }}
    />
  </div>
);

const SlantDownLight = () => (
  <div className="relative w-full overflow-hidden pointer-events-none" style={{ height: 64 }}>
    <div
      className="absolute inset-0"
      style={{
        background: "hsl(25 55% 94%)",
        clipPath: "polygon(0 0, 100% 40%, 100% 100%, 0 100%)",
      }}
    />
  </div>
);

const SlantUpLight = () => (
  <div className="relative w-full overflow-hidden pointer-events-none" style={{ height: 64 }}>
    <div
      className="absolute inset-0"
      style={{
        background: "hsl(25 55% 94%)",
        clipPath: "polygon(0 0, 100% 0, 100% 60%, 0 100%)",
      }}
    />
  </div>
);

const Index = () => {
  return (
    <main className="min-h-screen">
      <SEOHead
        title="Pottery workshops in Tétouan"
        description="Hands-on pottery workshops in Tétouan. Learn wheel throwing and hand-building, all materials included. Book your spot and pay on site."
        path="/"
        jsonLd={jsonLd}
      />
      <SeasonalThemeOverlay />
      <ScrollProgress />
      <Header />
      <HeroSection />

      <AnimatedSection variant="blur"><BeliefSection /></AnimatedSection>

      <SlantDown />
      <SlantUp />

      <AnimatedSection variant="scale"><GallerySection /></AnimatedSection>

      {/* Slant into sunken zone for offers + testimonials */}
      <SlantDown />
      <div className="section-sunken">
        <AnimatedSection variant="fade-up"><OffersSection /></AnimatedSection>
        <AnimatedSection variant="fade-right" delay={100}><TestimonialsSection /></AnimatedSection>
      </div>
      <SlantUp />

      <AnimatedSection variant="fade-up"><FAQSection /></AnimatedSection>
      <AnimatedSection variant="blur"><LanguagesSection /></AnimatedSection>

      {/* Slant into booking zone */}
      <SlantDownLight />
      <div className="section-elevated">
        <AnimatedSection variant="fade-up"><BookingFormSection /></AnimatedSection>
        <AnimatedSection variant="fade-up"><ContactSection /></AnimatedSection>
      </div>
      <SlantUpLight />

      <AnimatedSection variant="scale"><TrustSection /></AnimatedSection>
      <AnimatedSection variant="fade-up"><B2BSection /></AnimatedSection>
      <Footer />
    </main>
  );
};

export default Index;
