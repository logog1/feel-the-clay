import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotelPartners, type HotelPartner, type HotelPartnerPerk } from "@/hooks/use-hotel-partners";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PartnerExperiencesTab } from "@/components/admin/PartnerExperiencesTab";
import { toast } from "@/hooks/use-toast";
import { Plus, ExternalLink, QrCode, LayoutDashboard, Pencil, Hotel, Trash2, Copy, Globe } from "lucide-react";

const DEFAULT_PERKS: HotelPartnerPerk[] = [
  { key: "landing", enabled: true, label: "Custom landing page" },
  { key: "qr", enabled: true, label: "In-room QR check-in" },
  { key: "calendar", enabled: true, label: "Shared group calendar" },
  { key: "revenue", enabled: true, label: "Revenue share / commission" },
  { key: "concierge", enabled: true, label: "Concierge dashboard" },
  { key: "transport", enabled: false, label: "Guest transport coordination" },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function HotelsRiadsSection() {
  const navigate = useNavigate();
  const { partners, loading, refresh } = useHotelPartners();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<HotelPartner | null>(null);

  const [newPartner, setNewPartner] = useState({
    name: "",
    slug: "",
    type: "riad",
    city: "",
    brand_color: "#c4654a",
  });

  const handleCreate = async () => {
    const slug = newPartner.slug || slugify(newPartner.name);
    if (!newPartner.name || !slug) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const { error } = await (supabase as any).from("hotel_partners").insert({
      name: newPartner.name,
      slug,
      type: newPartner.type,
      city: newPartner.city || null,
      brand_color: newPartner.brand_color,
      perks: DEFAULT_PERKS,
    });
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Property created" });
    setCreateOpen(false);
    setNewPartner({ name: "", slug: "", type: "riad", city: "", brand_color: "#c4654a" });
    refresh();
  };

  const handleDelete = async (p: HotelPartner) => {
    if (!confirm(`Delete property "${p.name}"? This cannot be undone.`)) return;
    const { error } = await (supabase as any).from("hotel_partners").delete().eq("id", p.id);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    refresh();
  };

  const toggleActive = async (p: HotelPartner) => {
    await (supabase as any).from("hotel_partners").update({ is_active: !p.is_active }).eq("id", p.id);
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2"><Hotel size={22} /> Hotels & Riads</h2>
          <p className="text-sm text-muted-foreground">
            Create a branded landing page, QR check-in, and concierge dashboard for each partner property.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="rounded-xl">
          <Plus size={16} className="mr-1.5" /> New property
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : partners.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Hotel className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No partner properties yet.</p>
          <Button onClick={() => setCreateOpen(true)} variant="outline" className="rounded-xl">
            <Plus size={16} className="mr-1.5" /> Add your first riad or hotel
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => {
            const publicUrl = `${window.location.origin}/partners/${p.slug}`;
            const qrUrl = `${window.location.origin}/partners/${p.slug}/qr`;
            return (
              <Card key={p.id} className="p-5 space-y-3 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: p.brand_color }}
                />
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold truncate">{p.name}</h3>
                      {!p.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {p.type}{p.city ? ` · ${p.city}` : ""}
                    </p>
                  </div>
                  <div
                    className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: p.brand_color }}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(p.perks || []).filter((x) => x.enabled).slice(0, 4).map((perk) => (
                    <span key={perk.key} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {perk.label}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button size="sm" variant="outline" className="rounded-lg justify-start text-xs" onClick={() => window.open(publicUrl, "_blank")}>
                    <Globe size={12} className="mr-1.5" /> Landing
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg justify-start text-xs" onClick={() => window.open(qrUrl, "_blank")}>
                    <QrCode size={12} className="mr-1.5" /> QR page
                  </Button>
                  {p.slug === "sofitel" ? (
                    <>
                      <Button size="sm" variant="outline" className="rounded-lg justify-start text-xs" onClick={() => navigate("/sofitel/hotel")}>
                        <LayoutDashboard size={12} className="mr-1.5" /> Concierge
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg justify-start text-xs" onClick={() => navigate("/sofitel/admin")}>
                        <ExternalLink size={12} className="mr-1.5" /> Console
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-lg justify-start text-xs col-span-2" disabled>
                      <LayoutDashboard size={12} className="mr-1.5" /> Concierge (coming soon)
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Copy link"
                      onClick={() => { navigator.clipboard.writeText(publicUrl); toast({ title: "Link copied" }); }}>
                      <Copy size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(p)}>
                      <Pencil size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(p)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New property</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={newPartner.name}
                onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value, slug: slugify(e.target.value) })}
                placeholder="Riad Yasmine" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Slug</Label>
                <Input value={newPartner.slug} onChange={(e) => setNewPartner({ ...newPartner, slug: slugify(e.target.value) })} placeholder="riad-yasmine" />
              </div>
              <div>
                <Label>Type</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={newPartner.type}
                  onChange={(e) => setNewPartner({ ...newPartner, type: e.target.value })}>
                  <option value="riad">Riad</option>
                  <option value="hotel">Hotel</option>
                  <option value="boutique">Boutique stay</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input value={newPartner.city} onChange={(e) => setNewPartner({ ...newPartner, city: e.target.value })} placeholder="Tetouan" />
              </div>
              <div>
                <Label>Brand color</Label>
                <Input type="color" value={newPartner.brand_color}
                  onChange={(e) => setNewPartner({ ...newPartner, brand_color: e.target.value })} className="h-10 p-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit sheet */}
      {editing && (
        <PartnerEditor partner={editing} onClose={() => { setEditing(null); refresh(); }} />
      )}
    </div>
  );
}

function PartnerEditor({ partner, onClose }: { partner: HotelPartner; onClose: () => void }) {
  const [form, setForm] = useState<HotelPartner>(partner);
  const [saving, setSaving] = useState(false);

  const updatePerk = (i: number, patch: Partial<HotelPartnerPerk>) => {
    const next = [...(form.perks || [])];
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, perks: next });
  };
  const addPerk = () => setForm({ ...form, perks: [...(form.perks || []), { key: `perk-${Date.now()}`, enabled: true, label: "New advantage" }] });
  const removePerk = (i: number) => setForm({ ...form, perks: (form.perks || []).filter((_, idx) => idx !== i) });

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase as any).from("hotel_partners").update({
      name: form.name,
      type: form.type,
      city: form.city,
      brand_color: form.brand_color,
      logo_url: form.logo_url,
      cover_image: form.cover_image,
      intro_en: form.intro_en,
      intro_fr: form.intro_fr,
      intro_es: form.intro_es,
      intro_ar: form.intro_ar,
      contact_name: form.contact_name,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      whatsapp: form.whatsapp,
      website_url: form.website_url,
      perks: form.perks,
      is_active: form.is_active,
    }).eq("id", form.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved" });
    onClose();
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit · {partner.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-5">
          <section className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Identity</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>City</Label><Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div>
                <Label>Type</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="riad">Riad</option>
                  <option value="hotel">Hotel</option>
                  <option value="boutique">Boutique stay</option>
                </select>
              </div>
              <div><Label>Brand color</Label><Input type="color" value={form.brand_color} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} className="h-10 p-1" /></div>
              <div className="col-span-2"><Label>Logo URL</Label><Input value={form.logo_url || ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." /></div>
              <div className="col-span-2"><Label>Cover image URL</Label><Input value={form.cover_image || ""} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." /></div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Intro copy</h4>
            <div><Label>English</Label><Textarea rows={3} value={form.intro_en} onChange={(e) => setForm({ ...form, intro_en: e.target.value })} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label>French</Label><Textarea rows={3} value={form.intro_fr} onChange={(e) => setForm({ ...form, intro_fr: e.target.value })} /></div>
              <div><Label>Spanish</Label><Textarea rows={3} value={form.intro_es} onChange={(e) => setForm({ ...form, intro_es: e.target.value })} /></div>
              <div><Label>Arabic</Label><Textarea rows={3} value={form.intro_ar} onChange={(e) => setForm({ ...form, intro_ar: e.target.value })} dir="rtl" /></div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Contact</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact name</Label><Input value={form.contact_name || ""} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.contact_email || ""} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.contact_phone || ""} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
              <div><Label>WhatsApp</Label><Input value={form.whatsapp || ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="212704969534" /></div>
              <div className="col-span-2"><Label>Website</Label><Input value={form.website_url || ""} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Advantages & perks</h4>
              <Button size="sm" variant="outline" onClick={addPerk}><Plus size={12} className="mr-1" /> Add</Button>
            </div>
            <div className="space-y-2">
              {(form.perks || []).map((perk, i) => (
                <div key={perk.key + i} className="flex items-center gap-2 p-2 rounded-lg border border-border/40">
                  <Switch checked={perk.enabled} onCheckedChange={(v) => updatePerk(i, { enabled: v })} />
                  <Input value={perk.label} onChange={(e) => updatePerk(i, { label: e.target.value })} className="h-8 flex-1" />
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removePerk(i)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
