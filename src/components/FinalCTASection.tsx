import { Button } from "@/components/ui/button";

const FinalCTASection = () => {
  return (
    <section className="section-padding bg-sand-dark/40">
      <div className="container-narrow text-center">
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-light">
            Ready to get your hands in the clay?
          </h2>
          
          <p className="text-lg text-foreground/80 max-w-md mx-auto">
            We'd love to have you join us. Choose a date that works for you 
            and we'll take care of the rest.
          </p>
          
          <div className="pt-4">
            <Button variant="cta" size="xl">
              Reserve your spot
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground pt-6">
            Questions? Just reply to your confirmation email — we're happy to help.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
