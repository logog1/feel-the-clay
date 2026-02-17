import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, CalendarDays, ShoppingCart, RefreshCw, Clock, CheckCircle2, XCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface Booking {
  id: string;
  name: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  workshop: string;
  session_info: string | null;
  participants: number | null;
  booking_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  region: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  delivery_fee: number;
  grand_total: number;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  delivered: "bg-blue-100 text-blue-800 border-blue-200",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.pending}`}>
    {status === "pending" && <Clock size={12} />}
    {status === "confirmed" && <CheckCircle2 size={12} />}
    {status === "cancelled" && <XCircle size={12} />}
    {status === "delivered" && <CheckCircle2 size={12} />}
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) { await supabase.auth.signOut(); navigate("/admin/login"); return; }
      setAuthed(true);
      fetchData();
    };
    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    const [b, o] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setBookings((b.data as Booking[]) || []);
    setOrders((o.data as Order[]) || []);
    setLoading(false);
  };

  const updateStatus = async (table: "bookings" | "orders", id: string, status: string) => {
    await supabase.from(table).update({ status }).eq("id", id);
    fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (!authed) return null;

  return (
    <main className="min-h-screen bg-background">
      <SEOHead title="Admin Dashboard" description="Manage bookings and orders" path="/admin" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b-2 border-border/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Terraria Admin</h1>
            <p className="text-xs text-muted-foreground">{bookings.length} bookings · {orders.length} orders</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2 rounded-xl">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 rounded-xl text-muted-foreground">
              <LogOut size={14} /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Bookings", value: bookings.length, icon: CalendarDays, pending: bookings.filter(b => b.status === "pending").length },
            { label: "Orders", value: orders.length, icon: ShoppingCart, pending: orders.filter(o => o.status === "pending").length },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-3xl bg-card border-2 border-border/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-cta/10 border border-cta/20 flex items-center justify-center">
                  <s.icon size={18} className="text-cta" />
                </div>
                <span className="text-2xl font-bold text-foreground">{s.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              {s.pending > 0 && <p className="text-xs text-amber-600 mt-1">{s.pending} pending</p>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings">
          <TabsList className="mb-6 rounded-2xl bg-muted/50 p-1">
            <TabsTrigger value="bookings" className="rounded-xl gap-2 data-[state=active]:bg-card"><CalendarDays size={14} /> Bookings</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl gap-2 data-[state=active]:bg-card"><ShoppingCart size={14} /> Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="p-5 rounded-3xl bg-card border-2 border-border/40 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-foreground">{b.name}</h3>
                        <p className="text-sm text-muted-foreground">{b.workshop} — {b.session_info || "Open Workshop"}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      {b.city && <div><span className="text-muted-foreground">City:</span> {b.city}</div>}
                      {b.email && <div><span className="text-muted-foreground">Email:</span> {b.email}</div>}
                      {b.phone && <div><span className="text-muted-foreground">Phone:</span> {b.phone}</div>}
                      <div><span className="text-muted-foreground">Participants:</span> {b.participants}</div>
                      {b.booking_date && <div><span className="text-muted-foreground">Date:</span> {b.booking_date}</div>}
                      <div><span className="text-muted-foreground">Submitted:</span> {new Date(b.created_at).toLocaleDateString()}</div>
                    </div>
                    {b.notes && <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">{b.notes}</p>}
                    <div className="flex gap-2 pt-1">
                      {b.status !== "confirmed" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1" onClick={() => updateStatus("bookings", b.id, "confirmed")}>
                          <CheckCircle2 size={12} /> Confirm
                        </Button>
                      )}
                      {b.status !== "cancelled" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-destructive" onClick={() => updateStatus("bookings", b.id, "cancelled")}>
                          <XCircle size={12} /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="p-5 rounded-3xl bg-card border-2 border-border/40 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-foreground">{o.customer_name}</h3>
                        <p className="text-sm text-muted-foreground">{o.region} — {o.grand_total} DH</p>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {o.customer_phone && <div><span className="text-muted-foreground">Phone:</span> {o.customer_phone}</div>}
                      {o.customer_address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {o.customer_address}</div>}
                      <div><span className="text-muted-foreground">Submitted:</span> {new Date(o.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-xl space-y-1">
                      {(o.items as Array<{ name: string; quantity: number; price: number }>).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-medium">{item.price * item.quantity} DH</span>
                        </div>
                      ))}
                      <div className="border-t border-border/30 pt-1 mt-1 flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span>{o.delivery_fee} DH</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm">
                        <span>Total</span>
                        <span className="text-cta">{o.grand_total} DH</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {o.status !== "confirmed" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1" onClick={() => updateStatus("orders", o.id, "confirmed")}>
                          <CheckCircle2 size={12} /> Confirm
                        </Button>
                      )}
                      {o.status !== "delivered" && o.status === "confirmed" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1" onClick={() => updateStatus("orders", o.id, "delivered")}>
                          <CheckCircle2 size={12} /> Delivered
                        </Button>
                      )}
                      {o.status !== "cancelled" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-destructive" onClick={() => updateStatus("orders", o.id, "cancelled")}>
                          <XCircle size={12} /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminDashboard;
