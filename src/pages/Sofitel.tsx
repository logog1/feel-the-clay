import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import {
  Clock, MapPin, Users, Sparkles, ArrowRight, X, Check, Loader2,
  Waves, Sun, Heart, Palette, Compass, Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import imgPotteryHandbuilding from "@/assets/sofitel/pottery-handbuilding.jpg";
import imgCanvasPainting from "@/assets/sofitel/canvas-painting.jpg";
import imgZellijMosaic from "@/assets/sofitel/zellij-mosaic.jpg";
import imgCeramicPainting from "@/assets/sofitel/ceramic-painting.jpg";
import imgRugWeaving from "@/assets/sofitel/rug-weaving.jpg";
import imgGardenPlant from "@/assets/sofitel/garden-plant.jpg";
import imgPotteryCooperative from "@/assets/sofitel/pottery-cooperative.jpg";
import imgCookingFamily from "@/assets/sofitel/cooking-family.jpg";

const SLUG_IMAGES: Record<string, string> = {
  "pottery-handbuilding": imgPotteryHandbuilding,
  "canvas-painting": imgCanvasPainting,
  "zellij-mosaic": imgZellijMosaic,
  "ceramic-painting": imgCeramicPainting,
  "moroccan-rug-weaving": imgRugWeaving,
  "garden-plant-experience": imgGardenPlant,
  "pottery-cooperative": imgPotteryCooperative,
  "cooking-local-family": imgCookingFamily,
};

// Pinterest-style varied card heights for masonry rhythm
const SLUG_HEIGHTS: Record<string, string> = {
  "pottery-handbuilding": "aspect-[4/5]",
  "canvas-painting": "aspect-[3/4]",
  "zellij-mosaic": "aspect-[4/5]",
  "ceramic-painting": "aspect-[3/4]",
  "moroccan-rug-weaving": "aspect-[4/6]",
  "garden-plant-experience": "aspect-[3/4]",
  "pottery-cooperative": "aspect-[4/5]",
  "cooking-local-family": "aspect-[3/4]",
};

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

const FILTERS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "in-hotel", label: "In-hotel", icon: Waves },
  { id: "outdoor", label: "Outdoor", icon: Compass },
  { id: "cultural", label: "Cultural", icon: Leaf },
  { id: "couples", label: "Couples", icon: Heart },
  { id: "family", label: "Family", icon: Sun },
  { id: "adults", label: "Adults", icon: Palette },
];

// Local luxury palette: beach blue, sand yellow, off-white, soft black
const PALETTE = {
  bg: "#FBFAF6",        // off-white
  ink: "#0E1418",       // soft black
  blue: "#5B8AA6",      // beach blue
  blueDeep: "#2E5168",
  sand: "#E6C36B",      // sand yellow
  sandSoft: "#F1E2BE",
  line: "#E8E2D2",
};

