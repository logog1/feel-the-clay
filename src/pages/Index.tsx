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

/* Smooth organic wave between sections */
const WaveDown = ({ fill = "hsl(24 50% 87%)" }: { fill?: string }) => (
  <div className="w-full overflow-hidden leading-none" style={{ height: 56, marginBottom: -2 }}>
    <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,0 C360,56 1080,0 1440,56 L1440,56 L0,56 Z" fill={fill} />
    </svg>
  </div>
);

const WaveUp = ({ fill = "hsl(24 50% 87%)" }: { fill?: string }) => (
  <div className="w-full overflow-hidden leading-none" style={{ height: 56, marginTop: -2 }}>
    <svg viewBox="0 0 1440 56" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,56 C360,0 1080,56 1440,0 L1440,56 L0,56 Z" fill={fill} />
    </svg>
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

      {/* BeliefSection — same bg */}
      <AnimatedSection variant="blur"><BeliefSection /></AnimatedSection>

      {/* Wave into elevated/sunken zone */}
      <WaveDown fill="hsl(24 50% 87%)" />
      <div className="section-sunken">
        <AnimatedSection variant="fade-up"><SocialImpactSection /></AnimatedSection>
        <AnimatedSection variant="fade-up"><AboutSection /></AnimatedSection>
      </div>
      <WaveUp fill="hsl(24 50% 87%)" />

      {/* Experience — on default bg, slightly elevated card feel */}
      <AnimatedSection variant="fade-left" delay={100}><ExperienceSection /></AnimatedSection>

      {/* Wave into elevated pale section */}
      <WaveDown fill="hsl(25 55% 94%)" />
      <div className="section-elevated">
        <AnimatedSection variant="blur"><ProcessSection /></AnimatedSection>
      </div>
      <WaveUp fill="hsl(25 55% 94%)" />

      {/* Gallery on default */}
      <AnimatedSection variant="scale"><GallerySection /></AnimatedSection>

      {/* Wave into sunken zone for offers + testimonials */}
      <WaveDown fill="hsl(24 50% 87%)" />
      <div className="section-sunken">
        <AnimatedSection variant="fade-up"><OffersSection /></AnimatedSection>
        <AnimatedSection variant="fade-right" delay={100}><TestimonialsSection /></AnimatedSection>
      </div>
      <WaveUp fill="hsl(24 50% 87%)" />

      {/* FAQ + Languages on default */}
      <AnimatedSection variant="fade-up"><FAQSection /></AnimatedSection>
      <AnimatedSection variant="blur"><LanguagesSection /></AnimatedSection>

      {/* Wave into booking zone */}
      <WaveDown fill="hsl(25 55% 94%)" />
      <div className="section-elevated">
        <AnimatedSection variant="fade-up"><BookingFormSection /></AnimatedSection>
        <AnimatedSection variant="fade-up"><ContactSection /></AnimatedSection>
      </div>
      <WaveUp fill="hsl(25 55% 94%)" />

      <AnimatedSection variant="scale"><TrustSection /></AnimatedSection>
      <Footer />
    </main>
  );
};

export default Index;
