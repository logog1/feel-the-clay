import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import euroafrica from "@/assets/partners/euroafrica.png";
import pgpr from "@/assets/partners/pgpr.png";
import medkhayr from "@/assets/partners/medkhayr.png";
import amendis from "@/assets/partners/amendis.png";
import cooperationTetouan from "@/assets/partners/cooperation-tetouan.png";

const TrustSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.15);
  const partners = [
    { src: euroafrica, alt: "Euroafrica Foundation" },
    { src: pgpr, alt: "PGPR Technologies" },
    { src: medkhayr, alt: "MEDkhayr" },
    { src: amendis, alt: "Amendis" },
    { src: cooperationTetouan, alt: "The Association of Cooperation Tetouan" },
  ];

  return (
    <section ref={ref} className="py-14 md:py-20">
      <div className="container-narrow">
        <div className="space-y-8">
          <p className={cn("text-sm text-muted-foreground text-center uppercase tracking-wider transition-all duration-700", isVisible ? "opacity-100" : "opacity-0")}>
            {t("trust.title")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {partners.map((partner, index) => (
              <div
                key={index}
                className={cn(
                  "h-20 md:h-36 transition-all duration-700 hover:scale-110 hover:-translate-y-1",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <img src={partner.src} alt={partner.alt} className="h-full w-auto object-contain drop-shadow-md hover:drop-shadow-xl transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
