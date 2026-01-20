const ExperienceSection = () => {
  const experiences = [
    "A moment to slow down and breathe",
    "The satisfaction of creating with your hands",
    "A break from screens and endless thinking",
    "The grounding sensation of working with earth",
    "A new way to express yourself"
  ];

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <div className="space-y-10">
          <h2 className="text-2xl md:text-3xl font-medium">
            What you'll experience
          </h2>
          
          <ul className="space-y-4">
            {experiences.map((experience, index) => (
              <li 
                key={index}
                className="flex items-start gap-4 text-foreground/85"
              >
                <span className="w-2 h-2 mt-2.5 rounded-full bg-cta flex-shrink-0" />
                <span className="text-lg">{experience}</span>
              </li>
            ))}
          </ul>
          
          <p className="text-xl md:text-2xl font-light text-foreground/90 italic pt-4 border-l-4 border-cta pl-6">
            "We're excited to shape clay together."
          </p>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
