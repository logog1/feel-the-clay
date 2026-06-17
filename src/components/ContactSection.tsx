import { useEffect, useState } from "react";
import { MapPin, Mail } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons/social";

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
