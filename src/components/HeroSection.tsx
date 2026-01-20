import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center section-padding relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/80" />
      
      <div className="container-narrow relative z-10">
        <div className="space-y-8 animate-fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight text-balance">
            Slow down.
            <br />
            <span className="font-medium">Shape something beautiful.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 font-light">
            A 3-hour pottery handbuilding workshop
          </p>
          
          <p className="text-base text-muted-foreground max-w-md">
            No experience needed. All materials included. Just bring your curiosity.
          </p>
          
          <div className="pt-4">
            <Button variant="cta" size="xl" asChild>
              <a href="https://forms.gle/NfrnW6E2yr65WAVbA" target="_blank" rel="noopener noreferrer">
                Reserve your spot
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '1s' }}>
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-foreground/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
