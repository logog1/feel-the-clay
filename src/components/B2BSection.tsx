import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { Building2, Users, Calendar, Award, ArrowRight } from "lucide-react";

const B2BSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const { t } = useLanguage();

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: t("b2b.feature1_title"),
      desc: t("b2b.feature1_desc"),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t("b2b.feature2_title"),
      desc: t("b2b.feature2_desc"),
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t("b2b.feature3_title"),
      desc: t("b2b.feature3_desc"),
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: t("b2b.feature4_title"),
      desc: t("b2b.feature4_desc"),
    },
  ];

  return (
    <section ref={sectionRef} className="section-padding bg-card">
      <div className="container-wide">
        <div className={cn(
          "max-w-4xl mx-auto transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Badge */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t("b2b.badge")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              {t("b2b.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              {t("b2b.subtitle")}
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {features.map((feature, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-4 p-5 rounded-2xl border border-border/40 bg-background hover:border-primary/30 transition-all duration-500 hover:shadow-md",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={cn(
            "text-center transition-all duration-700 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <a
              href="https://wa.me/212704969534?text=Hello%2C%20I%27m%20interested%20in%20organizing%20a%20workshop%20for%20our%20company%2Forganization."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {t("b2b.cta")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default B2BSection;
