import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, AlertTriangle, CheckCircle2, Package, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface InventoryItem {
  id: string; name: string; category: string; quantity: number; min_quantity: number;
  unit: string; status: string; linked_workshop: string | null; notes: string | null;
}

const CATEGORIES = ["clay", "glaze", "tools", "packaging", "fabric", "thread", "dye", "general"];
const STATUSES = ["in_stock", "low_stock", "out_of_stock", "lost_cracked"];
const WORKSHOPS = ["Pottery Experience", "Handbuilding", "Embroidery", "Zellij", "Carpets"];

const statusStyles: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-800 border-emerald-200",
  low_stock: "bg-amber-100 text-amber-800 border-amber-200",
  out_of_stock: "bg-red-100 text-red-800 border-red-200",
  lost_cracked: "bg-muted text-muted-foreground border-border",
};

export function InventorySection() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [draft, setDraft] = useState({ name: "", category: "general", quantity: 0, min_quantity: 5, unit: "pcs", linked_workshop: "", notes: "" });

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from("inventory_items").select("*").order("name");
    setItems((data as InventoryItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const computeStatus = (qty: number, min: number) => {
    if (qty <= 0) return "out_of_stock";
    if (qty <= min) return "low_stock";
    return "in_stock";
  };

  const addItem = async () => {
    if (!draft.name) return;
    const status = computeStatus(draft.quantity, draft.min_quantity);
    await supabase.from("inventory_items").insert({
      name: draft.name, category: draft.category, quantity: draft.quantity,
      min_quantity: draft.min_quantity, unit: draft.unit, status,
      linked_workshop: draft.linked_workshop || null, notes: draft.notes || null,
    });
    setDraft({ name: "", category: "general", quantity: 0, min_quantity: 5, unit: "pcs", linked_workshop: "", notes: "" });
    setShowAdd(false);
    fetchItems();
  };

  const updateQuantity = async (item: InventoryItem, newQty: number) => {
    const status = computeStatus(newQty, item.min_quantity);
    await supabase.from("inventory_items").update({ quantity: newQty, status }).eq("id", item.id);
    fetchItems();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("inventory_items").update({ status }).eq("id", id);
    fetchItems();
  };

  const saveEdit = async () => {
    if (!editItem) return;
    const status = computeStatus(draft.quantity, draft.min_quantity);
    await supabase.from("inventory_items").update({
      name: draft.name, category: draft.category, quantity: draft.quantity,
      min_quantity: draft.min_quantity, unit: draft.unit, status,
      linked_workshop: draft.linked_workshop || null, notes: draft.notes || null,
    }).eq("id", editItem.id);
    setEditItem(null);
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    await supabase.from("inventory_items").delete().eq("id", id);
    fetchItems();
  };

  const lowStockCount = items.filter((i) => i.status === "low_stock").length;
  const outOfStockCount = items.filter((i) => i.status === "out_of_stock").length;

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {lowStockCount > 0 && (
            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600" />
              <span className="text-amber-800 font-medium">{lowStockCount} items low stock</span>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-sm flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-600" />
              <span className="text-red-800 font-medium">{outOfStockCount} items out of stock</span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Item
        </Button>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl border border-border/40 overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Item</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Qty</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Min</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.linked_workshop && <p className="text-xs text-muted-foreground">{item.linked_workshop}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => updateQuantity(item, Math.max(0, item.quantity - 1))} className="w-6 h-6 rounded-md bg-muted hover:bg-muted/80 text-xs font-bold">-</button>
                      <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item, item.quantity + 1)} className="w-6 h-6 rounded-md bg-muted hover:bg-muted/80 text-xs font-bold">+</button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.unit}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">{item.min_quantity}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusStyles[item.status] || statusStyles.in_stock}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => { setEditItem(item); setDraft({ name: item.name, category: item.category, quantity: item.quantity, min_quantity: item.min_quantity, unit: item.unit, linked_workshop: item.linked_workshop || "", notes: item.notes || "" }); }}>
                        <Pencil size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteItem(item.id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No inventory items yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={showAdd || !!editItem} onOpenChange={() => { setShowAdd(false); setEditItem(null); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editItem ? "Edit Item" : "Add Inventory Item"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name</Label><Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Category</Label>
                <Select value={draft.category} onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}><SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label className="text-xs">Unit</Label><Input value={draft.unit} onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Quantity</Label><Input type="number" value={draft.quantity} onChange={(e) => setDraft((d) => ({ ...d, quantity: Number(e.target.value) }))} className="rounded-xl h-9 text-sm" /></div>
              <div><Label className="text-xs">Min Quantity</Label><Input type="number" value={draft.min_quantity} onChange={(e) => setDraft((d) => ({ ...d, min_quantity: Number(e.target.value) }))} className="rounded-xl h-9 text-sm" /></div>
            </div>
            <div><Label className="text-xs">Linked Workshop</Label>
              <Select value={draft.linked_workshop} onValueChange={(v) => setDraft((d) => ({ ...d, linked_workshop: v }))}><SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue placeholder="None" /></SelectTrigger><SelectContent>{WORKSHOPS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select>
            </div>
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
