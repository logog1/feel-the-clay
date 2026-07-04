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
import { Calendar, Users, Clock, LogOut, Loader2, Lock, ChevronLeft, ChevronRight, Mail, Phone, ExternalLink, QrCode, BookOpen } from "lucide-react";
import ConciergeAnalytics from "@/components/partner/ConciergeAnalytics";

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
            <Button size="sm" variant="outline" onClick={() => window.open(`/partners/${partner.slug}/guide`, "_blank")}>
              <BookOpen size={12} className="mr-1" /> Guide
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(`/partners/${partner.slug}/kit`, "_blank")}>
              <BookOpen size={12} className="mr-1" /> Staff Kit
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(`/partners/${partner.slug}/qr`, "_blank")}>
              <QrCode size={12} className="mr-1" /> QR Kit
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(`/partners/${partner.slug}`, "_blank")}>
              <ExternalLink size={12} className="mr-1" /> Landing
            </Button>
            <Button size="sm" variant="ghost" onClick={signOut}><LogOut size={12} className="mr-1" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-5">
        <TermsBanner partnerId={partner.id} userId={session.user.id} brand={brand} />
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
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week"><ChevronLeft size={14} /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week"><ChevronRight size={14} /></Button>
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

        {/* Scan funnel + per-variant + payouts */}
        <ConciergeAnalytics partnerId={partner.id} brand={brand} partnerName={partner.name} />

        {/* Welcome kit orders */}
        <KitOrdersPanel partnerId={partner.id} userId={session.user.id} brand={brand} />



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

type KitOrder = {
  id: string;
  kit_type: string;
  quantity: number;
  status: string;
  tracking_number: string | null;
  courier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
};

