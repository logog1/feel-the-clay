import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useHotelPartnerBySlug } from "@/hooks/use-hotel-partners";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import SEOHead from "@/components/SEOHead";
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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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
  const { language } = useLanguage();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [expLoading, setExpLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [taken, setTaken] = useState<Record<string, number>>({});
  const [offers, setOffers] = useState<PartnerOfferPublic[]>([]);

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
            Craft &amp; culture <span className="italic opacity-90">curated for you</span>
          </h1>
          {partner.city && (
            <p className="flex items-center gap-1.5 text-white/80 mb-4 text-sm uppercase tracking-[0.2em]">
              <MapPin size={13} /> {partner.city}
            </p>
          )}
          {intro && <p className="max-w-2xl text-base md:text-lg text-white/90 leading-relaxed">{intro}</p>}

          <div className="flex flex-wrap gap-3 mt-8">
            <a href="#experiences"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium hover:opacity-90 transition text-white"
              style={{ background: brand }}>
              Explore experiences <ArrowRight size={16} />
            </a>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 backdrop-blur text-white font-medium hover:bg-white/25 transition">
                Book on WhatsApp
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
              {["Pottery", "Zellige", "Weaving", "Painting", "Gardens", "Cooking", "Cooperatives", "Signature"].map((w, i) => (
                <span key={`${copy}-${i}`} className="text-[11px] uppercase tracking-[0.3em] inline-flex items-center gap-3" style={{ color: brand }}>
                  {w}
                  <span className="w-1 h-1 rounded-full" style={{ background: brand }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PERKS */}
      {(partner.perks || []).some((p) => p.enabled) && (
        <section className="section-padding">
          <div className="container-wide max-w-5xl">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2" style={{ color: brand }}>
              What we offer
            </p>
            <h2 className="text-3xl md:text-4xl font-light mb-8 capitalize">Curated for {partner.name} guests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(partner.perks || []).filter((p) => p.enabled).map((perk) => (
                <div key={perk.key} className="p-5 rounded-2xl border border-border/40 bg-card flex gap-4">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white" style={{ background: brand }}>
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
      )}

      {/* OFFERS & EVENTS */}
      {offers.length > 0 && (
        <section id="offers" className="section-padding">
          <div className="container-wide max-w-6xl">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: brand }}>Curated for our guests</p>
              <h2 className="text-3xl md:text-4xl font-light">Offers &amp; events</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {offers.map((o) => {
                const cta = (() => {
                  if (o.cta_type === "none") return null;
                  if (o.cta_type === "whatsapp" && o.cta_value) {
                    const num = o.cta_value.replace(/\D/g, "");
                    const msg = encodeURIComponent(`Hello ${partner.name}, I'm interested in "${o.title}".`);
                    return { href: `https://wa.me/${num}?text=${msg}`, label: o.cta_label || "WhatsApp us", external: true };
                  }
                  if (o.cta_type === "link" && o.cta_value) {
                    return { href: o.cta_value, label: o.cta_label || "Learn more", external: true };
                  }
                  return { href: "#experiences", label: o.cta_label || "Book a workshop", external: false };
                })();
                return (
                  <article key={o.assignment_id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition">
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
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: brand }}>
                        <span className="px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: brand }}>
                          {o.kind === "event" ? "Event" : "Offer"}
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
                            <span className="text-xs text-muted-foreground ml-2">· {o.capacity} spots</span>
                          )}
                        </div>
                        {cta && (
                          cta.external ? (
                            <a href={cta.href} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80" style={{ color: brand }}>
                              {cta.label} <ArrowRight size={14} />
                            </a>
                          ) : (
                            <a href={cta.href}
                              className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80" style={{ color: brand }}>
                              {cta.label} <ArrowRight size={14} />
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

      {/* EXPERIENCES */}
      <section id="experiences" className="section-padding bg-card">
        <div className="container-wide max-w-6xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: brand }}>The week ahead</p>
              <h2 className="text-3xl md:text-4xl font-light">Upcoming experiences</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} experience{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          {/* Days rail */}
          {days.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
              <DayChip label="All days" active={!activeDay} onClick={() => setActiveDay(null)} brand={brand} />
              {days.map(({ key, date }) => (
                <DayChip key={key} label={format(date, "EEE d")} active={activeDay === key}
                  onClick={() => setActiveDay(activeDay === key ? null : key)} brand={brand} />
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4">
            {CATEGORIES.map((c) => {
              const active = filter === c.id;
              return (
                <button key={c.id} onClick={() => setFilter(c.id)}
                  className={cn("px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition")}
                  style={{
                    background: active ? brand : "transparent",
                    color: active ? "white" : "inherit",
                    borderColor: active ? brand : "hsl(var(--border))",
                  }}>
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {expLoading ? (
            <div className="py-20 text-center"><Loader2 className="inline animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed border-border/40">
              <Calendar className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No experiences scheduled yet.</p>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-medium text-white"
                  style={{ background: brand }}>
                  Ask on WhatsApp <ArrowRight size={14} />
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((exp) => (
                <ExperienceCard key={exp.id} exp={exp} brand={brand}
                  remaining={Math.max(0, exp.capacity - (taken[exp.id] || 0))}
                  onBook={() => setSelected(exp)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      {(partner.contact_email || partner.contact_phone || partner.website_url) && (
        <section className="section-padding">
          <div className="container-wide max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-light mb-3">Talk to us</h2>
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
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>{partner.name} × Terraria · Curated craft experiences</p>
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
        <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/90 text-foreground">
            {exp.category}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full font-medium"
            style={{
              background: full ? "#0E1418" : low ? brand : "rgba(255,255,255,0.9)",
              color: full || low ? "white" : "#0E1418",
            }}>
            {full ? "Fully booked" : low ? `Only ${remaining} left` : `${remaining} spots`}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
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
          </div>
          <Button size="sm" disabled={full} onClick={onBook} className="rounded-full text-xs"
            style={{ background: brand }}>
            {full ? "Booked" : "Reserve"} {!full && <ArrowRight size={12} className="ml-1" />}
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
  const [name, setName] = useState("");
  const [room, setRoom] = useState(() => {
    try { return sessionStorage.getItem(`qr_room_${partnerId}`) || ""; } catch { return ""; }
  });
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const date = parseISO(experience.scheduled_at);
  const total = experience.price_per_person * participants;

  const submit = async () => {
    if (!name.trim() || !room.trim()) {
      toast({ title: "Name and room/reference required", variant: "destructive" });
      return;
    }
    if (participants > remaining) {
      toast({ title: `Only ${remaining} spots remaining`, variant: "destructive" });
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
    const { error } = await supabase.from("sofitel_bookings").insert({
      experience_id: experience.id,
      partner_id: partnerId,
      guest_name: name.trim(),
      room_number: room.trim(),
      guest_email: email.trim() || null,
      guest_phone: phone.trim() || null,
      participants,
      notes: notes.trim() || null,
      source: qr_variant_code ? `qr:${qr_variant_code}` : "partner_landing",
      price_per_person: experience.price_per_person || null,
      currency: experience.currency || "MAD",
      gross_amount: gross,
      commission_rate: commissionRate,
      qr_variant_code,
      qr_variant_scope,
    } as any);
    setSubmitting(false);
    if (error) return toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    setDone(true);
    setTimeout(onSuccess, 1800);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white" style={{ background: brand }}>
              <Check size={26} />
            </div>
            <h3 className="text-2xl font-light">Reservation received</h3>
            <p className="text-sm text-muted-foreground">Thank you {name}, we'll confirm shortly.</p>
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
                <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><Label>Room / reference</Label><Input value={room} onChange={(e) => setRoom(e.target.value)} required /></div>
                <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <div>
                  <Label>Participants</Label>
                  <Input type="number" min={1} max={remaining} value={participants}
                    onChange={(e) => setParticipants(Math.max(1, Math.min(remaining, Number(e.target.value))))} />
                </div>
                <div className="flex items-end text-sm">
                  {experience.price_per_person > 0 ? (
                    <p>Total: <span className="font-medium">{total} {experience.currency}</span></p>
                  ) : <p className="text-muted-foreground italic">On request</p>}
                </div>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={submit} disabled={submitting} style={{ background: brand }}>
                {submitting ? <><Loader2 size={14} className="mr-1 animate-spin" />Sending…</> : "Confirm reservation"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
