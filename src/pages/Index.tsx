import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
import DetailsSection from "@/components/DetailsSection";
import ProcessSection from "@/components/ProcessSection";
import LocationSection from "@/components/LocationSection";
import LanguagesSection from "@/components/LanguagesSection";
import FinalCTASection from "@/components/FinalCTASection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <DetailsSection />
      <ProcessSection />
      <LocationSection />
      <LanguagesSection />
      <FinalCTASection />
      
      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm text-muted-foreground">
        <p>Made with care and clay</p>
      </footer>
    </main>
  );
};

export default Index;
