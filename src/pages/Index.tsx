import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BeliefSection from "@/components/BeliefSection";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
import DetailsSection from "@/components/DetailsSection";
import ProcessSection from "@/components/ProcessSection";
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

const Index = () => {
  return (
    <main className="min-h-screen">
      <SEOHead
        title="Pottery & Craft Experiences in Tetouan"
        description="Book a hands-on pottery or embroidery workshop in Tetouan, Morocco. No experience needed — shape clay, slow down, and create something beautiful."
        path="/"
        jsonLd={jsonLd}
      />
      <Header />
      <HeroSection />
      <AnimatedSection><BeliefSection /></AnimatedSection>
      <AnimatedSection><SocialImpactSection /></AnimatedSection>
      <AnimatedSection><AboutSection /></AnimatedSection>
      <AnimatedSection><ExperienceSection /></AnimatedSection>
      <AnimatedSection><DetailsSection /></AnimatedSection>
      <AnimatedSection><ProcessSection /></AnimatedSection>
      <AnimatedSection><GallerySection /></AnimatedSection>
      <AnimatedSection><OffersSection /></AnimatedSection>
      <AnimatedSection><TestimonialsSection /></AnimatedSection>
      <AnimatedSection><FAQSection /></AnimatedSection>
      <AnimatedSection><LanguagesSection /></AnimatedSection>
      <AnimatedSection><BookingFormSection /></AnimatedSection>
      <AnimatedSection><ContactSection /></AnimatedSection>
      <AnimatedSection><TrustSection /></AnimatedSection>
      <Footer />
    </main>
  );
};

export default Index;
