const ExperienceSection = () => {
  const experiences = [
    "Slow down and breathe",
    "Create with your hands",
    "Work with earth"
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="container-narrow">
        <div className="space-y-8">
          <h2 className="text-xl md:text-2xl font-medium">
            What you'll feel
          </h2>
          
          <ul className="space-y-3">
            {experiences.map((experience, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 text-foreground/80"
              >
                <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-cta flex-shrink-0" />
                <span>{experience}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
