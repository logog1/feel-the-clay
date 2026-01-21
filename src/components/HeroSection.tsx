import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-[85vh] flex flex-col justify-center section-padding relative overflow-hidden">
      {/* Background image with overlay - fixed for mobile */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed md:bg-scroll"
        style={{ 
          backgroundImage: `url(${heroBg})`,
          backgroundAttachment: 'scroll'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/70" />
      
      <div className="container-narrow relative z-10">
        <div className="space-y-6 animate-fade-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-balance">
            Rethinking pottery as community
          </h1>
          
          <p className="text-base md:text-lg text-foreground/70 font-light max-w-sm">
            A creative, grounding experience in Tetouan.
          </p>
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
