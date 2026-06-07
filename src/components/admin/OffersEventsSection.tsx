import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHotelPartners, type HotelPartner } from "@/hooks/use-hotel-partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import {
  Plus, Pencil, Trash2, GripVertical, X, Calendar, Tag, Hotel, Sparkles, Upload, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OfferKind = "offer" | "event";
type CtaType = "book" | "whatsapp" | "link" | "none";

interface PartnerOffer {
  id: string;
  kind: OfferKind;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image: string | null;
  cta_type: CtaType;
  cta_value: string | null;
  cta_label: string | null;
  price: number | null;
  currency: string;
  starts_at: string | null;
  ends_at: string | null;
  event_at: string | null;
  capacity: number | null;
  tags: string[];
  is_active: boolean;
  sort_order: number;
}

interface Assignment {
  id: string;
  offer_id: string;
  partner_id: string;
  is_published: boolean;
  sort_order: number;
}

const blankOffer: Partial<PartnerOffer> = {
  kind: "offer",
  title: "",
  subtitle: "",
  description: "",
  cover_image: "",
  cta_type: "book",
  cta_value: "",
  cta_label: "",
  currency: "MAD",
  tags: [],
  is_active: true,
};

export function OffersEventsSection() {
  const { partners } = useHotelPartners();
  const [offers, setOffers] = useState<PartnerOffer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<PartnerOffer> | null>(null);
  const [dragOffer, setDragOffer] = useState<PartnerOffer | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const refresh = useCallback(async () => {
    setLoading(true);
    const [o, a] = await Promise.all([
      (supabase as any).from("partner_offers").select("*").order("sort_order").order("created_at", { ascending: false }),
      (supabase as any).from("partner_offer_assignments").select("*").order("sort_order"),
    ]);
    setOffers((o.data || []) as PartnerOffer[]);
    setAssignments((a.data || []) as Assignment[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const saveOffer = async () => {
    if (!editing?.title?.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const payload: any = { ...editing, tags: editing.tags || [] };
    Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });

    const { error } = editing.id
      ? await (supabase as any).from("partner_offers").update(payload).eq("id", editing.id)
      : await (supabase as any).from("partner_offers").insert(payload);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing.id ? "Offer updated" : "Offer created" });
    setDialogOpen(false);
    setEditing(null);
    refresh();
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Delete this offer and remove it from every hotel it is assigned to?")) return;
    const { error } = await (supabase as any).from("partner_offers").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Offer deleted" });
    refresh();
  };

  const assignOffer = async (offerId: string, partnerId: string) => {
    if (assignments.some((a) => a.offer_id === offerId && a.partner_id === partnerId)) {
      toast({ title: "Already assigned to this property" });
      return;
    }
    const partnerAssignments = assignments.filter((a) => a.partner_id === partnerId);
    const { error } = await (supabase as any).from("partner_offer_assignments").insert({
      offer_id: offerId,
      partner_id: partnerId,
      is_published: true,
      sort_order: partnerAssignments.length,
    });
    if (error) {
      toast({ title: "Assignment failed", description: error.message, variant: "destructive" });
      return;
    }
    refresh();
  };

  const unassign = async (assignmentId: string) => {
    const { error } = await (supabase as any).from("partner_offer_assignments").delete().eq("id", assignmentId);
    if (error) {
      toast({ title: "Removal failed", description: error.message, variant: "destructive" });
      return;
    }
    refresh();
  };

  const togglePublish = async (assignmentId: string, current: boolean) => {
    const { error } = await (supabase as any)
      .from("partner_offer_assignments")
      .update({ is_published: !current })
      .eq("id", assignmentId);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    refresh();
  };

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `offers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploadingCover(false);
      return;
    }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setEditing((p) => ({ ...(p || {}), cover_image: data.publicUrl }));
    setUploadingCover(false);
  };

  const handleDragStart = (e: DragStartEvent) => {
    const o = offers.find((x) => x.id === e.active.id);
    if (o) setDragOffer(o);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setDragOffer(null);
    if (e.over && e.active.id !== e.over.id) {
      assignOffer(String(e.active.id), String(e.over.id));
    }
  };

  const openCreate = (kind: OfferKind = "offer") => {
    setEditing({ ...blankOffer, kind });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Offers &amp; Events</h2>
          <p className="text-sm text-muted-foreground">
            Create once on the left. Drag onto any hotel on the right to publish it on that partner landing page.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCreate("event")} className="gap-2">
            <Calendar size={16} /> New event
          </Button>
          <Button onClick={() => openCreate("offer")} className="gap-2">
            <Plus size={16} /> New offer
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* LIBRARY */}
          <aside className="bg-card border border-border rounded-2xl p-4 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-card pb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles size={14} className="text-primary" /> Library ({offers.length})
              </h3>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : offers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No offers yet. Create one to get started.</p>
            ) : (
              offers.map((o) => (
                <OfferCard
                  key={o.id}
                  offer={o}
                  assignedCount={assignments.filter((a) => a.offer_id === o.id).length}
                  onEdit={() => { setEditing(o); setDialogOpen(true); }}
                  onDelete={() => deleteOffer(o.id)}
                />
              ))
            )}
          </aside>

          {/* HOTELS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
            {partners.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">No hotels or riads yet. Add a property first.</p>
            ) : (
              partners.map((p) => (
                <PartnerDropCard
                  key={p.id}
                  partner={p}
                  assignments={assignments.filter((a) => a.partner_id === p.id)}
                  offers={offers}
                  onUnassign={unassign}
                  onTogglePublish={togglePublish}
                />
              ))
            )}
          </div>
        </div>

        <DragOverlay>
          {dragOffer ? (
            <div className="bg-card border-2 border-primary rounded-xl p-3 shadow-2xl w-[300px] rotate-2">
              <p className="text-sm font-semibold truncate">{dragOffer.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{dragOffer.kind}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "New"} {editing?.kind === "event" ? "event" : "offer"}</DialogTitle>
            <DialogDescription>This template can be reused across many hotels and riads.</DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Kind</Label>
                  <Select value={editing.kind} onValueChange={(v: OfferKind) => setEditing({ ...editing, kind: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offer">Offer (ongoing)</SelectItem>
                      <SelectItem value="event">Event (dated)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-6">
                  <Label htmlFor="active">Active</Label>
                  <Switch
                    id="active"
                    checked={!!editing.is_active}
                    onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                  />
                </div>
              </div>

              <div>
                <Label>Title *</Label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>

              <div>
                <Label>Subtitle</Label>
                <Input value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>

              <div>
                <Label>Cover image</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="https://… or upload"
                    value={editing.cover_image || ""}
                    onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })}
                  />
                  <label className="inline-flex items-center gap-1 px-3 py-2 border rounded-md cursor-pointer text-xs hover:bg-muted">
                    <Upload size={14} />
                    {uploadingCover ? "…" : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
                    />
                  </label>
                </div>
                {editing.cover_image && (
                  <img src={editing.cover_image} alt="" className="mt-2 rounded-lg h-28 object-cover" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={editing.price ?? ""}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={editing.currency || "MAD"} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={editing.capacity ?? ""}
                    onChange={(e) => setEditing({ ...editing, capacity: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>

              {editing.kind === "event" ? (
                <div>
                  <Label>Event date &amp; time</Label>
                  <Input
                    type="datetime-local"
                    value={editing.event_at ? editing.event_at.slice(0, 16) : ""}
                    onChange={(e) => setEditing({ ...editing, event_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valid from</Label>
                    <Input
                      type="datetime-local"
                      value={editing.starts_at ? editing.starts_at.slice(0, 16) : ""}
                      onChange={(e) => setEditing({ ...editing, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                  <div>
                    <Label>Valid until</Label>
                    <Input
                      type="datetime-local"
                      value={editing.ends_at ? editing.ends_at.slice(0, 16) : ""}
                      onChange={(e) => setEditing({ ...editing, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>CTA type</Label>
                  <Select value={editing.cta_type} onValueChange={(v: CtaType) => setEditing({ ...editing, cta_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Book a workshop</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="link">External link</SelectItem>
                      <SelectItem value="none">No button</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>CTA value (phone or URL)</Label>
                  <Input
                    value={editing.cta_value || ""}
                    placeholder={editing.cta_type === "whatsapp" ? "+212600000000" : "https://…"}
                    onChange={(e) => setEditing({ ...editing, cta_value: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>CTA label (optional)</Label>
                <Input
                  value={editing.cta_label || ""}
                  placeholder={editing.kind === "event" ? "Reserve a spot" : "Claim the offer"}
                  onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })}
                />
              </div>

              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={(editing.tags || []).join(", ")}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveOffer}>{editing?.id ? "Save changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferCard({
  offer, assignedCount, onEdit, onDelete,
}: { offer: PartnerOffer; assignedCount: number; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: offer.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border border-border rounded-xl p-3 bg-background hover:border-primary/40 transition group",
        isDragging && "opacity-30",
      )}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pt-1 text-muted-foreground hover:text-foreground">
          <GripVertical size={16} />
        </button>
        {offer.cover_image && (
          <img src={offer.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge variant={offer.kind === "event" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
              {offer.kind}
            </Badge>
            {!offer.is_active && <Badge variant="outline" className="text-[10px] px-1.5 py-0">draft</Badge>}
          </div>
          <p className="text-sm font-semibold truncate">{offer.title}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Hotel size={11} /> {assignedCount} hotel{assignedCount === 1 ? "" : "s"}
            {offer.price != null && <span>· {offer.price} {offer.currency}</span>}
          </p>
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
          <button onClick={onEdit} className="text-muted-foreground hover:text-foreground p-1"><Pencil size={13} /></button>
          <button onClick={onDelete} className="text-muted-foreground hover:text-destructive p-1"><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}

function PartnerDropCard({
  partner, assignments, offers, onUnassign, onTogglePublish,
}: {
  partner: HotelPartner;
  assignments: Assignment[];
  offers: PartnerOffer[];
  onUnassign: (id: string) => void;
  onTogglePublish: (id: string, current: boolean) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: partner.id });
  const items = assignments
    .map((a) => ({ a, offer: offers.find((o) => o.id === a.offer_id) }))
    .filter((x) => x.offer);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-card border-2 rounded-2xl p-4 transition min-h-[180px]",
        isOver ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {partner.logo_url ? (
          <img src={partner.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: partner.brand_color, color: "#fff" }}>
            {partner.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{partner.name}</p>
          <p className="text-[11px] text-muted-foreground capitalize">{partner.type} · {partner.city || "—"}</p>
        </div>
        <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6 border-2 border-dashed border-border/50 rounded-lg">
          Drop offers here
        </p>
      ) : (
        <div className="space-y-1.5">
          {items.map(({ a, offer }) => (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 group text-xs",
                !a.is_published && "opacity-50",
              )}
            >
              <Badge variant={offer!.kind === "event" ? "default" : "secondary"} className="text-[9px] px-1 py-0">
                {offer!.kind === "event" ? "E" : "O"}
              </Badge>
              <span className="truncate flex-1">{offer!.title}</span>
              <button
                onClick={() => onTogglePublish(a.id, a.is_published)}
                title={a.is_published ? "Unpublish" : "Publish"}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
              >
                {a.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <button
                onClick={() => onUnassign(a.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
