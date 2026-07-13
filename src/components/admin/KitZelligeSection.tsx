import { useMemo, useState } from "react";
import { useZelligeKitItems } from "@/hooks/use-zellige-kit-items";
import { useZelligeCollections, type ZelligeCollection } from "@/hooks/use-zellige-collections";
import { useKitZelligeSettings } from "@/hooks/use-kit-zellige-settings";
import { Loader2, Palette, Shapes, Sparkles, Plus, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * Admin controls for the Kit Zellige preview: toggle which pieces (regions),
 * palette colors, and named collections shown to visitors. Also toggles the
 * "Customize your own" tab visibility.
 */
export function KitZelligeSection() {
  const { byKind, loading, setAvailable } = useZelligeKitItems();
  const { items: collections, loading: colLoading, create, update, remove } = useZelligeCollections();
  const { customizeEnabled, setCustomize } = useKitZelligeSettings();

  const pieces = useMemo(() => byKind("piece"), [byKind]);
  const availableColors = useMemo(() => byKind("color").filter((c) => c.is_available), [byKind]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 size={18} className="animate-spin mr-2" /> Loading kit items…
      </div>
    );
  }

  const groups: { kind: "piece" | "color"; title: string; description: string; icon: any }[] = [
    { kind: "piece", title: "Pieces", description: "Zones of the motif customers can recolor.", icon: Shapes },
    { kind: "color", title: "Colors", description: "Palette swatches available across all collections.", icon: Palette },
  ];

  return (
    <div className="space-y-8">
      {/* Header + customize toggle */}
      <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-bold text-foreground">Kit Zellige</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Manage the public Kit Zellige page: which pieces/colors are enabled, the ready collections customers can buy,
            and whether the "Customize your own" tab is visible.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border/40">
          <div>
            <p className="text-sm font-semibold text-foreground">Customize tab visible</p>
            <p className="text-[11px] text-muted-foreground">Off = only ready collections are shown.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={customizeEnabled}
            onClick={() => setCustomize(!customizeEnabled)}
            className={cn("relative w-11 h-6 rounded-full transition flex-shrink-0", customizeEnabled ? "bg-cta" : "bg-muted")}
          >
            <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", customizeEnabled ? "translate-x-[22px]" : "translate-x-0.5")} />
          </button>
        </div>
      </div>

      {/* Pieces & Colors availability */}
      {groups.map(({ kind, title, description, icon: Icon }) => {
        const list = byKind(kind);
        const activeCount = list.filter((i) => i.is_available).length;
        return (
          <section key={kind} className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cta/10 border border-cta/20 flex items-center justify-center">
                  <Icon size={18} className="text-cta" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {activeCount} / {list.length} active
              </span>
            </header>

            <div className={cn(
              "p-4 grid gap-2",
              kind === "color" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}>
              {list.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
                    item.is_available ? "border-border/60 bg-background" : "border-dashed border-border/40 bg-muted/20 opacity-70"
                  )}
                >
                  <span
                    className="w-8 h-8 rounded-lg border border-border/60 flex-shrink-0"
                    style={{ background: item.key }}
                    title={item.key}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{item.label || item.key}</p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">{item.key}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.is_available}
                    onClick={() => setAvailable(item.id, !item.is_available)}
                    className={cn("relative w-10 h-6 rounded-full transition flex-shrink-0", item.is_available ? "bg-cta" : "bg-muted")}
                  >
                    <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", item.is_available ? "translate-x-[18px]" : "translate-x-0.5")} />
                  </button>
                </div>
              ))}
              {list.length === 0 && (
                <p className="text-sm text-muted-foreground italic col-span-full">No {title.toLowerCase()} yet.</p>
              )}
            </div>
          </section>
        );
      })}

      {/* Collections CRUD */}
      <section className="rounded-2xl border border-border/40 bg-card overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cta/10 border border-cta/20 flex items-center justify-center">
              <Sparkles size={18} className="text-cta" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Ready Collections</h3>
              <p className="text-xs text-muted-foreground">Named colorways customers can buy from the store. Only published ones appear publicly.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="cta"
            onClick={() =>
              create({
                name: "New collection",
                slug: `col-${Date.now().toString(36)}`,
                colors: Object.fromEntries(pieces.map((p, i) => [p.key, availableColors[i % Math.max(availableColors.length, 1)]?.key || "#B23A2E"])),
              })
            }
          >
            <Plus size={14} /> New
          </Button>
        </header>

        <div className="p-4 space-y-3">
          {colLoading ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading collections…</div>
          ) : collections.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No collections yet. Create one to launch.</p>
          ) : (
            collections.map((c) => (
              <CollectionRow
                key={c.id}
                collection={c}
                pieces={pieces.map((p) => ({ key: p.key, label: p.label || p.key }))}
                colors={availableColors.map((c) => ({ key: c.key, label: c.label || c.key }))}
                onSave={(patch) => update(c.id, patch)}
                onDelete={() => remove(c.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function CollectionRow({
  collection,
  pieces,
  colors,
  onSave,
  onDelete,
}: {
  collection: ZelligeCollection;
  pieces: { key: string; label: string }[];
  colors: { key: string; label: string }[];
  onSave: (patch: Partial<ZelligeCollection>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ZelligeCollection>(collection);
  const dirty = JSON.stringify(draft) !== JSON.stringify(collection);

  const setPieceColor = (pieceKey: string, colorHex: string) =>
    setDraft((d) => ({ ...d, colors: { ...d.colors, [pieceKey]: colorHex } }));

  return (
    <div className="rounded-xl border border-border/40 bg-background overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex gap-1">
          {pieces.slice(0, 5).map((p) => (
            <span key={p.key} className="w-6 h-6 rounded-md border border-border/60" style={{ background: draft.colors[p.key] || "#eee" }} />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{draft.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {draft.price} DH · stock {draft.stock} · {draft.is_published ? "published" : "draft"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSave({ is_published: !collection.is_published })}
          title={collection.is_published ? "Unpublish" : "Publish"}
          className={cn(
            "w-9 h-9 rounded-lg border flex items-center justify-center transition-colors",
            collection.is_published ? "border-cta/40 bg-cta/10 text-cta" : "border-border/60 text-muted-foreground hover:text-foreground"
          )}
        >
          {collection.is_published ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Edit"}
        </Button>
      </div>

      {open && (
        <div className="p-4 border-t border-border/40 bg-muted/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Slug (URL-safe id)</Label>
              <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Price (MAD)</Label>
              <Input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Stock</Label>
              <Input type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Cover image URL (optional)</Label>
              <Input value={draft.image_url || ""} onChange={(e) => setDraft({ ...draft, image_url: e.target.value || null })} placeholder="https://…" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest">Colors per piece</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pieces.map((p) => (
                <div key={p.key} className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-card">
                  <span className="w-6 h-6 rounded-md border border-border/60" style={{ background: draft.colors[p.key] || "#eee" }} />
                  <span className="text-xs font-semibold text-foreground flex-1 truncate">{p.label}</span>
                  <select
                    value={draft.colors[p.key] || ""}
                    onChange={(e) => setPieceColor(p.key, e.target.value)}
                    className="text-xs rounded-md border border-border/60 bg-background px-2 py-1"
                  >
                    <option value="">—</option>
                    {colors.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 size={14} /> Delete
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setDraft(collection)} disabled={!dirty}>
                <X size={14} /> Reset
              </Button>
              <Button variant="cta" size="sm" disabled={!dirty} onClick={() => onSave(draft)}>
                <Save size={14} /> Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
