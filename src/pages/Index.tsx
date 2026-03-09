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
import AnimatedSection from "@/components/AnimatedSection";

import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ScrollProgress from "@/components/ScrollProgress";
import { SeasonalThemeOverlay } from "@/components/SeasonalTheme";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Terraria Workshops",
  description: "Hands-on pottery workshops in Tétouan, Morocco. Wheel throwing, hand-building, all materials included.",
  url: "https://www.terrariaworkshops.com",
  address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
  priceRange: "$$",
  sameAs: ["https://www.instagram.com/terraria.workshops"],
};

/** Soft artisanal divider */
const SoftDivider = () => (
  <div className="w-full flex justify-center py-1">
    <div className="w-16 h-px bg-border" />
  </div>
);

const Index = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
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

      <AnimatedSection variant="fade-up"><BeliefSection /></AnimatedSection>

      <SoftDivider />

      <AnimatedSection variant="fade-up" delay={100}><ExperienceSection /></AnimatedSection>

      <SoftDivider />

      <AnimatedSection variant="fade-up"><GallerySection /></AnimatedSection>

      <SoftDivider />
      <div className="section-sunken">
        <AnimatedSection variant="fade-up"><OffersSection /></AnimatedSection>
        <AnimatedSection variant="fade-up" delay={100}><TestimonialsSection /></AnimatedSection>
      </div>

      <AnimatedSection variant="fade-up"><FAQSection /></AnimatedSection>
      <AnimatedSection variant="fade-up"><LanguagesSection /></AnimatedSection>

      <SoftDivider />
      <div className="section-elevated">
        <AnimatedSection variant="fade-up"><BookingFormSection /></AnimatedSection>
        <AnimatedSection variant="fade-up"><ContactSection /></AnimatedSection>
      </div>

      <AnimatedSection variant="fade-up"><TrustSection /></AnimatedSection>
      <Footer />
    </main>
  );
};

export default Index;
