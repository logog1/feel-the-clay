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
            {/* Map embed */}
            <div className="aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3245.8!2d-5.3626!3d35.5889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b4251d7eb4c45%3A0x8c2e4f8e2c9e8d0a!2sTetouan%2C%20Morocco!5e0!3m2!1sen!2sma!4v1705000000000!5m2!1sen!2sma"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Workshop location in Tetouan, Morocco"
              />
            </div>
            
            <a 
              href="https://maps.app.goo.gl/h4c9BhEj1WZrESG59?g_st=ic" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Open in Google Maps</span>
            </a>
            
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
