import { useEffect, useState } from "react";
import { MapPin, Mail } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const WhatsAppIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const DEFAULTS = {
  email: "hello@terrariaworkshops.com",
  whatsapp: "https://wa.me/message/SBUBJACPVCNGM1",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d800!2d-5.35338!3d35.58475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b42526f4c8c0f%3A0x7a5e5e8c8c8c8c8c!2sTERRARIA%20Workshops!5e0!3m2!1sen!2sma!4v1705000000000!5m2!1sen!2sma",
};

const ContactSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.15);
  const [info, setInfo] = useState(DEFAULTS);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["public_email", "public_whatsapp", "public_map_url"]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        setInfo({
          email: map["public_email"] || DEFAULTS.email,
          whatsapp: map["public_whatsapp"] || DEFAULTS.whatsapp,
          mapUrl: map["public_map_url"] || DEFAULTS.mapUrl,
        });
      }
    };
    load();
  }, []);

  const contacts = [
    { icon: <Mail size={18} className="text-cta flex-shrink-0" />, label: info.email, href: `mailto:${info.email}`, truncate: true },
    { icon: <WhatsAppIcon />, label: "WhatsApp", href: info.whatsapp, external: true },
    { icon: <MapPin size={18} className="text-cta flex-shrink-0" />, label: t("contact.location"), href: "https://maps.app.goo.gl/h4c9BhEj1WZrESG59?g_st=ic", external: true },
    { icon: <InstagramIcon />, label: "@terraria_workshops", href: "https://www.instagram.com/terraria_workshops", external: true, gradient: true },
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
                  "flex items-center gap-3 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-500 text-sm min-w-0 rounded-xl",
                  c.gradient
                    ? "text-white font-medium shadow-lg"
                    : "glass-card hover:border-cta/30",
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{
                  transitionDelay: `${(i + 1) * 100}ms`,
                  ...(c.gradient ? { background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" } : {}),
                }}
              >
                {c.icon}
                <span className={cn(
                  "text-xs sm:text-sm",
                  c.gradient ? "text-white" : "text-foreground/80",
                  c.truncate && "truncate break-all"
                )}>{c.label}</span>
              </a>
            ))}
          </div>

          <div className={cn("aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden shadow-lg transition-all duration-700 delay-300", isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
            <iframe src={info.mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="TERRARIA Workshops location" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
