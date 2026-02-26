import Header from "@/components/Header";
import SocialImpactSection from "@/components/SocialImpactSection";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ScrollProgress from "@/components/ScrollProgress";

const AboutUs = () => {
  return (
    <main className="min-h-screen">
      <SEOHead
        title="About Us – Terraria Workshops"
        description="Discover the story behind Terraria — a social initiative bridging tourism with tradition in Tétouan, Morocco."
        path="/about"
      />
      <ScrollProgress />
      <Header />
      <div className="pt-20">
        <AnimatedSection variant="fade-up"><SocialImpactSection /></AnimatedSection>
      </div>
      <Footer />
    </main>
  );
};

export default AboutUs;
