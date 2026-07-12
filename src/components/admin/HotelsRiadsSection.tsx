import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotelPartners, type HotelPartner, type HotelPartnerPerk } from "@/hooks/use-hotel-partners";
import { PartnerPerformancePanel } from "./PartnerPerformancePanel";
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

import { PartnerStaffTab } from "@/components/admin/PartnerStaffTab";
import { PartnerQRDialog } from "@/components/partner/PartnerQRDialog";
import { toast } from "@/hooks/use-toast";
import { Plus, ExternalLink, QrCode, LayoutDashboard, Pencil, Hotel, Trash2, Copy, Globe, Image as ImageIcon, Loader2, Upload, BedDouble, Percent, Star, ChevronDown } from "lucide-react";

const DEFAULT_PERKS: HotelPartnerPerk[] = [
  { key: "landing", enabled: true, label: "Custom landing page" },
  { key: "qr", enabled: true, label: "In-room QR check-in" },
  { key: "calendar", enabled: true, label: "Shared group calendar" },
  { key: "revenue", enabled: true, label: "Revenue share / commission" },
  { key: "concierge", enabled: true, label: "Concierge dashboard" },
  { key: "transport", enabled: false, label: "Guest transport coordination" },
];

const PARTNERSHIP_STATUSES = [
  { value: "prospect", label: "Prospect" },
  { value: "negotiating", label: "Negotiating" },
  { value: "active", label: "Active partner" },
  { value: "paused", label: "Paused" },
  { value: "ended", label: "Ended" },
];

