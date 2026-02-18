import { MapPin, Mail } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

const WhatsAppIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const ContactSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.15);

  const contacts = [
    { icon: <Mail size={18} className="text-cta flex-shrink-0" />, label: "hello@terrariaworkshops.com", href: "mailto:hello@terrariaworkshops.com", truncate: true },
    { icon: <WhatsAppIcon />, label: "WhatsApp", href: "https://wa.me/message/SBUBJACPVCNGM1", external: true },
    { icon: <MapPin size={18} className="text-cta flex-shrink-0" />, label: t("contact.location"), href: "https://maps.app.goo.gl/h4c9BhEj1WZrESG59?g_st=ic", external: true },
  ];

  return (
    <section id="contact" ref={ref} className="py-14 md:py-20 bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-6">
          <div className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
            <h2 className="text-xl md:text-2xl font-medium">{t("contact.title")}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {contacts.map((c, i) => (
              <a
                key={i}
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "flex items-center gap-3 p-4 glass-card hover:border-cta/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-500 text-sm min-w-0",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                {c.icon}
                <span className={cn("text-foreground/80 text-xs sm:text-sm", c.truncate && "truncate break-all")}>{c.label}</span>
              </a>
            ))}
          </div>

          <div className={cn("aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden shadow-lg transition-all duration-700 delay-300", isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d800!2d-5.35338!3d35.58475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b42526f4c8c0f%3A0x7a5e5e8c8c8c8c8c!2sTERRARIA%20Workshops!5e0!3m2!1sen!2sma!4v1705000000000!5m2!1sen!2sma" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="TERRARIA Workshops location" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
