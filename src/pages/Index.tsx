import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BeliefSection from "@/components/BeliefSection";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
import DetailsSection from "@/components/DetailsSection";
import ProcessSection from "@/components/ProcessSection";
import GallerySection from "@/components/GallerySection";
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
      
      {/* Learn */}
      <HeroSection />
      <AnimatedSection>
        <BeliefSection />
      </AnimatedSection>
      <AnimatedSection>
        <AboutSection />
      </AnimatedSection>
      
      {/* Feel */}
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
      
      {/* Connect */}
      <AnimatedSection>
        <SocialImpactSection />
      </AnimatedSection>
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
        <LocationSection />
      </AnimatedSection>
      <AnimatedSection>
        <LanguagesSection />
      </AnimatedSection>
      
      {/* Join */}
      <AnimatedSection>
        <FinalCTASection />
      </AnimatedSection>
      
      {/* Trust - last before footer */}
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
