import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Download, Search, Pencil, Trash2, Wifi, WifiOff, Globe, X, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  source: string;
  notes: string | null;
  total_bookings: number;
  from_website: boolean;
  created_at: string;
  updated_at: string;
}

export function CustomersSection() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Customer>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(true);

  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers((data as Customer[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();

    // Real-time subscription
    const channel = supabase
      .channel("customers-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => {
        fetchCustomers();
      })
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, [fetchCustomers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleEdit = (c: Customer) => {
    setEditCustomer(c);
    setEditDraft({ ...c });
  };

  const saveEdit = async () => {
    if (!editCustomer) return;
    await supabase.from("customers").update({
      name: editDraft.name,
      email: editDraft.email,
      phone: editDraft.phone,
      city: editDraft.city,
      source: editDraft.source,
      notes: editDraft.notes,
    }).eq("id", editCustomer.id);
    setEditCustomer(null);
    fetchCustomers();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("customers").delete().eq("id", deleteId);
    setDeleteId(null);
    fetchCustomers();
  };

  const downloadCSV = () => {
    const headers = ["Name", "Email", "Phone", "City", "Source", "Bookings", "From Website", "Created"];
    const rows = customers.map((c) => [c.name, c.email || "", c.phone || "", c.city || "", c.source, c.total_bookings, c.from_website ? "Yes" : "No", format(new Date(c.created_at), "yyyy-MM-dd")]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const filtered = customers.filter((c) =>
    [c.name, c.email, c.phone, c.city].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: customers.length,
    withBookings: customers.filter((c) => c.total_bookings > 0).length,
    fromWebsite: customers.filter((c) => c.from_website).length,
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Customers", value: stats.total },
          { label: "With Bookings", value: stats.withBookings },
          { label: "From Website", value: stats.fromWebsite },
        ].map((s) => (
          <div key={s.label} className="px-4 py-2 rounded-xl bg-card border border-border/40 text-sm">
            <span className="font-bold text-foreground mr-1.5">{s.value}</span>
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
          {realtimeConnected ? <Wifi size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-amber-500" />}
          {realtimeConnected ? "Live" : "Reconnecting…"}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="pl-9 rounded-xl h-9 text-sm"
          />
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={downloadCSV}>
          <Download size={14} /> CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/40 overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Source</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Bookings</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{c.name}</span>
                      {c.from_website && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium flex items-center gap-0.5">
                          <Globe size={9} /> new
                        </span>
                      )}
                    </div>
                    {c.city && <p className="text-xs text-muted-foreground">{c.city}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.phone || "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground">{c.source}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-foreground">{c.total_bookings}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleEdit(c)}>
                        <Pencil size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => setDeleteId(c.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "city", label: "City" },
              { key: "source", label: "Source" },
              { key: "notes", label: "Notes" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input
                  value={(editDraft as any)[key] || ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, [key]: e.target.value }))}
                  className="rounded-xl h-9 text-sm"
                />
              </div>
            ))}
            <Button onClick={saveEdit} className="w-full rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <CheckCircle2 size={14} /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-destructive/30 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-foreground mb-2">Delete Customer?</h3>
            <p className="text-sm text-muted-foreground mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5" onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
