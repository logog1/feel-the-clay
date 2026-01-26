import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="hero" className="min-h-[85vh] md:min-h-screen flex flex-col justify-end md:justify-center section-padding pb-16 md:pb-0 pt-16 relative overflow-hidden">
      {/* Background image - full contain on mobile, cover on desktop */}
      <div 
        className="absolute inset-0 md:bg-cover bg-contain bg-no-repeat md:bg-center bg-top"
        style={{ 
          backgroundImage: `url(${heroBg})`,
        }}
      />
      
      {/* Fill the remaining space below the image on mobile */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-b from-transparent via-transparent to-background" style={{ top: '60%' }} />
      
      {/* Gradient overlay with warmer tones */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/80" />
      
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-2 h-2 bg-cta/40 rounded-full animate-gentle-float" />
        <div className="absolute top-[25%] right-[15%] w-3 h-3 bg-terracotta/30 rounded-full animate-gentle-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[30%] left-[20%] w-1.5 h-1.5 bg-cta/50 rounded-full animate-gentle-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[8%] w-2 h-2 bg-terracotta/20 rounded-full animate-gentle-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[20%] right-[25%] w-2.5 h-2.5 bg-cta/30 rounded-full animate-gentle-float" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="container-narrow relative z-10">
        <div className="space-y-6 animate-fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-balance text-foreground drop-shadow-sm">
            Rethinking pottery as{" "}
            <span className="relative inline-block">
              community
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-cta rounded-full" />
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 font-light max-w-sm drop-shadow-sm">
            A creative, grounding experience in Tetouan.
          </p>
        </div>
      </div>
      
      {/* Scroll indicator with animation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '1s' }}>
        <div className="w-6 h-10 border-2 border-foreground/40 rounded-full flex justify-center pt-2 backdrop-blur-sm">
          <div className="w-1.5 h-3 bg-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
      
      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terracotta/30 to-transparent" />
    </section>
  );
};

export default HeroSection;
