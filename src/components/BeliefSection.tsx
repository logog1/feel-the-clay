const BeliefSection = () => {
  return (
    <section className="py-12 md:py-32 relative">
      {/* Large decorative background text */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <span className="text-[8rem] md:text-[16rem] font-bold text-terracotta/[0.03] leading-none tracking-tighter">
          CRAFT
        </span>
      </div>
      
      <div className="container-narrow relative">
        <div className="flex flex-col items-center gap-6">
          {/* Decorative top element */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-cta" />
            <div className="w-2 h-2 rotate-45 border border-cta" />
            <div className="w-12 h-px bg-cta" />
          </div>
          
          {/* Main quote with stylized layout */}
          <div className="text-center space-y-2">
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground/90 tracking-wide">
              Craft lives through
            </p>
            <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-terracotta">
              the people
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground/90 tracking-wide">
              who practice it together.
            </p>
          </div>
          
          {/* Decorative bottom element */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-3 h-3 rounded-full bg-cta/30" />
            <div className="w-2 h-2 rounded-full bg-terracotta/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-cta/40" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeliefSection;
