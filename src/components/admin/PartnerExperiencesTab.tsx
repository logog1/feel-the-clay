import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Calendar, Users, Clock, Image as ImageIcon, Loader2, Sparkles,
} from "lucide-react";

export type PartnerExperience = {
  id: string;
  partner_id: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  cover_image: string | null;
  category: string;
  audience: string;
  difficulty: string;
  capacity: number;
  location: string | null;
  scheduled_at: string;
  duration_minutes: number;
  price_per_person: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function PartnerExperiencesTab({ partnerId, brandColor }: { partnerId: string; brandColor: string }) {
  const [items, setItems] = useState<PartnerExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PartnerExperience | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sofitel_experiences")
      .select("*")
      .eq("partner_id", partnerId)
      .order("sort_order", { ascending: true })
      .order("scheduled_at", { ascending: true });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setItems((data || []) as PartnerExperience[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  const toggleActive = async (e: PartnerExperience) => {
    await supabase.from("sofitel_experiences").update({ is_active: !e.is_active }).eq("id", e.id);
    load();
  };

  const remove = async (e: PartnerExperience) => {
    if (!confirm(`Delete "${e.title}"?`)) return;
    const { error } = await supabase.from("sofitel_experiences").delete().eq("id", e.id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Deleted" });
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Experiences</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length} total · {items.filter((i) => i.is_active).length} active
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)} className="rounded-lg" style={{ background: brandColor }}>
          <Plus size={14} className="mr-1" /> New experience
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="animate-spin inline text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground mb-3">No experiences yet for this property.</p>
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            <Plus size={14} className="mr-1" /> Add the first one
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((exp) => (
            <Card key={exp.id} className="p-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                {exp.cover_image ? (
                  <img src={exp.cover_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="grid place-items-center h-full text-muted-foreground/50"><ImageIcon size={16} /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate text-sm">{exp.title}</p>
                  {!exp.is_active && <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
                  <span className="inline-flex items-center gap-1"><Calendar size={10} />{format(parseISO(exp.scheduled_at), "MMM d, HH:mm")}</span>
                  <span className="inline-flex items-center gap-1"><Users size={10} />{exp.capacity}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={10} />{exp.duration_minutes}m</span>
                  <span>· {exp.price_per_person} {exp.currency}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Switch checked={exp.is_active} onCheckedChange={() => toggleActive(exp)} />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(exp)}>
                  <Pencil size={12} />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(exp)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <ExperienceEditorDialog
          partnerId={partnerId}
          brandColor={brandColor}
          experience={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function ExperienceEditorDialog({
  partnerId,
  brandColor,
  experience,
  onClose,
  onSaved,
}: {
  partnerId: string;
  brandColor: string;
  experience: PartnerExperience | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !experience;
  const [form, setForm] = useState({
    title: experience?.title || "",
    slug: experience?.slug || "",
    subtitle: experience?.subtitle || "",
    description: experience?.description || "",
    cover_image: experience?.cover_image || "",
    category: experience?.category || "in-hotel",
    audience: experience?.audience || "all",
    difficulty: experience?.difficulty || "easy",
    capacity: experience?.capacity ?? 8,
    location: experience?.location || "",
    scheduled_at: experience?.scheduled_at
      ? format(parseISO(experience.scheduled_at), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"),
    duration_minutes: experience?.duration_minutes ?? 90,
    price_per_person: experience?.price_per_person ?? 0,
    currency: experience?.currency || "MAD",
    is_active: experience?.is_active ?? true,
    sort_order: experience?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const path = `partners/${partnerId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: false });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_image: data.publicUrl }));
    setUploading(false);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      partner_id: partnerId,
      slug: form.slug || `${slugify(form.title)}-${Date.now().toString(36)}`,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      capacity: Number(form.capacity),
      duration_minutes: Number(form.duration_minutes),
      price_per_person: Number(form.price_per_person),
      sort_order: Number(form.sort_order),
    };
    const { error } = isNew
      ? await supabase.from("sofitel_experiences").insert(payload as any)
      : await supabase.from("sofitel_experiences").update(payload as any).eq("id", experience!.id);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: isNew ? "Created" : "Saved" });
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "New experience" : "Edit experience"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Category</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="in-hotel">In-property</option>
                <option value="excursion">Excursion</option>
                <option value="outdoor">Outdoor</option>
                <option value="cultural">Cultural</option>
                <option value="signature">Signature</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="sm:col-span-2">
              <Label>Cover image</Label>
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  {form.cover_image
                    ? <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
                    : <div className="grid place-items-center h-full text-muted-foreground/50"><ImageIcon size={18} /></div>}
                </div>
                <div className="flex-1 space-y-2">
                  <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="Image URL" />
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg cursor-pointer border border-input hover:bg-muted">
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                    Upload
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label>Scheduled at</Label>
              <Input type="datetime-local" required value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>

            <div>
              <Label>Capacity</Label>
              <Input type="number" min={1} value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" min={15} step={15} value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Price / person</Label>
              <Input type="number" min={0} value={form.price_per_person}
                onChange={(e) => setForm({ ...form, price_per_person: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Currency</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option>MAD</option><option>EUR</option><option>USD</option>
              </select>
            </div>

            <div>
              <Label>Audience</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">All</option>
                <option value="adults">Adults</option>
                <option value="kids">Kids</option>
                <option value="couples">Couples</option>
                <option value="family">Family</option>
              </select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <Label>Sort order</Label>
              <Input type="number" value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div className="flex items-end gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label className="mb-2">{form.is_active ? "Active" : "Hidden"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving} style={{ background: brandColor }}>
              {saving && <Loader2 size={12} className="mr-1 animate-spin" />}
              {isNew ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
