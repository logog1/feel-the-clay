import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BeliefSection from "@/components/BeliefSection";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
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
      <div className="section-divider" />
      <AnimatedSection variant="fade-up"><SocialImpactSection /></AnimatedSection>
      <AnimatedSection variant="fade-up"><AboutSection /></AnimatedSection>
      <div className="section-divider" />
      <AnimatedSection variant="fade-left" delay={100}><ExperienceSection /></AnimatedSection>
      <AnimatedSection variant="blur"><ProcessSection /></AnimatedSection>
      <AnimatedSection variant="scale"><GallerySection /></AnimatedSection>
      <div className="section-divider" />
      <AnimatedSection variant="fade-up"><OffersSection /></AnimatedSection>
      <AnimatedSection variant="fade-right" delay={100}><TestimonialsSection /></AnimatedSection>
      <AnimatedSection variant="fade-up"><FAQSection /></AnimatedSection>
      <AnimatedSection variant="blur"><LanguagesSection /></AnimatedSection>
      <div className="section-divider" />
      <AnimatedSection variant="fade-up"><BookingFormSection /></AnimatedSection>
      <AnimatedSection variant="fade-up"><ContactSection /></AnimatedSection>
      <AnimatedSection variant="scale"><TrustSection /></AnimatedSection>
      <Footer />
    </main>
  );
};

export default Index;
