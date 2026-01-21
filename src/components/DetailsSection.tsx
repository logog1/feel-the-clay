const DetailsSection = () => {
  const details = [
    "3 hours",
    "Unlimited pieces",
    "Materials included",
    "Drink included",
  ];

  return (
    <section className="py-12 md:py-16 bg-sand-light">
      <div className="container-narrow">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {details.map((detail, index) => (
            <span 
              key={index}
              className="text-sm md:text-base text-foreground/70 font-light"
            >
              {detail}
              {index < details.length - 1 && (
                <span className="hidden md:inline ml-4 md:ml-8 text-foreground/30">•</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetailsSection;
