import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Users, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function WorkshopsSection() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [b, a] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("workshop_availability").select("*"),
      ]);
      setBookings(b.data || []);
      setAvailability(a.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const thisWeekBookings = bookings.filter((b) => {
    if (!b.booking_date) return false;
    const d = new Date(b.booking_date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const totalParticipants = bookings.reduce((s, b) => s + (b.participants || 1), 0);
  const avgUtilization = bookings.length > 0 ? Math.round((confirmedCount / bookings.length) * 100) : 0;

  // By workshop type
  const byWorkshop = Object.entries(
    bookings.reduce((acc: Record<string, { total: number; confirmed: number; participants: number }>, b) => {
      if (!acc[b.workshop]) acc[b.workshop] = { total: 0, confirmed: 0, participants: 0 };
      acc[b.workshop].total++;
      if (b.status === "confirmed") acc[b.workshop].confirmed++;
      acc[b.workshop].participants += b.participants || 1;
      return acc;
    }, {})
  ).map(([name, data]) => ({ name, ...data, utilization: Math.round((data.confirmed / data.total) * 100) }));

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: bookings.length, icon: CalendarDays },
          { label: "Booked Spots", value: totalParticipants, icon: Users },
          { label: "Confirmed", value: confirmedCount, icon: CheckCircle2 },
          { label: "Avg Utilization", value: `${avgUtilization}%`, icon: TrendingUp },
        ].map((k) => (
          <div key={k.label} className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <k.icon size={18} className="text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">{k.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Utilization Chart */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h3 className="font-bold text-foreground mb-4">Session Utilization by Workshop</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={byWorkshop}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }} />
            <Bar dataKey="confirmed" fill="hsl(142, 71%, 45%)" name="Confirmed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total" fill="hsl(var(--primary) / 0.3)" name="Total" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* This Week's Sessions */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h3 className="font-bold text-foreground mb-4">This Week's Sessions</h3>
        {thisWeekBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No sessions scheduled this week</p>
        ) : (
          <div className="space-y-3">
            {thisWeekBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/20 hover:bg-muted/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {b.booking_date ? format(new Date(b.booking_date), "dd") : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.workshop} · {b.participants || 1} participants</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[b.status] || statusColors.pending}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Bookings List */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h3 className="font-bold text-foreground mb-4">Recent Bookings</h3>
        <div className="space-y-2">
          {bookings.slice(0, 15).map((b) => (
            <div key={b.id} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.workshop} · {b.booking_date || "No date"} · {b.participants || 1}p</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[b.status] || statusColors.pending}`}>
                {b.status === "confirmed" && <CheckCircle2 size={10} className="inline mr-0.5" />}
                {b.status === "pending" && <Clock size={10} className="inline mr-0.5" />}
                {b.status === "cancelled" && <XCircle size={10} className="inline mr-0.5" />}
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
