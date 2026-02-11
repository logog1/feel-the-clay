import { Link } from "react-router-dom";
import workshop2 from "@/assets/workshop-2.jpg";
import workshop7 from "@/assets/workshop-7.jpg";
import workshop17 from "@/assets/workshop-17.jpg";

const offers = [
  {
    title: "Full Pottery Experience",
    image: workshop2,
    link: "/workshop/pottery-experience",
  },
  {
    title: "Handbuilding Workshop",
    image: workshop7,
    link: "/workshop/handbuilding",
    popular: true,
  },
  {
    title: "Embroidery Workshop",
    image: workshop17,
    link: "/workshop/embroidery",
  },
];

const OffersSection = () => {
  return (
    <section id="offers" className="py-12 md:py-20 bg-sand-light/30">
      <div className="container-wide px-6">
        <h2 className="text-xl md:text-2xl font-medium text-center mb-10">
          Our Workshops
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {offers.map((offer) => (
            <Link
              key={offer.title}
              to={offer.link}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] block"
            >
              {/* Badge */}
              {offer.popular && (
                <span className="absolute top-3 left-3 z-10 bg-cta text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5">
                <h3 className="text-white text-lg md:text-xl font-medium leading-tight">
                  {offer.title}
                </h3>
                <p className="text-white/70 text-xs mt-2 group-hover:text-white transition-colors">
                  Tap for more info →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Store button */}
        <div className="text-center mt-10">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-sm font-medium border border-foreground/30 hover:border-foreground/60 px-6 py-2.5 rounded-full"
          >
            🏺 Visit our Store
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
