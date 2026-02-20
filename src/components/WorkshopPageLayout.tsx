import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Coffee, MapPin, ChevronDown, Store, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";

interface Workshop {
  title: string;
  tagline: string;
  price: string;
  duration: string;
  drink: string;
  location?: string;
  description: string[];
  highlights: string[];
  images: string[];
  popular?: boolean;
  unavailable?: boolean;
}

const WhatsAppIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const otherWorkshopsData = [
  { titleKey: "offers.pottery" as const, link: "/workshop/pottery-experience" },
  { titleKey: "offers.handbuilding" as const, link: "/workshop/handbuilding" },
  { titleKey: "offers.embroidery" as const, link: "/workshop/embroidery" },
];

const WorkshopPageLayout = ({ workshop, currentPath }: { workshop: Workshop; currentPath: string }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  const handleBooking = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };
  const previewImages = workshop.images.slice(0, 2);
  const remainingImages = workshop.images.slice(2);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero image with overlay */}
      <div className="pt-16 relative">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <img src={workshop.images[0]} alt={workshop.title} className="w-full h-full object-cover animate-fade-in" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" style={{ top: '40%' }} />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <div className="space-y-8">
          {/* Title card */}
          <div className="animate-fade-up p-6 rounded-3xl bg-card border-2 border-border/40 shadow-sm -mt-16 relative z-10">
            <div className="flex flex-wrap gap-2 mb-3">
              {workshop.popular && (
                <span className="inline-flex items-center gap-1.5 bg-cta text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md shadow-cta/20">
                  <Star size={12} fill="currentColor" /> {t("offers.popular")}
                </span>
              )}
              {workshop.unavailable && (
                <span className="inline-flex items-center gap-1.5 border-2 border-destructive text-destructive text-xs font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
                  Coming Soon
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">{workshop.title}</h1>
            <p className="text-muted-foreground mt-2 text-lg">{workshop.tagline}</p>
          </div>

          {/* Quick info pills */}
          <div className="p-5 rounded-3xl bg-card border-2 border-border/40 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 bg-cta/10 border-2 border-cta/20 px-4 py-2.5 rounded-2xl text-sm font-medium text-foreground">
                <Clock size={15} className="text-cta" /> {workshop.duration}
              </span>
              <span className="flex items-center gap-2 bg-cta/10 border-2 border-cta/20 px-4 py-2.5 rounded-2xl text-sm font-medium text-foreground">
                <Coffee size={15} className="text-cta" /> {workshop.drink}
              </span>
              {workshop.location && (
                <span className="flex items-center gap-2 bg-cta/10 border-2 border-cta/20 px-4 py-2.5 rounded-2xl text-sm font-medium text-foreground">
                  <MapPin size={15} className="text-cta" /> {workshop.location}
                </span>
              )}
              <span className="bg-cta text-primary-foreground px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md shadow-cta/20">
                {workshop.price}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-3xl bg-card border-2 border-border/40 shadow-sm space-y-4">
            {workshop.description.map((p, i) => (
              <p key={i} className="text-foreground/80 leading-relaxed text-base">{p}</p>
            ))}
          </div>

          {/* Highlights */}
          <div className="rounded-3xl border-2 border-cta/20 bg-cta/5 p-6 shadow-sm">
            <h3 className="font-bold mb-5 text-lg text-foreground flex items-center gap-2">
              <Star size={16} className="text-cta" /> {t("workshop.included")}
            </h3>
            <ul className="space-y-3">
              {workshop.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="w-6 h-6 rounded-lg bg-cta/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cta text-xs font-bold">{i + 1}</span>
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Photos */}
          {workshop.images.length > 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {previewImages.slice(1).map((img, i) => (
                  <div key={i} className="aspect-square rounded-3xl overflow-hidden group border-2 border-border/40 shadow-sm">
                    <img src={img} alt={`${workshop.title} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                ))}
              </div>
              
              {remainingImages.length > 0 && (
                <>
                  <div className={cn("grid grid-cols-2 gap-4 transition-all duration-500", showAllPhotos ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0 overflow-hidden")}>
                    {remainingImages.map((img, i) => (
                      <div key={i} className="aspect-square rounded-3xl overflow-hidden group border-2 border-border/40 shadow-sm">
                        <img src={img} alt={`${workshop.title} ${i + 3}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAllPhotos(!showAllPhotos)}
                    className="flex items-center gap-2 mx-auto text-sm text-foreground/60 hover:text-foreground transition-colors bg-card border-2 border-border/40 px-5 py-2.5 rounded-2xl hover:border-cta/30"
                  >
                    <ChevronDown size={16} className={cn("transition-transform", showAllPhotos && "rotate-180")} />
                    {showAllPhotos ? t("workshop.hide_photos") : `${t("workshop.see_photos")} (${remainingImages.length})`}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="cta" size="lg" onClick={handleBooking} className="flex-1 text-base py-6 shadow-xl shadow-cta/20">
              {t("workshop.reserve")}
            </Button>
            <Button variant="ctaOutline" size="lg" asChild className="flex-1 py-6 border-2">
              <a href="https://wa.me/message/SBUBJACPVCNGM1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <WhatsAppIcon /> {t("workshop.message")}
              </a>
            </Button>
          </div>
        </div>

        {/* Other workshops */}
        <div className="mt-16 pt-8 border-t-2 border-border/30">
          <h3 className="text-lg font-bold mb-5 text-foreground tracking-tight">{t("workshop.explore")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherWorkshopsData
              .filter((w) => w.link !== currentPath)
              .map((w) => (
                <Link key={w.link} to={w.link} className="p-5 rounded-2xl bg-card border-2 border-border/40 hover:border-cta/30 transition-all duration-300 text-sm font-bold hover:shadow-lg hover:scale-[1.02] text-foreground flex items-center justify-between">
                  {t(w.titleKey)}
                  <ArrowLeft size={14} className="rotate-180 text-cta" />
                </Link>
              ))}
            <Link to="/store" className="p-5 rounded-2xl bg-card border-2 border-border/40 hover:border-cta/30 transition-all duration-300 text-sm font-bold hover:shadow-lg hover:scale-[1.02] flex items-center gap-2 text-foreground justify-between">
              <span className="flex items-center gap-2"><Store size={14} className="text-cta" /> {t("workshop.visit_store")}</span>
              <ArrowLeft size={14} className="rotate-180 text-cta" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WorkshopPageLayout;
