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

const Index = () => {
  return (
    <main className="min-h-screen">
      {/* Learn */}
      <HeroSection />
      <BeliefSection />
      <AboutSection />
      
      {/* Feel */}
      <ExperienceSection />
      <DetailsSection />
      <ProcessSection />
      <GallerySection />
      
      {/* Connect */}
      <TestimonialsSection />
      <CraftsExpansionSection />
      <FAQSection />
      <LocationSection />
      <LanguagesSection />
      
      {/* Join */}
      <FinalCTASection />
      
      {/* Trust - last before footer */}
      <TrustSection />
      
      {/* Footer */}
      <footer className="py-6 px-6 text-center text-xs text-muted-foreground">
        <p>Made with care and clay</p>
      </footer>
    </main>
  );
};

export default Index;
