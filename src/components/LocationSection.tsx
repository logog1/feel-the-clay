import { MapPin } from "lucide-react";

const LocationSection = () => {
  return (
    <section className="section-padding bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-medium">
            Find us
          </h2>
          
          <div className="space-y-6">
            {/* Map placeholder */}
            <div className="aspect-video md:aspect-[2/1] bg-sand-dark/30 rounded-2xl flex items-center justify-center overflow-hidden">
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 text-foreground/60 hover:text-foreground transition-colors"
              >
                <MapPin className="w-10 h-10" />
                <span className="font-medium">View on Google Maps</span>
              </a>
            </div>
            
            <p className="text-muted-foreground text-center">
              Detailed directions will be sent with your booking confirmation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
