import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, DollarSign, Clock, CheckCircle2, XCircle, Package, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export function SalesSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.customer_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRevenue = orders.filter((o) => o.status === "delivered" || o.status === "done").reduce((s, o) => s + (o.grand_total || 0), 0);
  const paidOrders = orders.filter((o) => o.status === "delivered" || o.status === "done").length;

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    packed: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-blue-100 text-blue-800 border-blue-200",
    done: "bg-teal-100 text-teal-800 border-teal-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    retour: "bg-orange-100 text-orange-800 border-orange-200",
  };

  const statusIcons: Record<string, React.ElementType> = {
    pending: Clock, confirmed: CheckCircle2, packed: Package, delivered: CheckCircle2,
    done: CheckCircle2, cancelled: XCircle, retour: AlertTriangle,
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="px-4 py-2 rounded-xl bg-card border border-border/40 text-sm">
          <span className="font-bold text-foreground mr-1">{orders.length}</span>
          <span className="text-muted-foreground">Total Orders</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
          <span className="font-bold text-emerald-800 mr-1">{totalRevenue.toLocaleString()} DH</span>
          <span className="text-emerald-600">Revenue</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-card border border-border/40 text-sm">
          <span className="font-bold text-foreground mr-1">{paidOrders}</span>
          <span className="text-muted-foreground">Fulfilled</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer..." className="pl-9 rounded-xl h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="rounded-xl h-9 text-sm w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.keys(statusColors).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-border/40 overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Items</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const items = Array.isArray(o.items) ? o.items : [];
                const Icon = statusIcons[o.status] || Clock;
                return (
                  <tr key={o.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{o.customer_name}</p>
                      {o.region && <p className="text-xs text-muted-foreground">{o.region}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {items.map((i: any) => `${i.name} ×${i.quantity}`).join(", ") || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{o.grand_total} DH</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[o.status] || statusColors.pending}`}>
                        <Icon size={10} /> {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden sm:table-cell">
                      {format(new Date(o.created_at), "MMM d")}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