export default function Sofitel() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [confirmation, setConfirmation] = useState<{ name: string; experience: string } | null>(null);
  const [taken, setTaken] = useState<Record<string, number>>({});

  useEffect(() => {
    document.documentElement.style.setProperty("--sofitel-bg", PALETTE.bg);
    document.body.style.background = PALETTE.bg;
    return () => { document.body.style.background = ""; };
  }, []);

  const refreshAvailability = async () => {
    const { data } = await supabase.rpc("get_sofitel_availability");
    if (data) {
      const map: Record<string, number> = {};
      (data as any[]).forEach((r) => { map[r.experience_id] = r.taken; });
      setTaken(map);
    }
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("sofitel_experiences")
        .select("*")
        .eq("is_active", true)
        .order("scheduled_at", { ascending: true });
      if (error) toast.error("Could not load the program");
      setItems((data as Experience[]) || []);
      setLoading(false);
    })();
    refreshAvailability();
    const interval = setInterval(refreshAvailability, 20000);
    return () => clearInterval(interval);
  }, []);

  const days = useMemo(() => {
    const seen = new Map<string, Date>();
    items.forEach((i) => {
      const d = parseISO(i.scheduled_at);
      const key = format(d, "yyyy-MM-dd");
      if (!seen.has(key)) seen.set(key, d);
    });
    return Array.from(seen.entries()).map(([key, d]) => ({ key, date: d }));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const cat = filter === "all" || i.category === filter || i.audience === filter;
      const day = !activeDay || format(parseISO(i.scheduled_at), "yyyy-MM-dd") === activeDay;
      return cat && day;
    });
  }, [items, filter, activeDay]);

  return (
    <div
      className="min-h-screen"
      style={{ background: PALETTE.bg, color: PALETTE.ink, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Helmet>
        <title>Terraria x Sofitel Tamuda Bay | Curated Creative Experiences</title>
        <meta name="description" content="Discover authentic creative Morocco at Sofitel Tamuda Bay. Pottery, zellige, sunset art, and artisan visits curated by Terraria Workshop." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Helmet>

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 80% 0%, ${PALETTE.sandSoft} 0%, transparent 60%), linear-gradient(180deg, ${PALETTE.bg} 0%, ${PALETTE.bg} 100%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 pt-10 pb-12 sm:pt-16 sm:pb-20">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.32em] uppercase opacity-70">
            <span style={{ color: PALETTE.blueDeep }}>Terraria Workshop</span>
            <span style={{ color: PALETTE.sand }}>×</span>
            <span style={{ color: PALETTE.blueDeep }}>Sofitel Tamuda Bay</span>
          </div>
          <h1
            className="mt-6 text-4xl sm:text-6xl md:text-7xl leading-[1.05] font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}
          >
            Curated creative<br />
            <span style={{ fontStyle: "italic", color: PALETTE.blueDeep }}>experiences</span> by the sea.
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg opacity-75 leading-relaxed">
            A weekly program of artisan workshops and cultural escapes, crafted for guests
            of Sofitel Tamuda Bay. Discover authentic Morocco, one ritual at a time.
          </p>

          <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
            <span className="h-px w-10" style={{ background: PALETTE.sand }} />
            <span style={{ color: PALETTE.blueDeep }}>This week's program</span>
          </div>
        </div>
      </header>

      {/* DAYS RAIL */}
      {days.length > 0 && (
        <div className="sticky top-0 z-20 backdrop-blur-md" style={{ background: `${PALETTE.bg}E6`, borderBottom: `1px solid ${PALETTE.line}` }}>
          <div className="max-w-6xl mx-auto px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <DayChip label="All days" active={!activeDay} onClick={() => setActiveDay(null)} />
            {days.map(({ key, date }) => (
              <DayChip
                key={key}
                label={format(date, "EEE d")}
                active={activeDay === key}
                onClick={() => setActiveDay(key === activeDay ? null : key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300",
                )}
                style={{
                  background: active ? PALETTE.ink : "transparent",
                  color: active ? PALETTE.bg : PALETTE.ink,
                  border: `1px solid ${active ? PALETTE.ink : PALETTE.line}`,
                }}
              >
                <f.icon size={13} strokeWidth={1.5} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID */}
      <main className="max-w-6xl mx-auto px-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin" style={{ color: PALETTE.blueDeep }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-24 opacity-60">No experiences match these filters.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exp, idx) => (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                index={idx}
                remaining={Math.max(0, exp.capacity - (taken[exp.id] || 0))}
                onBook={() => setSelected(exp)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: PALETTE.line }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.32em] uppercase" style={{ color: PALETTE.blueDeep }}>
              Terraria × Sofitel Tamuda Bay
            </p>
            <p className="mt-2 text-xs opacity-60">Curated by Terraria Workshop · Tetouan, Morocco</p>
          </div>
          <p className="text-xs opacity-50" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            "Discover authentic creative Morocco."
          </p>
        </div>
      </footer>

      {selected && (
        <BookingSheet
          experience={selected}
          remaining={Math.max(0, selected.capacity - (taken[selected.id] || 0))}
          onClose={() => setSelected(null)}
          onConfirmed={(name) => {
            setConfirmation({ name, experience: selected.title });
            setSelected(null);
            refreshAvailability();
          }}
        />
      )}

      {confirmation && (
        <ConfirmationOverlay
          name={confirmation.name}
          experience={confirmation.experience}
          onClose={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}

function DayChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300"
      style={{
        background: active ? PALETTE.blueDeep : "transparent",
        color: active ? PALETTE.bg : PALETTE.ink,
        border: `1px solid ${active ? PALETTE.blueDeep : PALETTE.line}`,
      }}
    >
      {label}
    </button>
  );
}

function ExperienceCard({ exp, index, remaining, onBook }: { exp: Experience; index: number; remaining: number; onBook: () => void }) {
  const date = parseISO(exp.scheduled_at);
  return (
    <article
      className="group relative overflow-hidden rounded-3xl bg-white animate-fade-in"
      style={{
        border: `1px solid ${PALETTE.line}`,
        animationDelay: `${index * 60}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={exp.cover_image || "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200"}
          alt={exp.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 40%, rgba(14,20,24,0.85) 100%)" }}
        />
        <div className="absolute top-4 left-4 right-4 flex gap-2 items-start justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full backdrop-blur-md"
            style={{ background: "#FFFFFFCC", color: PALETTE.ink }}
          >
            {exp.category === "in-hotel" ? "In-hotel" : exp.category === "outdoor" ? "Outdoor" : "Cultural"}
          </span>
          <SpotsBadge remaining={remaining} capacity={exp.capacity} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          {exp.subtitle && (
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-80 mb-1">{exp.subtitle}</p>
          )}
          <h3 className="text-2xl leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {exp.title}
          </h3>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: PALETTE.ink, opacity: 0.75 }}>
          {exp.description}
        </p>

        <div className="flex flex-wrap gap-3 text-xs" style={{ color: PALETTE.blueDeep }}>
          <Meta icon={Clock}>{format(date, "EEE d MMM · HH:mm")}</Meta>
          <Meta icon={Users}>{remaining} of {exp.capacity} left</Meta>
          {exp.location && <Meta icon={MapPin}>{exp.location}</Meta>}
        </div>

        <div className="flex items-end justify-between pt-3 border-t" style={{ borderColor: PALETTE.line }}>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">From</p>
            <p className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {exp.price_per_person} {exp.currency}
              <span className="text-[11px] opacity-60 ml-1">/ guest</span>
            </p>
          </div>
          <button
            onClick={onBook}
            disabled={remaining === 0}
            className="group/btn inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium uppercase tracking-[0.18em] transition-all duration-300 hover:gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.bg }}
          >
            {remaining === 0 ? "Fully booked" : "Reserve"}
            {remaining > 0 && <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />}
          </button>
        </div>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={12} strokeWidth={1.5} />
      {children}
    </span>
  );
}

function SpotsBadge({ remaining, capacity }: { remaining: number; capacity: number }) {
  const ratio = capacity > 0 ? remaining / capacity : 0;
  const full = remaining === 0;
  const low = !full && ratio <= 0.3;
  const bg = full ? "#0E1418" : low ? "#E6C36B" : "#FFFFFFCC";
  const color = full ? "#FFFFFF" : "#0E1418";
  const label = full ? "Fully booked" : low ? `Only ${remaining} left` : `${remaining} spots`;
  return (
    <span
      className={cn(
        "text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full backdrop-blur-md inline-flex items-center gap-1.5",
        low && !full && "animate-pulse"
      )}
      style={{ background: bg, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: full ? "#FFFFFF" : low ? "#0E1418" : "#5B8AA6" }}
      />
      {label}
    </span>
  );
}

function BookingSheet({
  experience,
  remaining,
  onClose,
  onConfirmed,
}: {
  experience: Experience;
  remaining: number;
  onClose: () => void;
  onConfirmed: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [participants, setParticipants] = useState(1);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = experience.price_per_person * participants;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) {
      toast.error("Name and room number are required");
      return;
    }
    if (participants > remaining) {
      toast.error(`Only ${remaining} ${remaining === 1 ? "spot" : "spots"} left`);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("sofitel_bookings").insert({
      experience_id: experience.id,
      guest_name: name.trim(),
      room_number: room.trim(),
      guest_phone: phone.trim() || null,
      participants,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit your reservation");
      return;
    }
    onConfirmed(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in" style={{ background: "#0E1418CC" }}>
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-slide-in-right sm:animate-scale-in"
        style={{ background: PALETTE.bg }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: PALETTE.line, color: PALETTE.ink }}
        >
          <X size={16} />
        </button>

        <div className="aspect-[16/10] overflow-hidden rounded-t-3xl">
          <img src={experience.cover_image || ""} alt={experience.title} className="w-full h-full object-cover" />
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: PALETTE.blueDeep }}>
              {format(parseISO(experience.scheduled_at), "EEEE d MMMM · HH:mm")}
            </p>
            <h2 className="mt-2 text-3xl leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {experience.title}
            </h2>
            {experience.location && (
              <p className="mt-2 text-sm opacity-70 inline-flex items-center gap-1.5">
                <MapPin size={13} /> {experience.location}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <Field label="Full name" value={name} onChange={setName} placeholder="Jane Doe" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Room number" value={room} onChange={setRoom} placeholder="412" />
              <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+212 ..." />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] opacity-60">Guests</label>
              <div className="mt-2 flex items-center gap-3">
                <Stepper value={participants} onChange={setParticipants} max={Math.max(1, remaining)} />
                <span className="text-sm opacity-60">{remaining} {remaining === 1 ? "spot" : "spots"} left</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between pt-4 border-t" style={{ borderColor: PALETTE.line }}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-50">Total</p>
              <p className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {total} {experience.currency}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-50"
              style={{ background: PALETTE.ink, color: PALETTE.bg }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Confirm reservation
            </button>
          </div>

          <p className="text-[11px] opacity-50 text-center">
            Charges will appear on your Sofitel folio. Cancellation up to 12h before.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] opacity-60">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent border-b py-2 text-base outline-none transition-colors focus:border-current"
        style={{ borderColor: PALETTE.line, color: PALETTE.ink }}
      />
    </label>
  );
}

function Stepper({ value, onChange, max }: { value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="inline-flex items-center rounded-full" style={{ border: `1px solid ${PALETTE.line}` }}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="w-9 h-9 text-lg">−</button>
      <span className="w-8 text-center text-sm font-medium">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-9 h-9 text-lg">+</button>
    </div>
  );
}

function ConfirmationOverlay({ name, experience, onClose }: { name: string; experience: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-5" style={{ background: "#0E1418F2" }}>
      <div className="max-w-md text-center text-white animate-scale-in">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: PALETTE.sand, color: PALETTE.ink }}
        >
          <Check size={28} strokeWidth={1.5} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.32em]" style={{ color: PALETTE.sand }}>Reservation received</p>
        <h2 className="mt-4 text-4xl leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Merci, {name}.
        </h2>
        <p className="mt-4 opacity-80 leading-relaxed">
          Your seat at <em>{experience}</em> is being prepared. Our concierge will deliver
          a printed confirmation to your room shortly.
        </p>
        <button
          onClick={onClose}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[0.2em]"
          style={{ background: PALETTE.bg, color: PALETTE.ink }}
        >
          Continue browsing
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
