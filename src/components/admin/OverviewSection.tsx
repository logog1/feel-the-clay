import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, ShoppingCart, DollarSign, Users, TrendingUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface KPI {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
}

export function OverviewSection() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [b, o] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      setBookings(b.data || []);
      setOrders(o.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Calculate revenue
  const totalRevenue = orders.filter((o) => o.status === "delivered" || o.status === "done").reduce((sum, o) => sum + (o.grand_total || 0), 0);
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;

  // Monthly revenue chart data (last 6 months)
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const monthOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= start && d <= end && (o.status === "delivered" || o.status === "done");
    });
    return {
      month: format(month, "MMM"),
      revenue: monthOrders.reduce((s: number, o: any) => s + (o.grand_total || 0), 0),
      orders: monthOrders.length,
    };
  });

  // Bookings by workshop
  const workshopData = Object.entries(
    bookings.reduce((acc: Record<string, number>, b) => {
      acc[b.workshop] = (acc[b.workshop] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const kpis: KPI[] = [
    { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} DH`, sub: `${orders.length} orders`, icon: DollarSign },
    { label: "Bookings", value: bookings.length, sub: `${confirmedBookings} confirmed`, icon: CalendarDays },
    { label: "Orders", value: orders.length, sub: `${orders.filter((o) => o.status === "pending").length} pending`, icon: ShoppingCart },
    { label: "Unique Customers", value: new Set([...bookings.map((b) => b.email), ...orders.map((o) => o.customer_phone)].filter(Boolean)).size, sub: "across all channels", icon: Users },
  ];

  // Recent activity
  const recentActivity = [
    ...bookings.slice(0, 5).map((b) => ({ type: "booking" as const, name: b.name, detail: b.workshop, time: b.created_at, status: b.status })),
    ...orders.slice(0, 5).map((o) => ({ type: "order" as const, name: o.customer_name, detail: `${o.grand_total} DH`, time: o.created_at, status: o.status })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <k.icon size={18} className="text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">{k.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="text-xs text-muted-foreground/70">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Monthly Revenue
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Workshop */}
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" /> Bookings by Workshop
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={workshopData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${a.type === "booking" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                {a.type === "booking" ? "B" : "O"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                a.status === "confirmed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                a.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-200" :
                "bg-muted text-muted-foreground border-border"
              }`}>{a.status}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(a.time), "MMM d")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
