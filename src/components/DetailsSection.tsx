import { Clock, Infinity, Package, Coffee } from "lucide-react";

const DetailsSection = () => {
  const details = [
    { icon: Clock, text: "3 hours" },
    { icon: Infinity, text: "Unlimited pieces" },
    { icon: Package, text: "Materials included" },
    { icon: Coffee, text: "Drink included" },
  ];

  return (
    <section className="py-12 md:py-16 bg-sand-light">
      <div className="container-narrow">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {details.map((detail, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-foreground/70"
            >
              <detail.icon className="w-4 h-4 text-cta" />
              <span className="text-sm">{detail.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetailsSection;
