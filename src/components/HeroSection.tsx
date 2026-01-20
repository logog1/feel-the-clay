import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center section-padding relative overflow-hidden">
      {/* Decorative organic shape */}
      <div className="absolute top-20 right-0 w-64 h-64 md:w-96 md:h-96 bg-sand-dark/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-gentle-float" />
      <div className="absolute bottom-20 left-0 w-48 h-48 md:w-72 md:h-72 bg-terracotta/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
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
            <Button variant="cta" size="xl">
              Reserve your spot
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
