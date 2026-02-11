import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useCountAnimation } from "@/hooks/use-count-animation";
import { Users, Heart, ShoppingBag, Calendar, Sparkles, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

const impact1 = "/images/impact-1.jpg";
const impact2 = "/images/impact-2.jpg";
const impact3 = "/images/impact-3.jpg";
const impact4 = "/images/impact-4.jpg";
const impact6 = "/images/impact-6.jpg";
const impact7 = "/images/impact-7.jpg";
const impact8 = "/images/impact-8.jpg";
const impact9 = "/images/impact-9.jpg";
const impact10 = "/images/impact-10.jpg";
const impact11 = "/images/impact-11.jpg";

interface MetricCardProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  subtitle?: string;
  delay: number;
  isVisible: boolean;
}

const MetricCard = ({ icon, value, suffix = "", label, subtitle, delay, isVisible }: MetricCardProps) => {
  const count = useCountAnimation(value, 2000, isVisible);
  return (
    <div className={cn("flex flex-col items-center p-6 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")} style={{ transitionDelay: `${delay}ms` }}>
      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-gentle-float">{icon}</div>
      <span className="text-4xl md:text-5xl font-semibold text-foreground">{count}{suffix}</span>
      <span className="text-sm text-muted-foreground mt-2 text-center">{label}</span>
      {subtitle && <span className="text-xs text-muted-foreground/70 mt-1 text-center">{subtitle}</span>}
    </div>
  );
};

const SocialImpactSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation(0.1);
  const { ref: metricsRef, isVisible: metricsVisible } = useScrollAnimation(0.2);
  const { ref: storyRef, isVisible: storyVisible } = useScrollAnimation(0.15);
  const { ref: galleryRef, isVisible: galleryVisible } = useScrollAnimation(0.1);
  const { t } = useLanguage();

  const metrics = [
    { icon: <Users className="w-7 h-7 text-primary" />, value: 700, suffix: "+", label: t("impact.people_hosted"), delay: 0 },
    { icon: <Heart className="w-7 h-7 text-primary" />, value: 6, suffix: "", label: t("impact.potters"), delay: 100 },
    { icon: <Briefcase className="w-7 h-7 text-primary" />, value: 9, suffix: "", label: t("impact.jobs"), subtitle: t("impact.jobs_sub"), delay: 200 },
    { icon: <ShoppingBag className="w-7 h-7 text-primary" />, value: 1200, suffix: "+", label: t("impact.products"), delay: 300 },
    { icon: <Calendar className="w-7 h-7 text-primary" />, value: 2, suffix: " yrs", label: t("impact.years"), delay: 400 },
  ];

  const images: { src: string; alt: string; size?: "large" | "medium" }[] = [
    { src: impact7, alt: "Group workshop session", size: "large" },
    { src: impact10, alt: "Friends at the workshop", size: "medium" },
    { src: impact1, alt: "Potter at work" },
    { src: impact2, alt: "Workshop moment" },
    { src: impact3, alt: "Community gathering" },
    { src: impact4, alt: "Pottery creation" },
    { src: impact8, alt: "Team selfie" },
    { src: impact9, alt: "Woman at pottery wheel" },
    { src: impact6, alt: "Finished pieces" },
    { src: impact11, alt: "Pottery lamp with workshop" },
  ];

  return (
    <section ref={sectionRef} className="section-padding bg-gradient-to-b from-background to-secondary/30 overflow-hidden">
      <div className="container-wide">
        <div className={cn("text-center mb-12 transition-all duration-700", sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t("impact.badge")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">{t("impact.title")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("impact.subtitle")}</p>
        </div>

        <div ref={storyRef} className={cn("max-w-2xl mx-auto mb-16 transition-all duration-700", storyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <div className="relative bg-card/40 backdrop-blur-sm rounded-3xl p-8 border border-border/30">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-lg">"</span>
            </div>
            <p className="text-foreground/90 leading-relaxed text-center">{t("impact.story")}</p>
          </div>
        </div>

        <div ref={metricsRef} className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-16">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} isVisible={metricsVisible} />
          ))}
        </div>

        <div ref={galleryRef} className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-3">
          {images.map((image, index) => (
            <div key={index} className={cn("relative overflow-hidden rounded-xl md:rounded-2xl group transition-all duration-700 aspect-square", galleryVisible ? "opacity-100 scale-100" : "opacity-0 scale-95", image.size === "large" && "col-span-2 row-span-2", image.size === "medium" && "col-span-1 row-span-1 md:col-span-2 md:row-span-2")} style={{ transitionDelay: `${index * 80}ms` }}>
              <img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        <p className={cn("text-center text-muted-foreground mt-12 text-sm transition-all duration-700 delay-500", galleryVisible ? "opacity-100" : "opacity-0")}>{t("impact.tagline")}</p>
      </div>
    </section>
  );
};

export default SocialImpactSection;
