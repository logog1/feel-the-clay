import Header from "@/components/Header";
import SocialImpactSection from "@/components/SocialImpactSection";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ScrollProgress from "@/components/ScrollProgress";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Terraria Workshops",
  description: "A social initiative bridging tourism with tradition in Tétouan, Morocco. Empowering local artisans through craft workshops.",
  url: "https://www.terrariaworkshops.com/about",
  mainEntity: {
    "@type": "Organization",
    name: "Terraria Workshops",
    url: "https://www.terrariaworkshops.com",
    address: { "@type": "PostalAddress", addressLocality: "Tétouan", addressCountry: "MA" },
  },
};

const AboutUs = () => {
  return (
    <main className="min-h-screen">
      <SEOHead
        title="About Us"
        description="Discover the story behind Terraria — a social initiative bridging tourism with tradition in Tétouan, Morocco. Empowering local artisans through craft workshops."
        path="/about"
        jsonLd={jsonLd}
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