import { useLanguage } from "@/i18n/LanguageContext";
import euroafrica from "@/assets/partners/euroafrica.png";
import pgpr from "@/assets/partners/pgpr.png";
import medkhayr from "@/assets/partners/medkhayr.png";
import amendis from "@/assets/partners/amendis.png";
import cooperationTetouan from "@/assets/partners/cooperation-tetouan.png";

const TrustSection = () => {
  const { t } = useLanguage();
  const partners = [
    { src: euroafrica, alt: "Euroafrica Foundation" },
    { src: pgpr, alt: "PGPR Technologies" },
    { src: medkhayr, alt: "MEDkhayr" },
    { src: amendis, alt: "Amendis" },
    { src: cooperationTetouan, alt: "The Association of Cooperation Tetouan" },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="container-narrow">
        <div className="space-y-10">
          <p className="text-sm text-muted-foreground text-center uppercase tracking-wider">{t("trust.title")}</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            {partners.map((partner, index) => (
              <div key={index} className="h-24 md:h-40 transition-all duration-500 hover:scale-110 hover:-translate-y-1" style={{ animation: `gentle-float 3s ease-in-out infinite`, animationDelay: `${index * 0.3}s` }}>
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
