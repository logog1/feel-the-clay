import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useHotelPartnerBySlug } from "@/hooks/use-hotel-partners";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import SEOHead from "@/components/SEOHead";
import BookingFormSection from "@/components/BookingFormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ArrowRight, Hotel, Sparkles, Phone, Mail, Globe, MapPin, Clock, Users, Loader2, Calendar, X, Check, Shield, MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteGallery, type GalleryKey } from "@/hooks/use-site-galleries";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Match an offer to the closest workshop gallery so the details modal can pull
// in-house craft photos instead of showing just the single cover image.
function galleryKeyForOffer(o: { title: string; subtitle?: string | null; tags?: string[] }): GalleryKey | null {
  const hay = [o.title, o.subtitle || "", ...(o.tags || [])].join(" ").toLowerCase();
  if (/zellij|zellige/.test(hay)) return "gallery_workshop_zellij";
  if (/pottery|throw/.test(hay)) return "gallery_workshop_pottery";
  if (/handbuild|hand-build|clay/.test(hay)) return "gallery_workshop_handbuilding";
  if (/embroid|stitch|thread/.test(hay)) return "gallery_workshop_embroidery";
  if (/carpet|rug|weav/.test(hay)) return "gallery_workshop_carpets";
  if (/garden|plant|pot/.test(hay)) return "gallery_workshop_gardening";
  return null;
}

type Experience = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  cover_image: string | null;
  category: string;
  audience: string;
  duration_minutes: number;
  difficulty: string;
  price_per_person: number;
  currency: string;
  capacity: number;
  location: string | null;
  scheduled_at: string;
};

type PartnerOfferPublic = {
  assignment_id: string;
  offer_id: string;
  kind: "offer" | "event";
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image: string | null;
  cta_type: "book" | "whatsapp" | "link" | "none";
  cta_value: string | null;
  cta_label: string | null;
  price: number | null;
  currency: string;
  starts_at: string | null;
  ends_at: string | null;
  event_at: string | null;
  capacity: number | null;
  tags: string[];
};

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All experiences" },
  { id: "in-hotel", label: "In-property" },
  { id: "excursion", label: "Excursion" },
  { id: "outdoor", label: "Outdoor" },
  { id: "cultural", label: "Cultural" },
  { id: "signature", label: "Signature" },
];

