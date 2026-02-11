import { Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const TestimonialsSection = () => {
  const { t } = useLanguage();

  const testimonials = [
    { quote: t("testimonials.1"), name: "Sarah" },
    { quote: t("testimonials.2"), name: "Lina" },
    { quote: t("testimonials.3"), name: "Ahmed" },
    { quote: t("testimonials.4"), name: "Fatima" },
    { quote: t("testimonials.5"), name: "Youssef" },
  ];

  const TestimonialCard = ({ quote, name }: { quote: string; name: string }) => (
    <div className="bg-background/60 p-5 rounded-xl space-y-3 h-full">
      <Quote className="w-6 h-6 text-terracotta/30" />
      <p className="text-foreground/70 italic text-sm leading-relaxed">"{quote}"</p>
      <p className="text-sm text-foreground/80">— {name}</p>
    </div>
  );

  return (
    <section className="py-12 md:py-16 bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-medium text-center">{t("testimonials.title")}</h2>
          <div className="md:hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-2">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-2 basis-[85%]">
                    <TestimonialCard quote={testimonial.quote} name={testimonial.name} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <p className="text-center text-sm text-foreground/50 mt-4">{t("testimonials.swipe")}</p>
          </div>
          <div className="hidden md:grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <TestimonialCard key={index} quote={testimonial.quote} name={testimonial.name} />
            ))}
          </div>
          <div className="hidden md:grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            {testimonials.slice(3).map((testimonial, index) => (
              <TestimonialCard key={index + 3} quote={testimonial.quote} name={testimonial.name} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
