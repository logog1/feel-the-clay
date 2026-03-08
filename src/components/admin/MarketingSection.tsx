import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, CheckCircle2, X, Megaphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface MarketingItem {
  id: string; title: string; type: string; status: string; platform: string | null;
  assignee: string | null; due_date: string | null; notes: string | null; created_at: string;
}

const TYPES = ["post", "email", "event", "campaign", "ad"];
const STATUSES = ["idea", "in_progress", "done", "published"];
const PLATFORMS = ["Instagram", "Facebook", "TikTok", "Email", "Website", "TripAdvisor", "Other"];

const statusColors: Record<string, string> = {
  idea: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  done: "bg-emerald-100 text-emerald-800 border-emerald-200",
  published: "bg-blue-100 text-blue-800 border-blue-200",
};

export function MarketingSection() {
  const [items, setItems] = useState<MarketingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<MarketingItem | null>(null);
  const [draft, setDraft] = useState({ title: "", type: "post", status: "idea", platform: "", assignee: "", due_date: "", notes: "" });

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from("marketing_items").select("*").order("created_at", { ascending: false });
    setItems((data as MarketingItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async () => {
    if (!draft.title) return;
    await supabase.from("marketing_items").insert({
      title: draft.title, type: draft.type, status: draft.status,
      platform: draft.platform || null, assignee: draft.assignee || null,
      due_date: draft.due_date || null, notes: draft.notes || null,
    });
    setDraft({ title: "", type: "post", status: "idea", platform: "", assignee: "", due_date: "", notes: "" });
    setShowAdd(false);
    fetchItems();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("marketing_items").update({ status }).eq("id", id);
    fetchItems();
  };

  const saveEdit = async () => {
    if (!editItem) return;
    await supabase.from("marketing_items").update({
      title: draft.title, type: draft.type, status: draft.status,
      platform: draft.platform || null, assignee: draft.assignee || null,
      due_date: draft.due_date || null, notes: draft.notes || null,
    }).eq("id", editItem.id);
    setEditItem(null);
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("marketing_items").delete().eq("id", id);
    fetchItems();
  };

  const filtered = typeFilter === "all" ? items : items.filter((i) => i.type === typeFilter);

  // Type filter cards
  const typeCounts = TYPES.reduce((acc, t) => ({ ...acc, [t]: items.filter((i) => i.type === t).length }), {} as Record<string, number>);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Type Filter Cards */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTypeFilter("all")} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${typeFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-muted-foreground hover:bg-muted/50"}`}>
          All ({items.length})
        </button>
        {TYPES.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize ${typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-muted-foreground hover:bg-muted/50"}`}>
            {t} ({typeCounts[t] || 0})
          </button>
        ))}
        <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground ml-auto" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Item
        </Button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-card border border-border/40 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground capitalize">{item.type}</span>
                {item.platform && <span className="text-xs text-muted-foreground">{item.platform}</span>}
              </div>
              <p className="font-medium text-foreground">{item.title}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                {item.assignee && <span>👤 {item.assignee}</span>}
                {item.due_date && <span>📅 {item.due_date}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v)}>
                <SelectTrigger className="rounded-xl h-8 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => { setEditItem(item); setDraft({ title: item.title, type: item.type, status: item.status, platform: item.platform || "", assignee: item.assignee || "", due_date: item.due_date || "", notes: item.notes || "" }); }}>
                <Pencil size={13} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteItem(item.id)}>
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No marketing items yet</p>}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={showAdd || !!editItem} onOpenChange={() => { setShowAdd(false); setEditItem(null); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editItem ? "Edit Item" : "Add Marketing Item"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title</Label><Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Type</Label>
                <Select value={draft.type} onValueChange={(v) => setDraft((d) => ({ ...d, type: v }))}><SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label className="text-xs">Status</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft((d) => ({ ...d, status: v }))}><SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Platform</Label>
                <Select value={draft.platform} onValueChange={(v) => setDraft((d) => ({ ...d, platform: v }))}><SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label className="text-xs">Assignee</Label><Input value={draft.assignee} onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            </div>
            <div><Label className="text-xs">Due Date</Label><Input type="date" value={draft.due_date} onChange={(e) => setDraft((d) => ({ ...d, due_date: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            <div><Label className="text-xs">Notes</Label><Input value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            <Button onClick={editItem ? saveEdit : addItem} className="w-full rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <CheckCircle2 size={14} /> {editItem ? "Save" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
