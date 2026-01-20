import { Quote } from "lucide-react";

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
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-10">
          <h2 className="text-2xl md:text-3xl font-medium text-center">
            What people are saying
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-background/60 p-6 rounded-2xl space-y-4"
              >
                <Quote className="w-8 h-8 text-terracotta/40" />
                <p className="text-foreground/80 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <p className="font-medium text-foreground">
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
