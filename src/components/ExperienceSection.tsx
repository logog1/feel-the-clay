import { Wind, Hand, Sparkles } from "lucide-react";

const ExperienceSection = () => {
  const experiences = [
    { text: "Slow down and breathe", icon: Wind, delay: "0s" },
    { text: "Create with your hands", icon: Hand, delay: "0.1s" },
    { text: "Work with earth", icon: Sparkles, delay: "0.2s" }
  ];

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Organic blob shapes */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cta/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-terracotta/5 rounded-full blur-2xl" />
        
        {/* Scattered dots */}
        <div className="absolute top-[20%] right-[20%] w-1.5 h-1.5 bg-cta/30 rounded-full animate-gentle-float" />
        <div className="absolute bottom-[30%] left-[15%] w-2 h-2 bg-terracotta/20 rounded-full animate-gentle-float" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-[60%] right-[10%] w-1 h-1 bg-cta/40 rounded-full animate-gentle-float" style={{ animationDelay: '1.2s' }} />
      </div>
      
      <div className="container-narrow relative">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-gradient-to-r from-terracotta/50 to-transparent" />
            <h2 className="text-xl md:text-2xl font-medium">
              What you'll feel
            </h2>
          </div>
          
          <ul className="space-y-4">
            {experiences.map((experience, index) => (
              <li 
                key={index}
                className="flex items-center gap-4 p-4 rounded-2xl bg-sand/30 hover:bg-sand/50 transition-all duration-300 hover:translate-x-2 group"
                style={{ animationDelay: experience.delay }}
              >
                <div className="w-10 h-10 rounded-full bg-cta/20 flex items-center justify-center group-hover:bg-cta/30 transition-colors">
                  <experience.icon className="w-5 h-5 text-cta" />
                </div>
                <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                  {experience.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