export default function PartnerLanding() {
  const { slug } = useParams<{ slug: string }>();
  const { partner, loading } = useHotelPartnerBySlug(slug);
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [expLoading, setExpLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [taken, setTaken] = useState<Record<string, number>>({});
  const [offers, setOffers] = useState<PartnerOfferPublic[]>([]);
  const [bookingOffer, setBookingOffer] = useState<PartnerOfferPublic | null>(null);
  const [detailsOffer, setDetailsOffer] = useState<PartnerOfferPublic | null>(null);
  const [bookMode, setBookMode] = useState<"small" | "large">("small");

  const refreshAvailability = async () => {
    const { data } = await supabase.rpc("get_sofitel_availability");
    if (data) {
      const map: Record<string, number> = {};
      (data as any[]).forEach((r) => { map[r.experience_id] = r.taken; });
      setTaken(map);
    }
  };

  useEffect(() => {
    if (!partner?.id) return;
    (async () => {
      setExpLoading(true);
      const { data } = await supabase
        .from("sofitel_experiences")
        .select("*")
        .eq("partner_id", partner.id)
        .eq("is_active", true)
        .order("scheduled_at", { ascending: true });
      setExperiences((data || []) as Experience[]);
      setExpLoading(false);
    })();
    (async () => {
      const { data } = await (supabase as any)
        .from("partner_offers_public")
        .select("*")
        .eq("partner_id", partner.id)
        .order("assignment_sort", { ascending: true });
      setOffers((data || []) as PartnerOfferPublic[]);
    })();
    refreshAvailability();
    // Log QR scan / landing visit via edge function (captures variant + session)
    try {
      const key = `qr_logged_${partner.id}`;
      const variant = new URLSearchParams(window.location.search).get("v");
      const existingSid = sessionStorage.getItem("qr_sid") || undefined;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        supabase.functions
          .invoke("qr-scan", { body: { slug: partner.slug, variant, session_id: existingSid } })
          .then(({ data }: any) => {
            if (data?.session_id) sessionStorage.setItem("qr_sid", data.session_id);
            if (data?.variant_code) {
              sessionStorage.setItem(`qr_variant_${partner.id}`, data.variant_code);
              sessionStorage.setItem(`qr_scope_${partner.id}`, data.variant_scope || "property");
              // Pre-fill room number when variant is room-scoped and code looks like r-<num>
              if (data.variant_scope === "room") {
                const m = String(data.variant_code).match(/(\d+)/);
                if (m) sessionStorage.setItem(`qr_room_${partner.id}`, m[1]);
              }
            }
          });
      }
    } catch { /* non-blocking */ }
    const i = setInterval(refreshAvailability, 25000);
    return () => clearInterval(i);
  }, [partner?.id, partner?.slug]);

  const days = useMemo(() => {
    const seen = new Map<string, Date>();
    experiences.forEach((e) => {
      const d = parseISO(e.scheduled_at);
      const k = format(d, "yyyy-MM-dd");
      if (!seen.has(k)) seen.set(k, d);
    });
    return Array.from(seen.entries()).map(([key, date]) => ({ key, date }));
  }, [experiences]);

  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      const cat = filter === "all" || e.category === filter || e.audience === filter;
      const day = !activeDay || format(parseISO(e.scheduled_at), "yyyy-MM-dd") === activeDay;
      return cat && day;
    });
  }, [experiences, filter, activeDay]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("partner.loading")}</div>;
  }
  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <Hotel className="w-12 h-12 text-muted-foreground/50" />
        <h1 className="text-2xl font-semibold">{t("partner.not_found")}</h1>
        <Link to="/" className="text-primary underline">{t("partner.back_home")}</Link>
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
    ? `https://wa.me/${partner.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(t("partner.hero.wa_hello").replace("{name}", partner.name))}`
    : null;

  return (
    <div className="min-h-screen bg-background" style={{ ["--brand" as string]: brand }} dir={dir}>
      <SEOHead
        title={`${partner.name} × Terraria craft experiences`}
        description={intro || `Craft workshops and cultural experiences for ${partner.name} guests.`}
        path={`/partners/${partner.slug}`}
        image={partner.cover_image || undefined}
      />

      {/* HERO — cinematic cover */}
      <header className="relative overflow-hidden min-h-[78vh] flex items-end">
        <div className="absolute inset-0">
          {partner.cover_image ? (
            <img src={partner.cover_image} alt={partner.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle at 30% 20%, ${brand}ee, ${brand}99 60%, ${brand}55 100%)` }}
            >
              {partner.logo_url ? (
                <img src={partner.logo_url} alt={partner.name} className="max-h-32 w-auto opacity-30" />
              ) : (
                <span className="text-7xl md:text-9xl font-light text-white/10 capitalize tracking-tight px-6 text-center">
                  {partner.name}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${brand}33 0%, transparent 30%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.85) 100%)`,
          }}
        />

        <div className="relative z-10 container-wide py-16 md:py-20 text-white w-full">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-md mb-6 bg-white/15 border border-white/20">
            {partner.logo_url ? (
              <img src={partner.logo_url} alt={partner.name} className="h-5 w-auto" />
            ) : (
              <span className="text-[11px] tracking-[0.28em] uppercase">{partner.name}</span>
            )}
            <span className="text-base italic opacity-80">×</span>
            <span className="text-[11px] tracking-[0.28em] uppercase">Terraria</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.02] mb-4 max-w-3xl">
            {t("partner.hero.title1")} <span className="italic opacity-90">{t("partner.hero.title2")}</span>
          </h1>
          {partner.city && (
            <p className="flex items-center gap-1.5 text-white/80 mb-4 text-sm uppercase tracking-[0.2em]">
              <MapPin size={13} /> {partner.city}
            </p>
          )}
          {intro && <p className="max-w-2xl text-base md:text-lg text-white/90 leading-relaxed">{intro}</p>}

          <div className="flex flex-wrap gap-3 mt-8">
            <a href="#offers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium hover:opacity-90 transition text-white"
              style={{ background: brand }}>
              {t("partner.hero.explore")} <ArrowRight size={16} className={cn(isRTL && "rotate-180")} />
            </a>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur text-white font-medium hover:bg-white/25 transition">
                {t("partner.hero.book_whatsapp")}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* MARQUEE STRIP */}
      <div className="relative overflow-hidden border-y border-border/40 bg-card">
        <div className="flex gap-10 py-3 whitespace-nowrap animate-[marquee_40s_linear_infinite] will-change-transform">
          {Array.from({ length: 2 }).map((_, copy) => (
            <div key={copy} className="flex items-center gap-10 shrink-0">
              {(["partner.marquee.pottery","partner.marquee.zellige","partner.marquee.weaving","partner.marquee.painting","partner.marquee.gardens","partner.marquee.cooking","partner.marquee.cooperatives","partner.marquee.signature"] as const).map((k, i) => (
                <span key={`${copy}-${i}`} className="text-[11px] uppercase tracking-[0.3em] inline-flex items-center gap-3" style={{ color: brand }}>
                  {t(k)}
                  <span className="w-1 h-1 rounded-full" style={{ background: brand }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>


      {/* OFFERS & EVENTS */}
      {offers.length > 0 && (
        <section id="offers" className="section-padding">
          <div className="container-wide max-w-6xl">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: brand }}>{t("partner.offers.eyebrow")}</p>
              <h2 className="text-3xl md:text-4xl font-light">{t("partner.offers.title")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {offers.map((o) => {
                const cta = (() => {
                  if (o.cta_type === "none") return null;
                  if (o.cta_type === "whatsapp" && o.cta_value) {
                    const num = o.cta_value.replace(/\D/g, "");
                    const msg = encodeURIComponent(t("partner.offers.event_interest").replace("{partner}", partner.name).replace("{title}", o.title));
                    return { href: `https://wa.me/${num}?text=${msg}`, label: o.cta_label || t("partner.offers.whatsapp_us"), external: true };
                  }
                  if (o.cta_type === "link" && o.cta_value) {
                    return { href: o.cta_value, label: o.cta_label || t("partner.offers.learn_more"), external: true };
                  }
                  if (o.kind === "event") {
                    return { onClick: () => setBookingOffer(o), label: o.cta_label || t("partner.offers.reserve_spot") };
                  }
                  return { href: "#offers", label: o.cta_label || t("partner.offers.book_workshop"), external: false };
                })();
                return (
                  <article
                    key={o.assignment_id}
                    onClick={() => setDetailsOffer(o)}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition cursor-pointer text-start focus:outline-none focus:ring-2 focus:ring-offset-2"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetailsOffer(o); } }}
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                      {o.cover_image ? (
                        <img src={o.cover_image} alt={o.title} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: `linear-gradient(135deg, ${brand}, ${brand}aa)` }}>
                          <Sparkles className="text-white/40" size={36} />
                        </div>
                      )}
                      <span className="absolute bottom-3 end-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/90 text-foreground shadow-sm">
                        {t("partner.offers.view_details")} <ArrowRight size={11} className={cn(isRTL && "rotate-180")} />
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: brand }}>
                        <span className="px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: brand }}>
                          {o.kind === "event" ? t("partner.offers.event") : t("partner.offers.offer")}
                        </span>
                        {o.kind === "event" && o.event_at && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar size={11} /> {format(parseISO(o.event_at), "MMM d, HH:mm")}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{o.title}</h3>
                      {o.subtitle && <p className="text-sm text-muted-foreground mb-2">{o.subtitle}</p>}
                      {o.description && <p className="text-sm text-foreground/80 line-clamp-3 mb-3">{o.description}</p>}
                      <div className="flex items-center justify-between gap-3 mt-3">
                        <div className="text-sm">
                          {o.price != null && (
                            <span className="font-semibold">{o.price} {o.currency}</span>
                          )}
                          {o.capacity != null && (
                            <span className="text-xs text-muted-foreground ms-2">· {o.capacity} {t("partner.offers.spots")}</span>
                          )}
                        </div>
                        {cta && (
                          "onClick" in cta ? (
                            <button onClick={(e) => { e.stopPropagation(); cta.onClick!(); }}
                              className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80" style={{ color: brand }}>
                              {cta.label} <ArrowRight size={14} className={cn(isRTL && "rotate-180")} />
                            </button>
                          ) : cta.external ? (
                            <a href={cta.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80" style={{ color: brand }}>
                              {cta.label} <ArrowRight size={14} className={cn(isRTL && "rotate-180")} />
                            </a>
                          ) : (
                            <a href={cta.href} onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80" style={{ color: brand }}>
                              {cta.label} <ArrowRight size={14} className={cn(isRTL && "rotate-180")} />
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}


      {/* Concierge contact — branded */}
      <section className="section-padding">
        <div className="container-wide max-w-3xl text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: brand }}>{t("partner.concierge.eyebrow")}</p>
          <h2 className="text-2xl md:text-3xl font-light mb-3">{t("partner.concierge.title")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("partner.concierge.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium hover:opacity-90 transition"
                style={{ background: brand }}>
                <MessageCircle size={14} /> {t("partner.concierge.whatsapp")}
              </a>
            )}
            {partner.website_url && (
              <a href={partner.website_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-background hover:border-foreground/30 transition text-sm">
                <Globe size={14} /> {partner.name} {t("partner.concierge.website")}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* BOOKING — small groups pick a scheduled slot, big groups request a custom time */}
      <section id="book" className="bg-background section-padding">
        <div className="container-wide max-w-5xl">
          <div className="text-center mb-8">
            <p className="text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: brand }}>{t("partner.book_section.eyebrow") || "Book"}</p>
            <h2 className="text-3xl md:text-4xl font-light">{t("partner.book_section.title") || "Reserve your experience"}</h2>
          </div>

          {/* Group-size toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 rounded-full border border-border bg-card">
              <button
                onClick={() => setBookMode("small")}
                className={cn(
                  "px-4 py-2 rounded-full text-xs md:text-sm font-medium transition",
                  bookMode === "small" ? "text-white" : "text-muted-foreground hover:text-foreground"
                )}
                style={bookMode === "small" ? { background: brand } : undefined}
              >
                <Users size={13} className="inline me-1.5" />
                {t("partner.book_section.small") || "1–3 guests · pick a time"}
              </button>
              <button
                onClick={() => setBookMode("large")}
                className={cn(
                  "px-4 py-2 rounded-full text-xs md:text-sm font-medium transition",
                  bookMode === "large" ? "text-white" : "text-muted-foreground hover:text-foreground"
                )}
                style={bookMode === "large" ? { background: brand } : undefined}
              >
                <Users size={13} className="inline me-1.5" />
                {t("partner.book_section.large") || "4+ guests · request a time"}
              </button>
            </div>
          </div>

          {bookMode === "small" ? (
            <SmallGroupSlots
              experiences={experiences}
              taken={taken}
              offers={offers}
              brand={brand}
              isRTL={isRTL}
              onPickExperience={(e) => setSelected(e)}
              onPickOffer={(o) => setBookingOffer(o)}
              t={t}
            />
          ) : (
            <div>
              <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl border border-dashed" style={{ borderColor: `${brand}55`, background: `${brand}08` }}>
                <p className="text-sm text-foreground/80 leading-relaxed text-center">
                  {t("partner.book_section.large_note") ||
                    "This form is for guests who can't find a time that suits them in the schedule above — request another date during the week or a future one, and our team will confirm."}
                </p>
              </div>
              <BookingFormSection />
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground capitalize">
        <p className="capitalize">{partner.name} × Terraria · {t("partner.footer")}</p>
      </footer>

      {selected && (
        <BookingDialog
          experience={selected}
          partnerId={partner.id}
          brand={brand}
          remaining={Math.max(0, selected.capacity - (taken[selected.id] || 0))}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); refreshAvailability(); }}
        />
      )}

      {bookingOffer && (
        <OfferBookingDialog
          offer={bookingOffer}
          partner={{ id: partner.id, name: partner.name }}
          brand={brand}
          onClose={() => setBookingOffer(null)}
        />
      )}

      {detailsOffer && (
        <OfferDetailsDialog
          offer={detailsOffer}
          brand={brand}
          onClose={() => setDetailsOffer(null)}
          onReserve={() => {
            const o = detailsOffer;
            setDetailsOffer(null);
            if (o.kind === "event") setBookingOffer(o);
            else document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

function DayChip({ label, active, onClick, brand }: { label: string; active: boolean; onClick: () => void; brand: string }) {
  return (
    <button onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition shrink-0"
      style={{
        background: active ? brand : "transparent",
        color: active ? "white" : "inherit",
        borderColor: active ? brand : "hsl(var(--border))",
      }}>
      {label}
    </button>
  );
}

function ExperienceCard({ exp, brand, remaining, onBook }: { exp: Experience; brand: string; remaining: number; onBook: () => void }) {
  const date = parseISO(exp.scheduled_at);
  const full = remaining === 0;
  const low = !full && remaining <= 3;
  return (
    <article className="group rounded-3xl overflow-hidden bg-background border border-border/40 flex flex-col hover:-translate-y-1 transition-transform duration-300">
      <div className="aspect-[4/5] relative overflow-hidden bg-muted">
        {exp.cover_image ? (
          <img src={exp.cover_image} alt={exp.title} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${brand}, ${brand}aa)` }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
        <div className="absolute top-3 start-3 end-3 flex justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/90 text-foreground">
            {exp.category}
          </span>
          {(full || low) && (
            <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full font-medium"
              style={{
                background: full ? "#0E1418" : brand,
                color: "white",
              }}>
              {full ? "Fully booked" : `Only ${remaining} left`}
            </span>
          )}
        </div>
        <div className="absolute bottom-0 start-0 end-0 p-4 text-white">
          {exp.subtitle && (
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-90 mb-1.5" style={{ color: brand }}>
              {exp.subtitle}
            </p>
          )}
          <h3 className="text-2xl font-light leading-tight">{exp.title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3">{exp.description}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock size={11} />{format(date, "EEE d MMM · HH:mm")}</span>
          <span className="inline-flex items-center gap-1"><Users size={11} />{exp.capacity}</span>
          {exp.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{exp.location}</span>}
        </div>
        <div className="flex items-end justify-between gap-3 pt-3 border-t border-border/40 mt-auto">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">From</p>
            <p className="text-xl font-light">
              {exp.price_per_person > 0 ? <>{exp.price_per_person} <span className="text-xs opacity-70">{exp.currency}</span></> : <em className="text-sm">On request</em>}
            </p>
            {exp.price_per_person > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                <Shield size={10} /> per person · taxes incl · free cancel 24h
              </p>
            )}
          </div>
          <Button size="sm" disabled={full} onClick={onBook} className="rounded-full text-xs"
            style={{ background: brand }}>
            {full ? "Booked" : "Reserve"} {!full && <ArrowRight size={12} className="ms-1" />}
          </Button>
        </div>
      </div>
    </article>
  );
}

function BookingDialog({
  experience, partnerId, brand, remaining, onClose, onSuccess,
}: {
  experience: Experience; partnerId: string; brand: string; remaining: number;
  onClose: () => void; onSuccess: () => void;
}) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [name, setName] = useState("");
  const [room, setRoom] = useState(() => {
    try { return sessionStorage.getItem(`qr_room_${partnerId}`) || ""; } catch { return ""; }
  });
  const [phone, setPhone] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const date = parseISO(experience.scheduled_at);
  const total = experience.price_per_person * participants;

  const submit = async () => {
    if (!name.trim()) {
      toast({ title: t("partner.book.name_required"), variant: "destructive" });
      return;
    }
    if (!phone || phone.length < 7) {
      toast({ title: t("partner.book.phone_invalid"), variant: "destructive" });
      return;
    }
    if (participants > remaining) {
      toast({ title: t("partner.book.only_left").replace("{n}", String(remaining)), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    // Snapshot commission rate at booking time (so future rate changes don't rewrite history)
    let commissionRate: number | null = null;
    try {
      const { data } = await (supabase as any).rpc("get_partner_commission_rate", { _partner_id: partnerId });
      if (typeof data === "number") commissionRate = data;
    } catch { /* leave null - admin can backfill */ }

    const gross = (experience.price_per_person || 0) * participants;
    const qr_variant_code = sessionStorage.getItem(`qr_variant_${partnerId}`) || null;
    const qr_variant_scope = sessionStorage.getItem(`qr_scope_${partnerId}`) || null;
    const { data: inserted, error } = await supabase.from("sofitel_bookings").insert({
      experience_id: experience.id,
      partner_id: partnerId,
      guest_name: name.trim(),
      room_number: room.trim() || null,
      guest_email: email.trim() || null,
      guest_phone: phone || null,
      participants,
      notes: notes.trim() || null,
      source: qr_variant_code ? `qr:${qr_variant_code}` : "partner_landing",
      price_per_person: experience.price_per_person || null,
      currency: experience.currency || "MAD",
      gross_amount: gross,
      commission_rate: commissionRate,
      qr_variant_code,
      qr_variant_scope,
    } as any).select("id").single();
    setSubmitting(false);
    if (error) {
      const msg = /Capacity exceeded/i.test(error.message)
        ? error.message.replace(/^.*Capacity exceeded: /i, "")
        : error.message;
      return toast({ title: t("partner.book.failed"), description: msg, variant: "destructive" });
    }
    setBookingRef(inserted?.id ? inserted.id.slice(0, 8).toUpperCase() : null);
    setDone(true);
  };

  // Build calendar (.ics) link
  const calendarHref = (() => {
    const start = date;
    const end = new Date(start.getTime() + (experience.duration_minutes || 90) * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      `SUMMARY:${experience.title}`,
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `LOCATION:${experience.location || ""}`,
      `DESCRIPTION:Booking ref ${bookingRef || ""}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  })();

  return (
    <Dialog open onOpenChange={(o) => !o && (done ? onSuccess() : onClose())}>
      <DialogContent className="max-w-md" dir={isRTL ? "rtl" : "ltr"}>
        {done ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white" style={{ background: brand }}>
              <Check size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-light mb-1">{t("partner.book.confirmed")}</h3>
              <p className="text-sm text-muted-foreground">{t("partner.book.thank_you").replace("{name}", name.split(" ")[0])}</p>
            </div>

            {bookingRef && (
              <div className="inline-block px-4 py-2 rounded-xl bg-muted text-xs">
                <span className="text-muted-foreground">{t("partner.book.reference")}</span>
                <p className="font-mono font-semibold text-sm mt-0.5">#{bookingRef}</p>
              </div>
            )}

            <div className="text-start bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <MessageCircle size={14} className="mt-0.5 shrink-0" style={{ color: brand }} />
                <span>{t("partner.book.wa_note").split("{phone}").map((chunk, i, arr) => i < arr.length - 1 ? <>{chunk}<strong>{phone}</strong></> : <>{chunk}</>)}</span>
              </p>
              {email && (
                <p className="flex items-start gap-2">
                  <Mail size={14} className="mt-0.5 shrink-0" style={{ color: brand }} />
                  <span>{t("partner.book.email_note").split("{email}").map((chunk, i, arr) => i < arr.length - 1 ? <>{chunk}<strong>{email}</strong></> : <>{chunk}</>)}</span>
                </p>
              )}
              <p className="flex items-start gap-2">
                <Calendar size={14} className="mt-0.5 shrink-0" style={{ color: brand }} />
                <span>{format(date, "EEEE d MMMM · HH:mm")} — {t("partner.book.meet_lobby")}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a href={calendarHref} download={`terraria-${bookingRef || "booking"}.ics`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-border text-sm hover:bg-muted transition">
                <Calendar size={14} /> {t("partner.book.add_calendar")}
              </a>
              <Button onClick={onSuccess} className="flex-1 rounded-full" style={{ background: brand }}>
                {t("partner.book.done")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: brand }}>
                {format(date, "EEE d MMM · HH:mm")}
              </p>
              <DialogTitle className="text-2xl font-light">{experience.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("partner.book.full_name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><Label>{t("partner.book.room")} <span className="text-muted-foreground font-normal">{t("partner.book.optional")}</span></Label><Input value={room} onChange={(e) => setRoom(e.target.value)} /></div>
                <div className="col-span-2">
                  <Label>{t("partner.book.phone_label")}</Label>
                  <PhoneInput
                    international
                    defaultCountry="MA"
                    value={phone}
                    onChange={setPhone}
                    placeholder={t("partner.book.phone_placeholder")}
                    className="phone-input mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2"><Label>{t("partner.book.email_label")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div>
                  <Label>{t("partner.book.participants")}</Label>
                  <Input type="number" min={1} max={remaining} value={participants}
                    onChange={(e) => setParticipants(Math.max(1, Math.min(remaining, Number(e.target.value))))} />
                </div>
                <div className="flex items-end text-sm">
                  {experience.price_per_person > 0 ? (
                    <p>{t("partner.book.total")} <span className="font-medium">{total} {experience.currency}</span></p>
                  ) : <p className="text-muted-foreground italic">{t("partner.book.on_request")}</p>}
                </div>
              </div>
              <div>
                <Label>{t("partner.book.notes")}</Label>
                <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                <Shield size={11} /> {t("partner.book.terms")}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>{t("partner.book.cancel")}</Button>
              <Button onClick={submit} disabled={submitting} style={{ background: brand }}>
                {submitting ? <><Loader2 size={14} className="me-1 animate-spin" />{t("partner.book.sending")}</> : t("partner.book.confirm")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OfferBookingDialog({
  offer, partner, brand, onClose,
}: {
  offer: PartnerOfferPublic;
  partner: { id: string; name: string };
  brand: string;
  onClose: () => void;
}) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [name, setName] = useState("");
  const [room, setRoom] = useState(() => {
    try { return sessionStorage.getItem(`qr_room_${partner.id}`) || ""; } catch { return ""; }
  });
  const [phone, setPhone] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const when = offer.event_at ? format(parseISO(offer.event_at), "EEE d MMM · HH:mm") : "";
  const total = (offer.price || 0) * participants;

  const submit = async () => {
    if (!name.trim()) return toast({ title: t("partner.book.name_required"), variant: "destructive" });
    if (!phone || phone.length < 7) return toast({ title: t("partner.book.phone_invalid"), variant: "destructive" });

    setSubmitting(true);
    let commissionRate: number | null = null;
    try {
      const { data } = await (supabase as any).rpc("get_partner_commission_rate", { _partner_id: partner.id });
      if (typeof data === "number") commissionRate = data;
    } catch { /* noop */ }

    const gross = (offer.price || 0) * participants;
    const qr_variant_code = sessionStorage.getItem(`qr_variant_${partner.id}`) || null;
    const { error } = await supabase.from("bookings").insert({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone || null,
      workshop: offer.title,
      booking_date: offer.event_at || "",
      participants,
      session_info: room.trim() ? `Room/ref: ${room.trim()}` : null,
      notes: notes.trim() || null,
      partner_id: partner.id,
      gross_amount: gross || null,
      commission_rate: commissionRate,
      source: qr_variant_code ? `qr:${qr_variant_code}` : "partner_offer",
    } as any);
    setSubmitting(false);
    if (error) return toast({ title: t("partner.book.failed"), description: error.message, variant: "destructive" });
    setDone(true);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" dir={isRTL ? "rtl" : "ltr"}>
        {done ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white" style={{ background: brand }}>
              <Check size={32} />
            </div>
            <h3 className="text-2xl font-light">{t("partner.book.received")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("partner.book.thanks_shortly").replace("{name}", name.split(" ")[0]).split("{title}").map((chunk, i, arr) => i < arr.length - 1 ? <>{chunk}<strong>{offer.title}</strong></> : <>{chunk}</>)}
            </p>
            <Button onClick={onClose} className="rounded-full" style={{ background: brand }}>{t("partner.book.done")}</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              {when && (
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: brand }}>{when}</p>
              )}
              <DialogTitle className="text-2xl font-light">{offer.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{t("partner.book.full_name")}</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><Label>{t("partner.book.room")} <span className="text-muted-foreground font-normal">{t("partner.book.optional")}</span></Label><Input value={room} onChange={(e) => setRoom(e.target.value)} /></div>
                <div className="col-span-2">
                  <Label>{t("partner.book.phone_label")}</Label>
                  <PhoneInput
                    international
                    defaultCountry="MA"
                    value={phone}
                    onChange={setPhone}
                    placeholder={t("partner.book.phone_placeholder")}
                    className="phone-input mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2"><Label>{t("partner.book.email_label")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div>
                  <Label>{t("partner.book.participants")}</Label>
                  <Input type="number" min={1} value={participants}
                    onChange={(e) => setParticipants(Math.max(1, Number(e.target.value) || 1))} />
                </div>
                <div className="flex items-end text-sm">
                  {offer.price ? (
                    <p>{t("partner.book.total")} <span className="font-medium">{total} {offer.currency}</span></p>
                  ) : <p className="text-muted-foreground italic">{t("partner.book.on_request")}</p>}
                </div>
              </div>
              <div>
                <Label>{t("partner.book.notes")}</Label>
                <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>{t("partner.book.cancel")}</Button>
              <Button onClick={submit} disabled={submitting} style={{ background: brand }}>
                {submitting ? <><Loader2 size={14} className="me-1 animate-spin" />{t("partner.book.sending")}</> : t("partner.book.confirm")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OfferDetailsDialog({
  offer,
  brand,
  onClose,
  onReserve,
}: {
  offer: PartnerOfferPublic;
  brand: string;
  onClose: () => void;
  onReserve: () => void;
}) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const galleryKey = galleryKeyForOffer(offer);
  const gallery = useSiteGallery(galleryKey || "gallery_workshop_zellij");
  const galleryUrls = galleryKey && gallery ? gallery.map((g) => g.url) : [];
  const allImages = [offer.cover_image, ...galleryUrls].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const hero = allImages[active] || offer.cover_image;
  const reserveLabel = offer.kind === "event" ? t("partner.offers.reserve_spot") : t("partner.offers.book_workshop");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 max-h-[92vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <div className="relative">
          {hero ? (
            <img src={hero} alt={offer.title} className="w-full aspect-[16/10] object-cover" />
          ) : (
            <div className="w-full aspect-[16/10]" style={{ background: `linear-gradient(135deg, ${brand}, ${brand}aa)` }} />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 end-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <span className="absolute top-3 start-3 text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: brand }}>
            {offer.kind === "event" ? t("partner.offers.event") : t("partner.offers.offer")}
          </span>
        </div>

        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-5 pt-4 pb-1">
            {allImages.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setActive(i)}
                className={cn(
                  "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition",
                  active === i ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-1">{offer.title}</h2>
            {offer.subtitle && <p className="text-muted-foreground">{offer.subtitle}</p>}
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {offer.kind === "event" && offer.event_at && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                <Calendar size={12} /> {format(parseISO(offer.event_at), "EEE, MMM d · HH:mm")}
              </span>
            )}
            {offer.capacity != null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                <Users size={12} /> {offer.capacity} {t("partner.offers.spots")}
              </span>
            )}
            {offer.price != null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-medium" style={{ background: brand }}>
                {offer.price} {offer.currency}
              </span>
            )}
          </div>

          {offer.description && (
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{offer.description}</p>
          )}

          {offer.tags && offer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {offer.tags.map((t) => (
                <span key={t} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
          )}

          <Button onClick={onReserve} className="w-full text-white" style={{ background: brand }}>
            {reserveLabel} <ArrowRight size={16} className={cn("ms-1", isRTL && "rotate-180")} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
