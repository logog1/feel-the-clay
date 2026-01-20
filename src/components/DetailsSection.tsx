import { Clock, Infinity, Package, Coffee, Heart, Users } from "lucide-react";

const DetailsSection = () => {
  const details = [
    {
      icon: Clock,
      title: "3 hours",
      description: "Plenty of time to explore"
    },
    {
      icon: Infinity,
      title: "Unlimited pieces",
      description: "Create as many as you like"
    },
    {
      icon: Package,
      title: "Materials included",
      description: "Clay, tools, and glazes"
    },
    {
      icon: Coffee,
      title: "One drink included",
      description: "Tea, coffee, or juice"
    },
    {
      icon: Heart,
      title: "Beginner-friendly",
      description: "No experience needed"
    },
    {
      icon: Users,
      title: "Small group",
      description: "Personal attention for everyone"
    }
  ];

  return (
    <section className="section-padding bg-sand-light">
      <div className="container-wide">
        <div className="space-y-10">
          <h2 className="text-2xl md:text-3xl font-medium text-center">
            Workshop details
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {details.map((detail, index) => (
              <div 
                key={index}
                className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-background/50 hover:bg-background/80 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-cta/15 flex items-center justify-center">
                  <detail.icon className="w-6 h-6 text-cta" />
                </div>
                <h3 className="font-medium text-lg">{detail.title}</h3>
                <p className="text-sm text-muted-foreground">{detail.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailsSection;
