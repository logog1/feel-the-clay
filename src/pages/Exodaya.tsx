import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import tetouanCity from "@/assets/tetouan-city.jpg";
import potteryGirls from "@/assets/pottery-girls.jpg";
import workshopTools from "@/assets/workshop-tools.jpg";
import potteryEntrance from "@/assets/pottery-entrance.jpg";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "EXODAYA Art & Culture Residency in Tetouan",
  description: "A 5 to 7 day art and culture residency in Tetouan, Morocco, powered by Terraria Workshops.",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Tetouan, Morocco",
    address: { "@type": "PostalAddress", addressLocality: "Tetouan", addressCountry: "MA" },
  },
  organizer: { "@type": "Organization", name: "Terraria Workshops", url: "https://www.terrariaworkshops.com" },
};

const pillars = [
  "Pottery and painting workshops",
  "Old medina, Gnawa, and storytelling nights",
  "Moroccan kitchen class and rooftop dinners",
  "Beach day, yoga, hammam, and slow reset time",
  "Village culture day and local creative encounters",
  "Photography walks, cinema nights, and shared moments",
];

const schedule = [
  ["Day 1", "Arrival, riad check-in, welcome tea, rooftop dinner"],
  ["Day 2", "Painting workshop, guided old medina tour, outdoor cinema"],
  ["Day 3", "Pottery workshop, coffee tasting, Moroccan kitchen class"],
  ["Day 4", "Yoga, beach day, sunset picnic or hammam"],
  ["Day 5", "Local artists round table, village immersion, Gnawa night"],
  ["Day 6", "Reflection brunch, optional bicycle evening, departure flow"],
];

const Exodaya = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="EXODAYA Art Residency Tetouan"
        description="EXODAYA is a 5 to 7 day art and culture residency in Tetouan, Morocco, blending craft, food, medina life, nature, and local creative access."
        path="/exodaya"
        jsonLd={jsonLd}
      />
      <Header />

      <section className="relative min-h-[86vh] overflow-hidden pt-24 flex items-end">
        <img src={tetouanCity} alt="Tetouan city landscape for EXODAYA residency" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="relative z-10 w-full px-5 pb-14 md:pb-20">
          <div className="max-w-5xl mx-auto text-background">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-background/75 mb-4">Art & Culture Residency</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold leading-none tracking-normal">EXODAYA</h1>
            <p className="mt-6 max-w-2xl text-lg md:text-2xl text-background/85 leading-relaxed">
              A curated Moroccan creative escape in Tetouan, powered by Terraria Workshops.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-background/90">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 backdrop-blur-sm"><CalendarDays size={16} />5 to 7 days</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 backdrop-blur-sm"><Users size={16} />Small groups</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 backdrop-blur-sm"><MapPin size={16} />Tetouan, Morocco</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-24">
        <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cta font-medium mb-4">Concept</p>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">A residency that lets you feel Tetouan.</h2>
          </div>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>EXODAYA blends artistic practice, cultural immersion, and slow travel into one hosted experience. Guests do not simply visit the city, they enter its medina, crafts, food, music, coast, and creative community through private activities and shared moments.</p>
            <p>It is made for English-speaking solo travelers, couples, and friend groups who want authenticity, visual storytelling, and a meaningful local rhythm instead of a rushed tour.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-24 bg-foreground text-background">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-background/60 font-medium mb-4">Included rhythm</p>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">Creative work, local access, food, nature, and rest.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((item) => (
              <div key={item} className="rounded-2xl border border-background/15 bg-background/5 p-5 text-background/85">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-24">
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
          <img src={potteryGirls} alt="Creative pottery workshop during the residency" className="aspect-[4/5] w-full rounded-2xl object-cover" loading="lazy" />
          <img src={workshopTools} alt="Artisan tools and creative materials" className="aspect-[4/5] w-full rounded-2xl object-cover md:mt-12" loading="lazy" />
          <img src={potteryEntrance} alt="Terraria Workshops entrance in Tetouan" className="aspect-[4/5] w-full rounded-2xl object-cover" loading="lazy" />
        </div>
      </section>

      <section className="px-5 py-16 md:py-24 bg-sand-light/40">
        <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cta font-medium mb-4">Program</p>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight">Illustrative 6-day flow</h2>
          </div>
          <div className="space-y-3">
            {schedule.map(([day, plan]) => (
              <div key={day} className="grid gap-2 rounded-2xl bg-card p-5 shadow-sm sm:grid-cols-[90px_1fr]">
                <span className="font-semibold text-cta">{day}</span>
                <p className="text-muted-foreground">{plan}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-24">
        <div className="max-w-5xl mx-auto rounded-2xl bg-card p-8 md:p-12 shadow-sm border border-border/40">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cta font-medium mb-4">Reservations</p>
              <h2 className="text-3xl md:text-5xl font-semibold leading-tight">Fixed dates, limited rooms, hosted from arrival to closing.</h2>
              <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">Accommodation, meals, in-program transport, private workshops, curated visits, and on-site hosting are included. Shared and private room options are confirmed after inquiry.</p>
            </div>
            <Link to="/#booking" className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-cta/20 transition-all hover:bg-cta-hover active:scale-95">
              Inquire now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Exodaya;