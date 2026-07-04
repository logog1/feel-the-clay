import { useZelligeKitItems } from "@/hooks/use-zellige-kit-items";
import { Loader2, Palette, Shapes, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin controls for the Kit Zellige preview: toggle which pieces (regions),
 * palette colors, and pre-made decorations (presets) are shown to visitors.
 */
export function KitZelligeSection() {
  const { byKind, loading, setAvailable } = useZelligeKitItems();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 size={18} className="animate-spin mr-2" /> Loading kit items…
      </div>
    );
  }

  const groups: { kind: "piece" | "color" | "preset"; title: string; description: string; icon: any }[] = [
    { kind: "piece", title: "Pieces", description: "Zones of the motif that customers can recolor.", icon: Shapes },
    { kind: "color", title: "Colors", description: "Palette swatches available in the customizer.", icon: Palette },
    { kind: "preset", title: "Decorations (pre-made models)", description: "Ready-made colorways shown in the Ready Models tab.", icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      <div className="p-5 rounded-2xl bg-muted/30 border border-border/40">
        <h2 className="font-bold text-foreground">Kit Zellige availability</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle any piece, color, or pre-made decoration on/off. Disabled items are hidden from the Kit Zellige page immediately.
        </p>
      </div>

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
              {list.map((item) => {
                const isColor = kind === "color" || kind === "piece";
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all",
                      item.is_available ? "border-border/60 bg-background" : "border-dashed border-border/40 bg-muted/20 opacity-70"
                    )}
                  >
                    {isColor && (
                      <span
                        className="w-8 h-8 rounded-lg border border-border/60 flex-shrink-0"
                        style={{ background: item.key }}
                        title={item.key}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{item.label || item.key}</p>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">{item.key}</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={item.is_available}
                        onChange={(e) => setAvailable(item.id, e.target.checked)}
                      />
                      <span className="w-10 h-6 rounded-full bg-muted peer-checked:bg-cta transition relative">
                        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition peer-checked:translate-x-4" />
                      </span>
                    </label>
                  </div>
                );
              })}
              {list.length === 0 && (
                <p className="text-sm text-muted-foreground italic col-span-full">No {title.toLowerCase()} yet.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
