import euroafrica from "@/assets/partners/euroafrica.png";
import pgpr from "@/assets/partners/pgpr.png";
import medkhayr from "@/assets/partners/medkhayr.png";
import amendis from "@/assets/partners/amendis.png";
import cooperationTetouan from "@/assets/partners/cooperation-tetouan.png";

const TrustSection = () => {
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
          <p className="text-sm text-muted-foreground text-center uppercase tracking-wider">
            They trust us
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            {partners.map((partner, index) => (
              <div 
                key={index}
                className="h-24 md:h-40 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              >
                <img 
                  src={partner.src}
                  alt={partner.alt}
                  className="h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
