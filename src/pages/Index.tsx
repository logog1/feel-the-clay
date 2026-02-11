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

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* LEARN - Hook + Philosophy + The emotional WHY */}
      <HeroSection />
      <AnimatedSection>
        <BeliefSection />
      </AnimatedSection>
      <AnimatedSection>
        <SocialImpactSection />
      </AnimatedSection>
      
      {/* FEEL - Who, what, how + visual proof */}
      <AnimatedSection>
        <AboutSection />
      </AnimatedSection>
      <AnimatedSection>
        <ExperienceSection />
      </AnimatedSection>
      <AnimatedSection>
        <DetailsSection />
      </AnimatedSection>
      <AnimatedSection>
        <ProcessSection />
      </AnimatedSection>
      <AnimatedSection>
        <GallerySection />
      </AnimatedSection>
      <AnimatedSection>
        <OffersSection />
      </AnimatedSection>
      
      {/* CONNECT - Validation + logistics */}
      <AnimatedSection>
        <TestimonialsSection />
      </AnimatedSection>
      <AnimatedSection>
        <CraftsExpansionSection />
      </AnimatedSection>
      <AnimatedSection>
        <FAQSection />
      </AnimatedSection>
      <AnimatedSection>
        <LanguagesSection />
      </AnimatedSection>
      
      {/* JOIN - Clear action */}
      <AnimatedSection>
        <FinalCTASection />
      </AnimatedSection>
      
      {/* CLOSING - Location + Trust (credibility last) */}
      <AnimatedSection>
        <LocationSection />
      </AnimatedSection>
      <AnimatedSection>
        <TrustSection />
      </AnimatedSection>
      
      {/* Footer */}
      <footer className="py-6 px-6 text-center text-xs text-muted-foreground">
        <p>Made with care and clay</p>
      </footer>
    </main>
  );
};

export default Index;
