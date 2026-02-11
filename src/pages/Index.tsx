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
import CraftsExpansionSection from "@/components/CraftsExpansionSection";
import FAQSection from "@/components/FAQSection";
import LocationSection from "@/components/LocationSection";
import LanguagesSection from "@/components/LanguagesSection";
import FinalCTASection from "@/components/FinalCTASection";
import TrustSection from "@/components/TrustSection";
import AnimatedSection from "@/components/AnimatedSection";
import SocialImpactSection from "@/components/SocialImpactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
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
      <AnimatedSection><CraftsExpansionSection /></AnimatedSection>
      <AnimatedSection><FAQSection /></AnimatedSection>
      <AnimatedSection><LanguagesSection /></AnimatedSection>
      <AnimatedSection><FinalCTASection /></AnimatedSection>
      <AnimatedSection><LocationSection /></AnimatedSection>
      <AnimatedSection><TrustSection /></AnimatedSection>
      <Footer />
    </main>
  );
};

export default Index;
