const BeliefSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-[10%] w-16 h-16 rounded-full border-2 border-terracotta/20 animate-gentle-float" />
        <div className="absolute bottom-12 right-[15%] w-10 h-10 rounded-full bg-cta/10 animate-gentle-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-[5%] w-3 h-3 rounded-full bg-terracotta/30 animate-gentle-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-[8%] w-2 h-2 rounded-full bg-cta/40 animate-gentle-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Decorative lines */}
        <div className="absolute top-1/4 left-0 w-24 h-px bg-gradient-to-r from-transparent via-terracotta/20 to-transparent" />
        <div className="absolute bottom-1/4 right-0 w-32 h-px bg-gradient-to-l from-transparent via-cta/20 to-transparent" />
      </div>
      
      <div className="container-narrow relative">
        {/* Quote marks decoration */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl md:text-8xl text-terracotta/10 font-serif leading-none select-none">
          "
        </div>
        
        <p className="text-lg md:text-xl text-foreground/80 font-light text-center max-w-lg mx-auto leading-relaxed italic">
          Craft lives through the people who practice it together.
        </p>
        
        {/* Decorative underline */}
        <div className="mt-6 flex justify-center gap-1">
          <div className="w-8 h-0.5 bg-cta/60 rounded-full" />
          <div className="w-2 h-0.5 bg-terracotta/40 rounded-full" />
          <div className="w-2 h-0.5 bg-cta/40 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default BeliefSection;
