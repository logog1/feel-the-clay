import { MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const LocationSection = () => {
  const { t } = useLanguage();
  return (
    <section id="location" className="py-12 md:py-16 bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-medium">{t("location.title")}</h2>
          <div className="aspect-video md:aspect-[2/1] rounded-xl overflow-hidden">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d800!2d-5.35338!3d35.58475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b42526f4c8c0f%3A0x7a5e5e8c8c8c8c8c!2sTERRARIA%20Workshops!5e0!3m2!1sen!2sma!4v1705000000000!5m2!1sen!2sma" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="TERRARIA Workshops location" />
          </div>
          <a href="https://maps.app.goo.gl/h4c9BhEj1WZrESG59?g_st=ic" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors text-sm">
            <MapPin className="w-4 h-4" /><span>{t("location.maps")}</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