function KitOrdersPanel({ partnerId, userId, brand }: { partnerId: string; userId: string; brand: string }) {
  const [rows, setRows] = useState<KitOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kitType, setKitType] = useState("welcome");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("partner_kit_orders")
      .select("id,kit_type,quantity,status,tracking_number,courier,shipped_at,delivered_at,notes,created_at")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    setRows((data || []) as KitOrder[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [partnerId]);

  const request = async () => {
    if (qty < 1) return;
    setSubmitting(true);
    const { error } = await (supabase as any)
      .from("partner_kit_orders")
      .insert({
        partner_id: partnerId,
        kit_type: kitType,
        quantity: qty,
        notes: notes.trim() || null,
        requested_by: userId,
        status: "requested",
      });
    setSubmitting(false);
    if (error) { toast.error(error.message || "Could not submit request"); return; }
    toast.success("Kit request submitted");
    setQty(1); setNotes("");
    load();
  };

  const statusColor = (s: string) =>
    s === "delivered" ? "bg-emerald-100 text-emerald-700"
    : s === "shipped" ? "bg-blue-100 text-blue-700"
    : s === "preparing" ? "bg-amber-100 text-amber-700"
    : s === "cancelled" ? "bg-red-100 text-red-700"
    : "bg-muted text-muted-foreground";

  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Welcome kits</h3>
      <Card className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground">
          Request Terraria welcome kits (zellige samples, brochures, QR cards) for your property.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Kit type</label>
            <select value={kitType} onChange={(e) => setKitType(e.target.value)} className="w-full mt-1 h-9 px-2 rounded-md border bg-background text-sm">
              <option value="welcome">Welcome kit</option>
              <option value="qr_cards">QR cards only</option>
              <option value="brochures">Brochures</option>
              <option value="samples">Zellige samples</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Quantity</label>
            <Input type="number" min={1} max={100} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 h-9" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Notes (optional)</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery instructions, special request…" className="mt-1 h-9" />
          </div>
        </div>
        <Button onClick={request} disabled={submitting} style={{ background: brand }} className="text-white w-full md:w-auto">
          {submitting ? <Loader2 className="animate-spin mr-1" size={14} /> : null} Request kit
        </Button>
      </Card>

      {loading ? (
        <div className="py-4 text-center"><Loader2 className="animate-spin inline text-muted-foreground" size={16} /></div>
      ) : rows.length === 0 ? null : (
        <Card className="overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Requested</th>
                <th className="text-left px-3 py-2">Kit</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Tracking</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.created_at.slice(0, 10)}</td>
                  <td className="px-3 py-2 capitalize">{r.kit_type.replace(/_/g, " ")}</td>
                  <td className="px-3 py-2 text-right">{r.quantity}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${statusColor(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.tracking_number ? `${r.courier || ""} ${r.tracking_number}`.trim() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}


function TermsBanner({ partnerId, userId, brand }: { partnerId: string; userId: string; brand: string }) {
  const [status, setStatus] = useState<"loading" | "needed" | "accepted" | "hidden">("loading");
  const [saving, setSaving] = useState(false);
  const TERMS_VERSION = "2026-01";

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("partner_staff")
        .select("terms_accepted_at, terms_version")
        .eq("user_id", userId)
        .eq("partner_id", partnerId)
        .maybeSingle();
      if (data?.terms_accepted_at && data?.terms_version === TERMS_VERSION) {
        setStatus("hidden");
      } else {
        setStatus("needed");
      }
    })();
  }, [partnerId, userId]);

  const accept = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("partner_staff")
      .update({ terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION })
      .eq("user_id", userId)
      .eq("partner_id", partnerId);
    setSaving(false);
    if (error) { toast.error("Could not save. Try again."); return; }
    toast.success("Terms accepted. Thank you!");
    setStatus("hidden");
  };

  if (status === "hidden" || status === "loading") return null;

  return (
    <Card className="p-4 border-2" style={{ borderColor: brand, background: `${brand}0d` }}>
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Please review the partnership terms</p>
          <p className="text-xs text-muted-foreground">
            You need to accept the current terms ({TERMS_VERSION}) before continuing to use the concierge dashboard.{" "}
            <Link to="/partners/terms" target="_blank" className="underline">Read terms →</Link>
          </p>
        </div>
        <Button onClick={accept} disabled={saving} style={{ background: brand }} className="text-white shrink-0">
          {saving ? <Loader2 className="animate-spin" size={14} /> : "I accept the terms"}
        </Button>
      </div>
    </Card>
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

  const rangeLabel = range === "this_month" ? "This month" : range === "last_month" ? "Last month" : "All time";
  const periodLabel = (() => {
    if (range === "all") return "All time";
    const now = new Date();
    const offset = range === "last_month" ? -1 : 0;
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  })();

  const downloadPDF = () => {
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    const rowsHtml = completed.map((b) => `
      <tr>
        <td>${(b.completed_at || b.created_at || "").slice(0, 10)}</td>
        <td>${escapeHtml(b.guest_name || "")}</td>
        <td>${escapeHtml(b.room_number || "")}</td>
        <td style="text-align:right">${b.participants ?? ""}</td>
        <td style="text-align:right">${Number(b.gross_amount || 0).toLocaleString()} ${b.currency || currency}</td>
        <td style="text-align:right">${b.commission_rate ?? ""}%</td>
        <td style="text-align:right">${Number(b.commission_amount || 0).toLocaleString()} ${b.currency || currency}</td>
        <td style="text-transform:capitalize">${b.commission_status || "due"}</td>
      </tr>`).join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Statement · ${escapeHtml(partnerName)} · ${periodLabel}</title>
      <style>
        *{box-sizing:border-box} body{font-family:Inter,system-ui,sans-serif;color:#1a1a1a;padding:32px;max-width:820px;margin:0 auto}
        h1{font-size:22px;margin:0} .muted{color:#666;font-size:12px} .bar{height:4px;background:${brand};margin:14px 0 22px;border-radius:2px}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0 22px}
        .box{border:1px solid #eee;border-radius:8px;padding:10px}
        .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#888}
        .val{font-size:16px;font-weight:600;margin-top:4px}
        table{width:100%;border-collapse:collapse;font-size:12px} th,td{padding:7px 8px;border-bottom:1px solid #eee;text-align:left}
        th{background:#fafafa;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#666}
        .total{margin-top:16px;text-align:right;font-size:14px} .total b{color:${brand};font-size:18px}
        .foot{margin-top:32px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:12px}
        @media print{@page{margin:18mm}}
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div><h1>Commission statement</h1><div class="muted">${escapeHtml(partnerName)} · ${periodLabel}</div></div>
        <div class="muted" style="text-align:right">Issued ${new Date().toLocaleDateString()}<br/>Terraria Workshops</div>
      </div>
      <div class="bar"></div>
      <div class="grid">
        <div class="box"><div class="lbl">Completed</div><div class="val">${completed.length}</div></div>
        <div class="box"><div class="lbl">Gross</div><div class="val">${gross.toLocaleString()} ${currency}</div></div>
        <div class="box"><div class="lbl">Commission due</div><div class="val" style="color:${brand}">${commissionDue.toLocaleString()} ${currency}</div></div>
        <div class="box"><div class="lbl">Commission paid</div><div class="val" style="color:#059669">${commissionPaid.toLocaleString()} ${currency}</div></div>
      </div>
      <table><thead><tr><th>Date</th><th>Guest</th><th>Room</th><th style="text-align:right">Pax</th><th style="text-align:right">Gross</th><th style="text-align:right">Rate</th><th style="text-align:right">Commission</th><th>Status</th></tr></thead>
      <tbody>${rowsHtml || `<tr><td colspan="8" style="text-align:center;color:#888;padding:24px">No completed bookings</td></tr>`}</tbody></table>
      <div class="total">Total commission due this period: <b>${commissionDue.toLocaleString()} ${currency}</b></div>
      <div class="foot">Payable within 15 days of statement date. Questions: hello@terrariaworkshops.com</div>
      <script>setTimeout(()=>window.print(),300)<\/script>
      </body></html>`);
    w.document.close();
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Statement & commission · {rangeLabel}</h3>
        <div className="flex items-center gap-1 flex-wrap">
          {(["this_month", "last_month", "all"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`text-[11px] px-2.5 py-1 rounded-full border ${range === r ? "text-white" : "bg-white"}`}
              style={range === r ? { background: brand, borderColor: brand } : {}}>
              {r === "this_month" ? "This month" : r === "last_month" ? "Last month" : "All time"}
            </button>
          ))}
          <Button size="sm" variant="outline" className="ml-1 h-7 text-[11px]" onClick={exportCSV}>Export CSV</Button>
          <Button size="sm" className="h-7 text-[11px] text-white" style={{ background: brand }} onClick={downloadPDF}>Download PDF</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Stat label="Completed" value={completed.length} accent="#059669" />
        <Stat label="Cancelled" value={cancelled.length} />
        <KStat label="Gross" value={`${gross.toLocaleString()} ${currency}`} />
        <KStat label="Commission due" value={`${commissionDue.toLocaleString()} ${currency}`} accent={brand} />
        <KStat label="Commission paid" value={`${commissionPaid.toLocaleString()} ${currency}`} accent="#059669" />
      </div>
      {completed.length === 0 ? (
        <Card className="p-4 text-xs text-muted-foreground text-center border-dashed">
          No completed bookings in this period yet. Mark a booking as Done after the guest attends to record commission.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Guest</th>
                  <th className="text-left px-3 py-2">Room</th>
                  <th className="text-right px-3 py-2">Pax</th>
                  <th className="text-right px-3 py-2">Gross</th>
                  <th className="text-right px-3 py-2">Rate</th>
                  <th className="text-right px-3 py-2">Commission</th>
                  <th className="text-left px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-3 py-2">{(b.completed_at || b.created_at || "").slice(0, 10)}</td>
                    <td className="px-3 py-2 font-medium">{b.guest_name}</td>
                    <td className="px-3 py-2">{b.room_number}</td>
                    <td className="px-3 py-2 text-right">{b.participants}</td>
                    <td className="px-3 py-2 text-right">{Number(b.gross_amount || 0).toLocaleString()} {b.currency || currency}</td>
                    <td className="px-3 py-2 text-right">{b.commission_rate ?? "—"}%</td>
                    <td className="px-3 py-2 text-right font-semibold" style={{ color: brand }}>{Number(b.commission_amount || 0).toLocaleString()} {b.currency || currency}</td>
                    <td className="px-3 py-2 capitalize">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${b.commission_status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {b.commission_status || "due"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/20 font-semibold">
                <tr>
                  <td className="px-3 py-2" colSpan={4}>Total · {periodLabel}</td>
                  <td className="px-3 py-2 text-right">{gross.toLocaleString()} {currency}</td>
                  <td></td>
                  <td className="px-3 py-2 text-right" style={{ color: brand }}>{commissionDue.toLocaleString()} {currency}</td>
                  <td className="px-3 py-2 text-[10px] text-muted-foreground">due</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function KStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className="p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-base font-semibold mt-0.5" style={accent ? { color: accent } : {}}>{value}</p>
    </Card>
  );
}

