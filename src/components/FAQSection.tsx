import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need any prior experience?",
    answer: "Not at all! Our workshop is designed for complete beginners. We'll guide you through every step.",
  },
  {
    question: "What should I wear?",
    answer: "Wear comfortable clothes that can get a little messy. We provide aprons, but clay has a way of finding its way around.",
  },
  {
    question: "How many pieces can I make?",
    answer: "As many as you'd like during the 3 hours! Most people create 2-4 pieces.",
  },
  {
    question: "When will I receive my finished pottery?",
    answer: "Your pieces need to dry and be fired in the kiln, which takes about 2-3 weeks. We'll contact you when they're ready for pickup.",
  },
  {
    question: "Can I bring a friend or group?",
    answer: "Absolutely! We keep groups small and intimate, but you're welcome to book together. For private group sessions, please reach out via WhatsApp.",
  },
  {
    question: "Is there parking available?",
    answer: "Yes, there's street parking nearby. Detailed directions will be sent with your booking confirmation.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-narrow">
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-medium text-center">
            Questions
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-sand-dark/30">
                <AccordionTrigger className="text-left hover:no-underline hover:text-terracotta transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
