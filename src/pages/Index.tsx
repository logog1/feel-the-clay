import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BeliefSection from "@/components/BeliefSection";
import AboutSection from "@/components/AboutSection";
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
import SocialImpactSection from "@/components/SocialImpactSection";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ScrollProgress from "@/components/ScrollProgress";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Terraria Workshops",
  description: "Pottery, handbuilding & embroidery workshops in Tetouan, Morocco.",
  url: "https://feel-the-clay.lovable.app",
  address: { "@type": "PostalAddress", addressLocality: "Tetouan", addressCountry: "MA" },
  priceRange: "$$",
  sameAs: ["https://www.instagram.com/terraria.workshops"],
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
        title="Pottery & Craft Experiences in Tetouan"
        description="Book a hands-on pottery or embroidery workshop in Tetouan, Morocco. No experience needed — shape clay, slow down, and create something beautiful."
        path="/"
        jsonLd={jsonLd}
      />
      <ScrollProgress />
      <Header />
      <HeroSection />

      <AnimatedSection variant="blur"><BeliefSection /></AnimatedSection>

      {/* Slant into sunken zone */}
      <SlantDown />
      <div className="section-sunken">
        <AnimatedSection variant="fade-up"><SocialImpactSection /></AnimatedSection>
        <AnimatedSection variant="fade-up"><AboutSection /></AnimatedSection>
      </div>
      <SlantUp />

      <AnimatedSection variant="fade-left" delay={100}><ExperienceSection /></AnimatedSection>


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
      <Footer />
    </main>
  );
};

export default Index;
