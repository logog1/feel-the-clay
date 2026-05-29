import { useParams, Link } from "react-router-dom";
import { useHotelPartnerBySlug } from "@/hooks/use-hotel-partners";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight, Hotel, Sparkles, Phone, Mail, Globe, MapPin } from "lucide-react";

export default function PartnerLanding() {
  const { slug } = useParams<{ slug: string }>();
  const { partner, loading } = useHotelPartnerBySlug(slug);
  const { language } = useLanguage();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <Hotel className="w-12 h-12 text-muted-foreground/50" />
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <Link to="/" className="text-primary underline">Back to home</Link>
      </div>
    );
  }

  const intro =
    (language === "fr" && partner.intro_fr) ||
    (language === "es" && partner.intro_es) ||
    (language === "ar" && partner.intro_ar) ||
    partner.intro_en ||
    "";

  const brand = partner.brand_color;
  const waLink = partner.whatsapp
    ? `https://wa.me/${partner.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, I'd like to book a craft experience at ${partner.name}.`)}`
    : null;

  return (
    <div className="min-h-screen bg-background" style={{ ["--brand" as string]: brand }}>
      <SEOHead
        title={`${partner.name} × Terraria craft experiences`}
        description={intro || `Craft workshops and cultural experiences for ${partner.name} guests.`}
        path={`/partners/${partner.slug}`}
        image={partner.cover_image || undefined}
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: partner.cover_image
            ? `linear-gradient(180deg, ${brand}55, ${brand}aa), url(${partner.cover_image}) center/cover`
            : `linear-gradient(135deg, ${brand} 0%, ${brand}cc 100%)`,
        }}
      >
        <div className="container-wide py-20 md:py-28 text-white relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs uppercase tracking-[0.2em] mb-5">
            <Sparkles size={12} /> {partner.type === "riad" ? "Riad partnership" : partner.type === "boutique" ? "Boutique partnership" : "Hotel partnership"}
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold mb-4 max-w-3xl leading-tight">
            {partner.name} × Terraria
          </h1>
          {partner.city && (
            <p className="flex items-center gap-1.5 text-white/80 mb-5 text-sm">
              <MapPin size={14} /> {partner.city}
            </p>
          )}
          {intro && <p className="max-w-2xl text-lg text-white/90 leading-relaxed">{intro}</p>}

          <div className="flex flex-wrap gap-3 mt-8">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-foreground font-medium hover:opacity-90 transition">
                Book a workshop <ArrowRight size={16} />
              </a>
            )}
            <Link to={`/partners/${partner.slug}/qr`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur text-white font-medium hover:bg-white/25 transition">
              Quick check-in
            </Link>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="section-padding">
        <div className="container-wide max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">What's included</h2>
          <p className="text-muted-foreground mb-8">Every advantage of our hotel & riad program, tailored to {partner.name}.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(partner.perks || []).filter((p) => p.enabled).map((perk) => (
              <div key={perk.key} className="p-5 rounded-2xl border border-border/40 bg-card flex gap-4">
                <div
                  className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white"
                  style={{ background: brand }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{perk.label}</h3>
                  {perk.desc && <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      {(partner.contact_email || partner.contact_phone || partner.website_url) && (
        <section className="section-padding bg-card">
          <div className="container-wide max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">Talk to us</h2>
            <p className="text-muted-foreground mb-6">
              {partner.contact_name ? `Reach out to ${partner.contact_name} to coordinate.` : "Reach out to coordinate."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {partner.contact_email && (
                <a href={`mailto:${partner.contact_email}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background hover:border-foreground/30 transition text-sm">
                  <Mail size={14} /> {partner.contact_email}
                </a>
              )}
              {partner.contact_phone && (
                <a href={`tel:${partner.contact_phone}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background hover:border-foreground/30 transition text-sm">
                  <Phone size={14} /> {partner.contact_phone}
                </a>
              )}
              {partner.website_url && (
                <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background hover:border-foreground/30 transition text-sm">
                  <Globe size={14} /> Website
                </a>
              )}
            </div>
            {waLink && (
              <div className="mt-6">
                <Button asChild size="lg" className="rounded-full" style={{ background: brand }}>
                  <a href={waLink} target="_blank" rel="noopener noreferrer">Book on WhatsApp <ArrowRight size={16} className="ml-1" /></a>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
