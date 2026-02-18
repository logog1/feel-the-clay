import { Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const TestimonialsSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.15);

  const testimonials = [
    { quote: t("testimonials.1"), name: "Sarah" },
    { quote: t("testimonials.2"), name: "Lina" },
    { quote: t("testimonials.3"), name: "Ahmed" },
    { quote: t("testimonials.4"), name: "Fatima" },
    { quote: t("testimonials.5"), name: "Youssef" },
  ];

  const TestimonialCard = ({ quote, name, index }: { quote: string; name: string; index: number }) => (
    <div className={cn(
      "glass-card p-5 md:p-6 space-y-3 h-full hover:shadow-lg hover:shadow-cta/5 hover:-translate-y-1 transition-all duration-500",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    )} style={{ transitionDelay: `${index * 100}ms` }}>
      <div className="w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
        <Quote className="w-4 h-4 text-cta" />
      </div>
      <p className="text-foreground/70 italic text-sm leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-terracotta/20 flex items-center justify-center">
          <span className="text-xs font-bold text-terracotta">{name[0]}</span>
        </div>
        <p className="text-sm font-medium text-foreground/80">{name}</p>
      </div>
    </div>
  );

  return (
    <section ref={ref} className="py-14 md:py-20 bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-8">
          <div className={cn("text-center transition-all duration-700", isVisible ? "opacity-100" : "opacity-0")}>
            <span className="text-xs uppercase tracking-[0.3em] text-cta font-medium">{t("testimonials.title")}</span>
          </div>
          <div className="md:hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-3">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-3 basis-[82%]">
                    <TestimonialCard quote={testimonial.quote} name={testimonial.name} index={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <p className="text-center text-xs text-foreground/40 mt-4">{t("testimonials.swipe")}</p>
          </div>
          <div className="hidden md:grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <TestimonialCard key={index} quote={testimonial.quote} name={testimonial.name} index={index} />
            ))}
          </div>
          <div className="hidden md:grid gap-5 md:grid-cols-2 max-w-2xl mx-auto">
            {testimonials.slice(3).map((testimonial, index) => (
              <TestimonialCard key={index + 3} quote={testimonial.quote} name={testimonial.name} index={index + 3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
