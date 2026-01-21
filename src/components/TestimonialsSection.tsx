import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const testimonials = [
  {
    quote: "I came with zero experience and left with two pieces I'm proud of. The atmosphere was so relaxing.",
    name: "Sarah",
  },
  {
    quote: "The perfect way to disconnect. I forgot about my phone for 3 hours!",
    name: "Lina",
  },
  {
    quote: "Such a warm and welcoming experience. The guidance was gentle and helpful.",
    name: "Ahmed",
  },
  {
    quote: "A beautiful escape from the daily routine. I never knew working with clay could be so therapeutic!",
    name: "Fatima",
  },
  {
    quote: "The instructor was patient and encouraging. I'm already planning my next visit!",
    name: "Youssef",
  },
];

const TestimonialCard = ({ quote, name }: { quote: string; name: string }) => (
  <div className="bg-background/60 p-6 rounded-2xl space-y-4 h-full">
    <Quote className="w-8 h-8 text-terracotta/40" />
    <p className="text-foreground/80 italic leading-relaxed">
      "{quote}"
    </p>
    <p className="font-medium text-foreground">
      — {name}
    </p>
  </div>
);

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-10">
          <h2 className="text-2xl md:text-3xl font-medium text-center">
            What people are saying
          </h2>
          
          {/* Mobile: Swipeable Carousel */}
          <div className="md:hidden">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-2 basis-[85%]">
                    <TestimonialCard quote={testimonial.quote} name={testimonial.name} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <p className="text-center text-sm text-foreground/50 mt-4">Swipe to see more</p>
          </div>

          {/* Desktop: Grid */}
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
