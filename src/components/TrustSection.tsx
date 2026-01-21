const TrustSection = () => {
  const partners = [
    "UNHCR Morocco",
    "British Council",
    "AMAPPE",
    "Fondation Orient-Occident",
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="container-narrow">
        <div className="space-y-8">
          <p className="text-sm text-muted-foreground text-center uppercase tracking-wider">
            Those who joined us
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            {partners.map((partner, index) => (
              <span 
                key={index}
                className="text-foreground/60 text-sm md:text-base font-light"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
