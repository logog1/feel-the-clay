import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHotelPartnerBySlug } from "@/hooks/use-hotel-partners";
import { format, parseISO, startOfDay, addDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Users, Clock, LogOut, Loader2, Lock, ChevronLeft, ChevronRight, Mail, Phone, ExternalLink } from "lucide-react";

type Experience = {
  id: string;
  title: string;
  cover_image: string | null;
  category: string;
  capacity: number;
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
  guest_email: string | null;
  guest_phone: string | null;
  participants: number;
  status: string;
  created_at: string;
  source: string;
  gross_amount: number | null;
  commission_rate: number | null;
  commission_amount: number | null;
  commission_status: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  currency: string | null;
};

export default function PartnerConcierge() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { partner, loading: pLoading } = useHotelPartnerBySlug(slug);

  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // data
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState<Date>(startOfDay(new Date()));
  const [weekStart, setWeekStart] = useState<Date>(startOfDay(new Date()));

  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!session || !partner) { setAuthorized(null); return; }
    (async () => {
      const [{ data: rolesData }, { data: staffData }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
        (supabase as any).from("partner_staff").select("id").eq("user_id", session.user.id).eq("partner_id", partner.id).maybeSingle(),
      ]);
      const isAdmin = (rolesData || []).some((r: any) => r.role === "admin");
      setAuthorized(isAdmin || !!staffData);
    })();
  }, [session, partner]);

  useEffect(() => {
    if (!partner || authorized !== true) return;
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [partner, authorized]);

  const loadData = async () => {
    if (!partner) return;
    setLoading(true);
    const [expRes, bkRes] = await Promise.all([
      supabase
        .from("sofitel_experiences")
        .select("*")
        .eq("partner_id", partner.id)
        .gte("scheduled_at", new Date(Date.now() - 86400000).toISOString())
        .order("scheduled_at", { ascending: true }),
      (supabase as any)
        .from("sofitel_bookings")
        .select("*")
        .eq("partner_id", partner.id)
        .order("created_at", { ascending: false }),
    ]);
    setExperiences((expRes.data || []) as Experience[]);
    setBookings((bkRes.data || []) as Booking[]);
    setLoading(false);
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSigningIn(false);
    if (error) toast.error(error.message);
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("sofitel_bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status}`);
    loadData();
  };

  // group by day for the rail
  const dayBookings = useMemo(() => {
    return bookings.filter((b) => {
      const exp = experiences.find((e) => e.id === b.experience_id);
      if (!exp) return false;
      return isSameDay(parseISO(exp.scheduled_at), activeDay);
    });
  }, [bookings, experiences, activeDay]);

  const expByDay = useMemo(() => {
    return experiences.filter((e) => isSameDay(parseISO(e.scheduled_at), activeDay));
  }, [experiences, activeDay]);

  if (pLoading || authChecking) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  }
  if (!partner) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold mb-2">Property not found</h1>
          <Link to="/" className="text-sm underline">Back home</Link>
        </div>
      </div>
    );
  }

  const brand = partner.brand_color || "#c4654a";

  // Not signed in
  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center p-6" style={{ background: "#FBFAF6" }}>
        <Helmet><title>{partner.name} · Concierge</title></Helmet>
        <Card className="w-full max-w-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            {partner.logo_url
              ? <img src={partner.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
              : <div className="w-10 h-10 rounded-lg grid place-items-center text-white font-bold" style={{ background: brand }}>{partner.name.slice(0,2).toUpperCase()}</div>}
            <div>
              <p className="text-xs text-muted-foreground">Concierge</p>
              <h1 className="font-semibold">{partner.name}</h1>
            </div>
          </div>
          <form onSubmit={signIn} className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Password</label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={signingIn} style={{ background: brand }}>
              {signingIn && <Loader2 size={14} className="animate-spin mr-2" />}
              Sign in
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-3 text-center">Access is granted by the Terraria team.</p>
        </Card>
      </div>
    );
  }

  // Signed in but not authorized
  if (authorized === false) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center" style={{ background: "#FBFAF6" }}>
        <Card className="p-6 max-w-sm">
          <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <h1 className="font-semibold mb-1">No access to {partner.name}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Your account isn't assigned as staff for this property.
          </p>
          <Button variant="outline" size="sm" onClick={signOut}><LogOut size={12} className="mr-1" /> Sign out</Button>
        </Card>
      </div>
    );
  }

  if (authorized === null) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  }

  const upcoming = bookings.filter((b) => b.status !== "cancelled").length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="min-h-screen" style={{ background: "#FBFAF6", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Helmet><title>{partner.name} · Concierge</title></Helmet>

      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {partner.logo_url
              ? <img src={partner.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
              : <div className="w-9 h-9 rounded-lg grid place-items-center text-white font-bold text-xs" style={{ background: brand }}>{partner.name.slice(0,2).toUpperCase()}</div>}
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Concierge console</p>
              <h1 className="font-semibold truncate">{partner.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => window.open(`/partners/${partner.slug}`, "_blank")}>
              <ExternalLink size={12} className="mr-1" /> Landing
            </Button>
            <Button size="sm" variant="ghost" onClick={signOut}><LogOut size={12} className="mr-1" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Experiences" value={experiences.length} />
          <Stat label="Total bookings" value={bookings.length} />
          <Stat label="Active" value={upcoming} accent={brand} />
          <Stat label="Pending review" value={pending} accent="#d97706" />
        </div>

        {/* Day rail */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Schedule</h2>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft size={14} /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight size={14} /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(weekStart, i);
            const active = isSameDay(day, activeDay);
            const count = experiences.filter((e) => isSameDay(parseISO(e.scheduled_at), day)).length;
            return (
              <button key={i} onClick={() => setActiveDay(day)}
                className={`p-2 rounded-lg border text-center transition ${active ? "text-white" : "bg-white hover:bg-muted/40"}`}
                style={active ? { background: brand, borderColor: brand } : {}}>
                <div className="text-[10px] uppercase tracking-wider opacity-70">{format(day, "EEE")}</div>
                <div className="text-lg font-semibold">{format(day, "d")}</div>
                <div className="text-[10px] opacity-70">{count} exp</div>
              </button>
            );
          })}
        </div>

        {/* Experiences of the day */}
        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Experiences · {format(activeDay, "EEE MMM d")}</h3>
          {expByDay.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground text-center border-dashed">Nothing scheduled this day.</Card>
          ) : expByDay.map((e) => {
            const taken = bookings.filter((b) => b.experience_id === e.id && b.status !== "cancelled").reduce((s, b) => s + b.participants, 0);
            return (
              <Card key={e.id} className="p-3 flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {e.cover_image && <img src={e.cover_image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{e.title}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock size={10} />{format(parseISO(e.scheduled_at), "HH:mm")} · {e.duration_minutes}m</span>
                    <span className="inline-flex items-center gap-1"><Users size={10} />{taken}/{e.capacity}</span>
                    <span>{e.price_per_person} {e.currency}</span>
                  </div>
                </div>
                <Badge style={{ background: brand, color: "white" }} className="capitalize">{e.category}</Badge>
              </Card>
            );
          })}
        </section>

        {/* Bookings of the day */}
        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Bookings · {format(activeDay, "EEE MMM d")} ({dayBookings.length})
          </h3>
          {dayBookings.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground text-center border-dashed">No bookings for this day yet.</Card>
          ) : (
            <div className="space-y-1.5">
              {dayBookings.map((b) => {
                const exp = experiences.find((e) => e.id === b.experience_id);
                return (
                  <Card key={b.id} className="p-3 flex items-center gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{b.guest_name}</p>
                        <Badge variant="outline" className="text-[10px]">Room {b.room_number}</Badge>
                        <Badge className={`text-[10px] ${b.status === "confirmed" ? "bg-emerald-500" : b.status === "cancelled" ? "bg-zinc-400" : "bg-amber-500"}`}>{b.status}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {exp?.title} · {b.participants} pax{b.guest_email ? ` · ${b.guest_email}` : ""}{b.guest_phone ? ` · ${b.guest_phone}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {b.status !== "confirmed" && b.status !== "completed" && b.status !== "cancelled" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "confirmed")}>Confirm</Button>
                      )}
                      {b.status !== "completed" && b.status !== "cancelled" && (
                        <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(b.id, "completed")}>Done</Button>
                      )}
                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(b.id, "cancelled")}>Cancel</Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Statement / Commission */}
        <StatementPanel bookings={bookings} brand={brand} partnerName={partner.name} />

        {/* All recent bookings */}
        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">All recent bookings</h3>
          {loading && <Loader2 className="animate-spin text-muted-foreground" />}
          <div className="space-y-1.5">
            {bookings.slice(0, 20).map((b) => {
              const exp = experiences.find((e) => e.id === b.experience_id);
              return (
                <div key={b.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{b.guest_name} <span className="text-muted-foreground font-normal">· {exp?.title}</span></p>
                    <p className="text-[11px] text-muted-foreground">
                      {exp ? format(parseISO(exp.scheduled_at), "MMM d, HH:mm") : "—"} · Room {b.room_number} · {b.participants} pax
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">{b.status}</Badge>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <Card className="p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-0.5" style={accent ? { color: accent } : {}}>{value}</p>
    </Card>
  );
}

function StatementPanel({ bookings, brand, partnerName }: { bookings: any[]; brand: string; partnerName: string }) {
  const [range, setRange] = useState<"this_month" | "last_month" | "all">("this_month");

  const inRange = (iso?: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    const now = new Date();
    if (range === "all") return true;
    const monthOffset = range === "last_month" ? -1 : 0;
    const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);
    return d >= start && d < end;
  };

  const filtered = bookings.filter((b) => inRange(b.completed_at || b.cancelled_at || b.created_at));
  const completed = filtered.filter((b) => b.status === "completed");
  const cancelled = filtered.filter((b) => b.status === "cancelled");
  const gross = completed.reduce((s, b) => s + Number(b.gross_amount || 0), 0);
  const commissionDue = completed.filter((b) => b.commission_status === "due").reduce((s, b) => s + Number(b.commission_amount || 0), 0);
  const commissionPaid = completed.filter((b) => b.commission_status === "paid").reduce((s, b) => s + Number(b.commission_amount || 0), 0);
  const currency = completed[0]?.currency || "MAD";

  const exportCSV = () => {
    const headers = ["Date", "Guest", "Room", "Participants", "Status", "Gross", "Rate %", "Commission", "Commission status"];
    const rows = filtered.map((b) => [
      (b.completed_at || b.created_at || "").slice(0, 10),
      b.guest_name,
      b.room_number,
      b.participants,
      b.status,
      b.gross_amount ?? "",
      b.commission_rate ?? "",
      b.commission_amount ?? "",
      b.commission_status ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `statement-${partnerName.replace(/\s+/g, "-").toLowerCase()}-${range}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Statement & commission</h3>
        <div className="flex items-center gap-1">
          {(["this_month", "last_month", "all"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`text-[11px] px-2.5 py-1 rounded-full border ${range === r ? "text-white" : "bg-white"}`}
              style={range === r ? { background: brand, borderColor: brand } : {}}>
              {r === "this_month" ? "This month" : r === "last_month" ? "Last month" : "All time"}
            </button>
          ))}
          <Button size="sm" variant="outline" className="ml-1 h-7 text-[11px]" onClick={exportCSV}>Export CSV</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Stat label="Completed" value={completed.length} accent="#059669" />
        <Stat label="Cancelled" value={cancelled.length} />
        <KStat label="Gross" value={`${gross.toLocaleString()} ${currency}`} />
        <KStat label="Commission due" value={`${commissionDue.toLocaleString()} ${currency}`} accent={brand} />
        <KStat label="Commission paid" value={`${commissionPaid.toLocaleString()} ${currency}`} accent="#059669" />
      </div>
      {completed.length === 0 && (
        <Card className="p-4 text-xs text-muted-foreground text-center border-dashed">
          No completed bookings in this period yet. Mark a booking as Done after the guest attends to record commission.
        </Card>
      )}
    </section>
  );
}

function KStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-base font-semibold mt-0.5" style={accent ? { color: accent } : {}}>{value}</p>
    </Card>
  );
}