const BOOKING_CHANNELS = [
  { value: "concierge", label: "Concierge desk" },
  { value: "qr", label: "In-room QR" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "website", label: "Direct website" },
  { value: "mixed", label: "Mixed" },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type NewPartnerForm = {
  name: string;
  slug: string;
  type: string;
  city: string;
  address: string;
  brand_color: string;
  logo_url: string;
  rooms_count: string;
  stars: string;
  qr_codes_installed: string;
  commission_rate: string;
  commission_notes: string;
  partnership_status: string;
  booking_channel: string;
};

const EMPTY_NEW: NewPartnerForm = {
  name: "", slug: "", type: "riad", city: "", address: "",
  brand_color: "#c4654a", logo_url: "",
  rooms_count: "", stars: "", qr_codes_installed: "0",
  commission_rate: "", commission_notes: "",
  partnership_status: "prospect", booking_channel: "concierge",
};

export function HotelsRiadsSection() {
  const navigate = useNavigate();
  const { partners, loading, refresh } = useHotelPartners();
  const [createOpen, setCreateOpen] = useState(false);
  const [qrPartner, setQrPartner] = useState<HotelPartner | null>(null);
  const [editing, setEditing] = useState<HotelPartner | null>(null);
  const [newPartner, setNewPartner] = useState<NewPartnerForm>(EMPTY_NEW);
  const [uploadingNewLogo, setUploadingNewLogo] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const uploadNewLogo = async (file: File) => {
    setUploadingNewLogo(true);
    const path = `partners/_new/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: false });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); setUploadingNewLogo(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setNewPartner((p) => ({ ...p, logo_url: data.publicUrl }));
    setUploadingNewLogo(false);
  };

  const handleCreate = async () => {
    const slug = newPartner.slug || slugify(newPartner.name);
    if (!newPartner.name || !slug) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const payload: any = {
      name: newPartner.name,
      slug,
      type: newPartner.type,
      city: newPartner.city || null,
      address: newPartner.address || null,
      brand_color: newPartner.brand_color,
      logo_url: newPartner.logo_url || null,
      rooms_count: newPartner.rooms_count ? Number(newPartner.rooms_count) : null,
      stars: newPartner.stars ? Number(newPartner.stars) : null,
      qr_codes_installed: newPartner.qr_codes_installed ? Number(newPartner.qr_codes_installed) : 0,
      commission_rate: newPartner.commission_rate ? Number(newPartner.commission_rate) : null,
      commission_notes: newPartner.commission_notes || null,
      partnership_status: newPartner.partnership_status,
      booking_channel: newPartner.booking_channel,
      perks: DEFAULT_PERKS,
    };
    const { error } = await (supabase as any).from("hotel_partners").insert(payload);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Property created" });
    setCreateOpen(false);
    setNewPartner(EMPTY_NEW);
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

      <PartnerPerformancePanel partners={partners.map((p) => ({ id: p.id, name: p.name, brand_color: p.brand_color, commission_rate: (p as any).commission_rate ?? null }))} />

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
            const publicUrl = `${window.location.origin}/${p.slug}`;
            return (
              <Card key={p.id} className="p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: p.brand_color }} />
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-semibold truncate">{p.name}</h3>
                      {!p.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                      {p.partnership_status && p.partnership_status !== "active" && (
                        <Badge variant="outline" className="text-[10px] capitalize">{p.partnership_status}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {p.type}{p.city ? ` · ${p.city}` : ""}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden grid place-items-center text-white font-bold text-xs"
                    style={{ background: p.brand_color }}>
                    {p.logo_url
                      ? <img src={p.logo_url} alt="" className="w-full h-full object-cover" />
                      : p.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                {expandedIds.has(p.id) && (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/60 px-2 py-1.5">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center justify-center gap-1"><BedDouble size={10}/> Rooms</div>
                        <div className="text-sm font-semibold">{p.rooms_count ?? "—"}</div>
                      </div>
                      <div className="rounded-lg bg-muted/60 px-2 py-1.5">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center justify-center gap-1"><QrCode size={10}/> QRs</div>
                        <div className="text-sm font-semibold">{p.qr_codes_installed ?? 0}</div>
                      </div>
                      <div className="rounded-lg bg-muted/60 px-2 py-1.5">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center justify-center gap-1"><Percent size={10}/> Commission</div>
                        <div className="text-sm font-semibold">{p.commission_rate != null ? `${p.commission_rate}%` : "—"}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(p.perks || []).filter((x) => x.enabled).slice(0, 3).map((perk) => (
                        <span key={perk.key} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {perk.label}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => toggleExpanded(p.id)}
                  className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition py-1"
                >
                  {expandedIds.has(p.id) ? "Less info" : "More info"}
                  <ChevronDown size={12} className={`transition-transform ${expandedIds.has(p.id) ? "rotate-180" : ""}`} />
                </button>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button size="sm" variant="outline" className="rounded-lg justify-start text-xs" onClick={() => window.open(publicUrl, "_blank")}>
                    <Globe size={12} className="mr-1.5" /> Landing
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg justify-start text-xs" onClick={() => setQrPartner(p)}>
                    <QrCode size={12} className="mr-1.5" /> QR code
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg justify-start text-xs" onClick={() => window.open(`/partners/${p.slug}/concierge`, "_blank")}>
                    <LayoutDashboard size={12} className="mr-1.5" /> Concierge
                  </Button>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New property</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <section className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Identity</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Property name *</Label>
                  <Input value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="Riad Yasmine" />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
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
                    <option value="guesthouse">Guesthouse</option>
                  </select>
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={newPartner.city} onChange={(e) => setNewPartner({ ...newPartner, city: e.target.value })} placeholder="Tetouan" />
                </div>
                <div className="col-span-2">
                  <Label>Full address</Label>
                  <Input value={newPartner.address} onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })} placeholder="Av. des FAR, Tetouan" />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Branding</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Brand color</Label>
                  <Input type="color" value={newPartner.brand_color}
                    onChange={(e) => setNewPartner({ ...newPartner, brand_color: e.target.value })} className="h-10 p-1" />
                </div>
                <div>
                  <Label>Logo</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0 grid place-items-center">
                      {newPartner.logo_url
                        ? <img src={newPartner.logo_url} alt="" className="w-full h-full object-cover" />
                        : <ImageIcon size={14} className="text-muted-foreground/50" />}
                    </div>
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg cursor-pointer border border-input hover:bg-muted">
                      {uploadingNewLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Upload
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => e.target.files?.[0] && uploadNewLogo(e.target.files[0])} />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Operations</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Rooms</Label>
                  <Input type="number" min={0} value={newPartner.rooms_count}
                    onChange={(e) => setNewPartner({ ...newPartner, rooms_count: e.target.value })} placeholder="42" />
                </div>
                <div>
                  <Label>QR codes installed</Label>
                  <Input type="number" min={0} value={newPartner.qr_codes_installed}
                    onChange={(e) => setNewPartner({ ...newPartner, qr_codes_installed: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <Label>Booking channel</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={newPartner.booking_channel}
                    onChange={(e) => setNewPartner({ ...newPartner, booking_channel: e.target.value })}>
                    {BOOKING_CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Commercial</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Commission % agreed</Label>
                  <Input type="number" min={0} max={100} step="0.5" value={newPartner.commission_rate}
                    onChange={(e) => setNewPartner({ ...newPartner, commission_rate: e.target.value })} placeholder="15" />
                </div>
                <div>
                  <Label>Partnership status</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={newPartner.partnership_status}
                    onChange={(e) => setNewPartner({ ...newPartner, partnership_status: e.target.value })}>
                    {PARTNERSHIP_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label>Commission notes</Label>
                  <Textarea rows={2} value={newPartner.commission_notes}
                    onChange={(e) => setNewPartner({ ...newPartner, commission_notes: e.target.value })}
                    placeholder="e.g. 15% on workshops, 10% on retreats, invoiced monthly" />
                </div>
              </div>
            </section>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit sheet */}
      {editing && (
        <PartnerEditor partner={editing} onClose={() => { setEditing(null); refresh(); }} />
      )}

      <PartnerQRDialog open={!!qrPartner} onOpenChange={(v) => !v && setQrPartner(null)} partner={qrPartner} />
    </div>
  );
}

function PartnerEditor({ partner, onClose }: { partner: HotelPartner; onClose: () => void }) {
  const [form, setForm] = useState<HotelPartner>(partner);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const uploadImage = async (file: File, field: "logo_url" | "cover_image") => {
    const setBusy = field === "logo_url" ? setUploadingLogo : setUploadingCover;
    setBusy(true);
    const path = `partners/${partner.id}/${field}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: false });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); setBusy(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setForm((f) => ({ ...f, [field]: data.publicUrl } as HotelPartner));
    setBusy(false);
  };

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
      address: form.address,
      stars: form.stars,
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
      rooms_count: form.rooms_count,
      qr_codes_installed: form.qr_codes_installed,
      commission_rate: form.commission_rate,
      commission_notes: form.commission_notes,
      partnership_status: form.partnership_status,
      partnership_started_on: form.partnership_started_on,
      booking_channel: form.booking_channel,
      internal_notes: form.internal_notes,
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

        <Tabs defaultValue="branding" className="mt-5">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-5 mt-5">
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
                  <option value="guesthouse">Guesthouse</option>
                </select>
              </div>
              <div><Label>Brand color</Label><Input type="color" value={form.brand_color} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} className="h-10 p-1" /></div>

              <div className="col-span-2">
                <Label>Logo</Label>
                <div className="flex items-start gap-3 mt-1">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 grid place-items-center">
                    {form.logo_url
                      ? <img src={form.logo_url} alt="" className="w-full h-full object-cover" />
                      : <ImageIcon size={18} className="text-muted-foreground/50" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input value={form.logo_url || ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://... or upload below" />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg cursor-pointer border border-input hover:bg-muted w-fit">
                      {uploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Upload logo
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "logo_url")} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <Label>Cover image</Label>
                <div className="flex items-start gap-3 mt-1">
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted shrink-0 grid place-items-center">
                    {form.cover_image
                      ? <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
                      : <ImageIcon size={18} className="text-muted-foreground/50" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input value={form.cover_image || ""} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://... or upload below" />
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg cursor-pointer border border-input hover:bg-muted w-fit">
                      {uploadingCover ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Upload cover
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "cover_image")} />
                    </label>
                  </div>
                </div>
              </div>
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
          </TabsContent>

          <TabsContent value="operations" className="space-y-5 mt-5">
            <section className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Property facts</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Rooms</Label>
                  <Input type="number" min={0} value={form.rooms_count ?? ""} onChange={(e) => setForm({ ...form, rooms_count: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <Label>Star rating</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.stars ?? ""} onChange={(e) => setForm({ ...form, stars: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">—</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2"><QrCode size={12} /> Distribution</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>QR codes installed</Label>
                  <Input type="number" min={0} value={form.qr_codes_installed ?? 0} onChange={(e) => setForm({ ...form, qr_codes_installed: e.target.value ? Number(e.target.value) : 0 })} />
                  <p className="text-[10px] text-muted-foreground mt-1">Track how many physical QR cards/standees you've delivered.</p>
                </div>
                <div>
                  <Label>Primary booking channel</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.booking_channel || "concierge"} onChange={(e) => setForm({ ...form, booking_channel: e.target.value })}>
                    {BOOKING_CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2"><Percent size={12}/> Commercial</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Commission % agreed</Label>
                  <Input type="number" min={0} max={100} step="0.5" value={form.commission_rate ?? ""} onChange={(e) => setForm({ ...form, commission_rate: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <Label>Partnership status</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.partnership_status || "prospect"} onChange={(e) => setForm({ ...form, partnership_status: e.target.value })}>
                    {PARTNERSHIP_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Partnership start date</Label>
                  <Input type="date" value={form.partnership_started_on || ""} onChange={(e) => setForm({ ...form, partnership_started_on: e.target.value || null })} />
                </div>
                <div className="col-span-2">
                  <Label>Commission terms / notes</Label>
                  <Textarea rows={3} value={form.commission_notes || ""} onChange={(e) => setForm({ ...form, commission_notes: e.target.value })}
                    placeholder="e.g. 15% on workshops, 10% on retreats, invoiced monthly on net total" />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Internal notes</h4>
              <Textarea rows={4} value={form.internal_notes || ""} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                placeholder="Key contacts, concierge names, delivery schedules, anything the team should know." />
            </section>
          </TabsContent>

          <TabsContent value="staff" className="mt-5">
            <PartnerStaffTab partnerId={partner.id} brandColor={form.brand_color} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-5 mt-5 border-t border-border/40">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
