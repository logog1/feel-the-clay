import { useEffect, useMemo, useState, FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, startOfDay } from "date-fns";
import {
  Calendar, Users, MapPin, Clock, LogOut, Loader2, Plus, X, Check,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AvailabilityCalendar, GroupRequestsList } from "@/components/sofitel/AvailabilityCalendar";

type Experience = {
  id: string;
  title: string;
  cover_image: string | null;
  category: string;
  capacity: number;
  location: string | null;
  scheduled_at: string;
  duration_minutes: number;
  price_per_person: number;
  currency: string;
};

type Booking = {
  id: string;
  experience_id: string;
  guest_name: string;
  room_number: string;
  participants: number;
  status: string;
  created_at: string;
};

const PALETTE = {
  bg: "#FBFAF6",
  ink: "#0E1418",
  blue: "#5B8AA6",
  blueDeep: "#2E5168",
  sand: "#E6C36B",
  sandSoft: "#F1E2BE",
  line: "#E8E2D2",
};

export default function SofitelHotel() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!session) {
      setRole(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const roles = (data || []).map((r: any) => r.role);
      if (roles.includes("admin")) setRole("admin");
      else if (roles.includes("hotel_staff")) setRole("hotel_staff");
      else setRole("none");
    })();
  }, [session]);

  return (
    <div className="min-h-screen" style={{ background: PALETTE.bg, color: PALETTE.ink, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Helmet>
        <title>Sofitel · Concierge Console | Terraria Workshop</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Helmet>

      {checking ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" style={{ color: PALETTE.blueDeep }} />
        </div>
      ) : !session ? (
        <LoginScreen />
      ) : role === null ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" style={{ color: PALETTE.blueDeep }} />
        </div>
      ) : role === "none" ? (
        <NoAccess email={session.user.email} />
      ) : (
        <Dashboard email={session.user.email} />
      )}
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fn = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/sofitel/hotel" } });
    const { error } = await fn;
    setLoading(false);
    if (error) toast.error(error.message);
    else if (mode === "signup") toast.success("Account requested. An admin must grant hotel staff access.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.32em] uppercase" style={{ color: PALETTE.blueDeep }}>
            Sofitel Tamuda Bay
          </p>
          <h1 className="mt-3 text-4xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Concierge Console
          </h1>
          <p className="mt-3 text-sm opacity-70">Sign in to manage guest experiences</p>
        </div>

        <form onSubmit={submit} className="space-y-5 rounded-2xl p-7 bg-white" style={{ border: `1px solid ${PALETTE.line}` }}>
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-full text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-50 inline-flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.bg }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "login" ? "Sign in" : "Request access"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full text-xs opacity-60 hover:opacity-100"
          >
            {mode === "login" ? "New staff member? Request access" : "Already have access? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function NoAccess({ email }: { email: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 text-center">
      <div className="max-w-md">
        <p className="text-[11px] tracking-[0.32em] uppercase" style={{ color: PALETTE.blueDeep }}>Access pending</p>
        <h2 className="mt-3 text-3xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Hello, {email}
        </h2>
        <p className="mt-4 opacity-70 text-sm leading-relaxed">
          Your account is awaiting Terraria approval. A team member will assign your hotel-staff role shortly.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.2em]"
          style={{ background: PALETTE.line }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}

function Dashboard({ email }: { email: string }) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [bookingTarget, setBookingTarget] = useState<Experience | null>(null);
  const [view, setView] = useState<"program" | "availability" | "requests">("program");

  const load = async () => {
    const [{ data: exp }, { data: bk }] = await Promise.all([
      supabase.from("sofitel_experiences").select("*").order("scheduled_at"),
      supabase.from("sofitel_bookings").select("*"),
    ]);
    setExperiences((exp as Experience[]) || []);
    setBookings((bk as Booking[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const days = useMemo(() => {
    const seen = new Map<string, Date>();
    experiences.forEach((i) => {
      const d = startOfDay(parseISO(i.scheduled_at));
      const key = format(d, "yyyy-MM-dd");
      if (!seen.has(key)) seen.set(key, d);
    });
    return Array.from(seen.entries());
  }, [experiences]);

  const bookedFor = (expId: string) =>
    bookings
      .filter((b) => b.experience_id === expId && b.status !== "cancelled")
      .reduce((s, b) => s + (b.participants || 1), 0);

  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      if (activeDay && format(parseISO(e.scheduled_at), "yyyy-MM-dd") !== activeDay) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [experiences, activeDay, search]);

  // KPIs
  const totalSpotsBooked = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.participants || 1), 0);
  const upcomingCount = experiences.filter((e) => parseISO(e.scheduled_at) > new Date()).length;
  const fullCount = experiences.filter((e) => bookedFor(e.id) >= e.capacity).length;

  return (
    <div className="max-w-7xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.32em] uppercase" style={{ color: PALETTE.blueDeep }}>
            Concierge Console
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Weekly Program
          </h1>
          <p className="mt-1 text-xs opacity-60">Signed in as {email}</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em]"
          style={{ background: PALETTE.line, color: PALETTE.ink }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>

      {/* View tabs */}
      <div className="mt-7 flex gap-1 border-b" style={{ borderColor: PALETTE.line }}>
        {([
          ["program", "Weekly Program"],
          ["availability", "Group Availability"],
          ["requests", "Group Requests"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className="px-4 py-2.5 text-xs uppercase tracking-[0.2em] border-b-2 transition-colors"
            style={{
              borderColor: view === id ? PALETTE.blueDeep : "transparent",
              color: view === id ? PALETTE.blueDeep : PALETTE.ink,
              opacity: view === id ? 1 : 0.55,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "program" && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <Kpi label="Upcoming sessions" value={upcomingCount} icon={Calendar} />
            <Kpi label="Spots booked" value={totalSpotsBooked} icon={Users} />
            <Kpi label="Full sessions" value={fullCount} icon={Check} />
            <Kpi label="Total experiences" value={experiences.length} icon={Clock} />
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
              <DayChip label="All days" active={!activeDay} onClick={() => setActiveDay(null)} />
              {days.map(([key, date]) => (
                <DayChip
                  key={key}
                  label={format(date, "EEE d MMM")}
                  active={activeDay === key}
                  onClick={() => setActiveDay(activeDay === key ? null : key)}
                />
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                placeholder="Search experiences"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full text-sm bg-white outline-none w-full sm:w-64"
                style={{ border: `1px solid ${PALETTE.line}` }}
              />
            </div>
          </div>

          {/* Sessions */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin" style={{ color: PALETTE.blueDeep }} />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filtered.map((exp) => (
                <SessionRow
                  key={exp.id}
                  exp={exp}
                  booked={bookedFor(exp.id)}
                  bookings={bookings.filter((b) => b.experience_id === exp.id)}
                  onBook={() => setBookingTarget(exp)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-center py-16 opacity-60 text-sm">No sessions match your filters.</p>
              )}
            </div>
          )}
        </>
      )}

      {view === "availability" && (
        <div className="mt-6">
          <AvailabilityCalendar variant="concierge" />
          <p className="mt-4 text-xs opacity-60 max-w-2xl">
            Live capacity from Terraria's master schedule. Tap any open day to send a custom group enquiry — it lands in the Terraria team's dashboard immediately.
          </p>
        </div>
      )}

      {view === "requests" && (
        <div className="mt-6">
          <GroupRequestsList />
        </div>
      )}

      {bookingTarget && (
        <InternalBookingSheet
          experience={bookingTarget}
          alreadyBooked={bookedFor(bookingTarget.id)}
          onClose={() => setBookingTarget(null)}
          onSaved={() => { setBookingTarget(null); load(); }}
        />
      )}
    </div>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="rounded-2xl p-5 bg-white" style={{ border: `1px solid ${PALETTE.line}` }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] opacity-60">{label}</span>
        <Icon size={14} style={{ color: PALETTE.blueDeep }} />
      </div>
      <p className="mt-3 text-3xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {value}
      </p>
    </div>
  );
}

function DayChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
      style={{
        background: active ? PALETTE.blueDeep : "white",
        color: active ? PALETTE.bg : PALETTE.ink,
        border: `1px solid ${active ? PALETTE.blueDeep : PALETTE.line}`,
      }}
    >
      {label}
    </button>
  );
}

function AvailabilityBadge({ booked, capacity }: { booked: number; capacity: number }) {
  const ratio = booked / capacity;
  let label = "Available";
  let bg = "#E8F4EA";
  let fg = "#1F6F3A";
  if (ratio >= 1) { label = "Full"; bg = "#FCE6E6"; fg = "#9B2222"; }
  else if (ratio >= 0.7) { label = "Almost full"; bg = PALETTE.sandSoft; fg = "#7A5A12"; }
  return (
    <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full font-medium" style={{ background: bg, color: fg }}>
      {label} · {booked}/{capacity}
    </span>
  );
}

function SessionRow({
  exp, booked, bookings, onBook,
}: { exp: Experience; booked: number; bookings: Booking[]; onBook: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const date = parseISO(exp.scheduled_at);
  const full = booked >= exp.capacity;

  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${PALETTE.line}` }}>
      <div className="p-4 sm:p-5 flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <div
          className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: `url(${exp.cover_image || ""})`, background: !exp.cover_image ? PALETTE.sandSoft : undefined, backgroundSize: "cover" }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{exp.title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs opacity-70">
            <span className="inline-flex items-center gap-1"><Clock size={11} /> {format(date, "EEE d MMM · HH:mm")}</span>
            {exp.location && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {exp.location}</span>}
            <span className="inline-flex items-center gap-1"><Users size={11} /> {exp.duration_minutes} min</span>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <AvailabilityBadge booked={booked} capacity={exp.capacity} />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ border: `1px solid ${PALETTE.line}` }}
          >
            {expanded ? "Hide" : `${bookings.length} bookings`}
          </button>
          <button
            onClick={onBook}
            disabled={full}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full disabled:opacity-40"
            style={{ background: PALETTE.ink, color: PALETTE.bg }}
          >
            <Plus size={12} /> Book guest
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-5 py-4" style={{ borderColor: PALETTE.line, background: "#FAF7F0" }}>
          {bookings.length === 0 ? (
            <p className="text-xs opacity-60 text-center py-3">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{b.guest_name}</span>
                    <span className="opacity-50 ml-2">Room {b.room_number}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs opacity-70">
                    <span>{b.participants}p</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full",
                      b.status === "confirmed" && "bg-green-100 text-green-800",
                      b.status === "pending" && "bg-amber-100 text-amber-800",
                      b.status === "cancelled" && "bg-red-100 text-red-800",
                    )}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InternalBookingSheet({
  experience, alreadyBooked, onClose, onSaved,
}: { experience: Experience; alreadyBooked: number; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [participants, setParticipants] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const remaining = experience.capacity - alreadyBooked;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !room.trim()) { toast.error("Name and room required"); return; }
    if (participants > remaining) { toast.error(`Only ${remaining} spots left`); return; }
    setSubmitting(true);
    const { error } = await supabase.from("sofitel_bookings").insert({
      experience_id: experience.id,
      guest_name: name.trim(),
      room_number: room.trim(),
      participants,
      status: "confirmed",
      source: "hotel_staff",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Reservation added");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5" style={{ background: "#0E1418CC" }}>
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: PALETTE.line }}>
          <X size={16} />
        </button>
        <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: PALETTE.blueDeep }}>
          {format(parseISO(experience.scheduled_at), "EEE d MMM · HH:mm")}
        </p>
        <h2 className="mt-2 text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {experience.title}
        </h2>
        <p className="mt-1 text-xs opacity-60">{remaining} of {experience.capacity} spots remaining</p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="Guest name" value={name} onChange={setName} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Room number" value={room} onChange={setRoom} />
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] opacity-60">Guests</label>
              <input
                type="number" min={1} max={remaining}
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                className="mt-1 w-full bg-transparent border-b py-2 text-base outline-none"
                style={{ borderColor: PALETTE.line }}
              />
            </div>
          </div>
          <button
            type="submit" disabled={submitting}
            className="w-full py-3 rounded-full text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-50 inline-flex items-center justify-center gap-2"
            style={{ background: PALETTE.ink, color: PALETTE.bg }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Confirm reservation
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] opacity-60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border-b py-2 text-base outline-none"
        style={{ borderColor: PALETTE.line, color: PALETTE.ink }}
      />
    </label>
  );
}
