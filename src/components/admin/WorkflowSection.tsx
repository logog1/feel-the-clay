import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2, Trash2, FileText, ClipboardList } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Workflow checklists stored in site_settings as JSON for simplicity
interface ChecklistItem { text: string; done: boolean; }
interface Checklist { id: string; title: string; location: string; session: string; items: ChecklistItem[]; created_at: string; }

export function WorkflowSection() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ title: "", location: "on-site", session: "" });
  const [newItems, setNewItems] = useState<string[]>([""]);
  const [locationFilter, setLocationFilter] = useState("all");

  const fetchChecklists = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("key", "workflow_checklists").maybeSingle();
    if (data?.value) {
      try { setChecklists(JSON.parse(data.value)); } catch { setChecklists([]); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchChecklists(); }, [fetchChecklists]);

  const saveChecklists = async (updated: Checklist[]) => {
    setChecklists(updated);
    await supabase.from("site_settings").upsert({
      key: "workflow_checklists", value: JSON.stringify(updated), updated_at: new Date().toISOString(),
    });
  };

  const addChecklist = () => {
    if (!draft.title) return;
    const items = newItems.filter((t) => t.trim()).map((text) => ({ text, done: false }));
    const newCl: Checklist = {
      id: crypto.randomUUID(), title: draft.title, location: draft.location,
      session: draft.session, items, created_at: new Date().toISOString(),
    };
    saveChecklists([newCl, ...checklists]);
    setDraft({ title: "", location: "on-site", session: "" });
    setNewItems([""]);
    setShowAdd(false);
  };

  const toggleItem = (clId: string, itemIdx: number) => {
    const updated = checklists.map((cl) => {
      if (cl.id !== clId) return cl;
      const items = cl.items.map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it);
      return { ...cl, items };
    });
    saveChecklists(updated);
  };

  const deleteChecklist = (id: string) => {
    saveChecklists(checklists.filter((cl) => cl.id !== id));
  };

  const filtered = locationFilter === "all" ? checklists : checklists.filter((cl) => cl.location === locationFilter);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="rounded-xl h-9 text-sm w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            <SelectItem value="on-site">On-site</SelectItem>
            <SelectItem value="off-site">Off-site</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground ml-auto" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> New Checklist
        </Button>
      </div>

      {filtered.map((cl) => {
        const done = cl.items.filter((i) => i.done).length;
        const total = cl.items.length;
        return (
          <div key={cl.id} className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-foreground">{cl.title}</h4>
                <p className="text-xs text-muted-foreground">{cl.location} · {cl.session || "General"} · {done}/{total} done</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteChecklist(cl.id)}>
                <Trash2 size={13} />
              </Button>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
            </div>
            <div className="space-y-1.5">
              {cl.items.map((item, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox checked={item.done} onCheckedChange={() => toggleItem(cl.id, i)} />
                  <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No checklists yet</p>}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>New Checklist</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title</Label><Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Location</Label>
                <Select value={draft.location} onValueChange={(v) => setDraft((d) => ({ ...d, location: v }))}><SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="on-site">On-site</SelectItem><SelectItem value="off-site">Off-site</SelectItem></SelectContent></Select>
              </div>
              <div><Label className="text-xs">Session</Label><Input value={draft.session} onChange={(e) => setDraft((d) => ({ ...d, session: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="e.g. Pottery AM" /></div>
            </div>
            <div>
              <Label className="text-xs">Checklist Items</Label>
              {newItems.map((item, i) => (
                <div key={i} className="flex gap-2 mt-1.5">
                  <Input value={item} onChange={(e) => { const u = [...newItems]; u[i] = e.target.value; setNewItems(u); }} className="rounded-xl h-9 text-sm" placeholder={`Item ${i + 1}`} />
                  {i === newItems.length - 1 && (
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0" onClick={() => setNewItems([...newItems, ""])}>
                      <Plus size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={addChecklist} className="w-full rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <CheckCircle2 size={14} /> Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
