import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, CheckCircle2, Palette, Sparkles, PanelTop, Eye } from "lucide-react";
import { toast } from "sonner";
import { SEASONAL_THEMES, type ThemeConfig } from "@/components/SeasonalTheme";

const defaultConfig = (id: string): ThemeConfig => ({
  id,
  name: SEASONAL_THEMES[id]?.name || id,
  active: false,
  showBanner: true,
  showOverlay: true,
  showColors: false,
  bannerText: SEASONAL_THEMES[id]?.bannerText || "",
  bannerEmoji: SEASONAL_THEMES[id]?.bannerEmoji || "",
});

export function ThemeManagerSection() {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig("ramadan"));
  const [saving, setSaving] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "seasonal_theme").maybeSingle();
      if (data?.value) {
        try {
          setConfig(JSON.parse(data.value));
        } catch {}
      }
    };
    fetch();
  }, []);

  const selectTheme = (id: string) => {
    const theme = SEASONAL_THEMES[id];
    setConfig((c) => ({
      ...c,
      id,
      name: theme?.name || id,
      bannerText: theme?.bannerText || "",
      bannerEmoji: theme?.bannerEmoji || "",
    }));
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("site_settings").upsert({
      key: "seasonal_theme",
      value: JSON.stringify(config),
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    toast.success(config.active ? `${config.name} theme activated!` : "Theme deactivated");
  };

  return (
    <div className="space-y-6">
      {/* Theme selector cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(SEASONAL_THEMES).map(([id, theme]) => {
          const isSelected = config.id === id;
          return (
            <button
              key={id}
              onClick={() => selectTheme(id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border/40 bg-card hover:border-primary/30"
              }`}
            >
              <div className="text-2xl mb-2">{theme.particles[0]}</div>
              <h4 className="font-bold text-foreground text-sm">{theme.name}</h4>
              <div className="flex gap-1 mt-2">
                {theme.particles.map((p, i) => (
                  <span key={i} className="text-sm">{p}</span>
                ))}
              </div>
              {/* Color preview */}
              <div className="flex gap-1 mt-2">
                {Object.values(theme.colorOverrides).map((c, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-border/40"
                    style={{ backgroundColor: `hsl(${c})` }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Configuration */}
      <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
              <Palette size={18} className="text-primary" />
              {config.name || "Select a theme"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Configure what appears on the public website</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="theme-active" className="text-sm font-medium">
              {config.active ? "Active" : "Inactive"}
            </Label>
            <Switch
              id="theme-active"
              checked={config.active}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, active: v }))}
            />
          </div>
        </div>

        {/* Toggle options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-2">
              <PanelTop size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Banner</p>
                <p className="text-xs text-muted-foreground">Top announcement bar</p>
              </div>
            </div>
            <Switch
              checked={config.showBanner}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, showBanner: v }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Particles</p>
                <p className="text-xs text-muted-foreground">Floating decorations</p>
              </div>
            </div>
            <Switch
              checked={config.showOverlay}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, showOverlay: v }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Colors</p>
                <p className="text-xs text-muted-foreground">Override site palette</p>
              </div>
            </div>
            <Switch
              checked={config.showColors}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, showColors: v }))}
            />
          </div>
        </div>

        {/* Banner text customization */}
        {config.showBanner && (
          <div>
            <Label className="text-xs">Banner Text</Label>
            <Input
              value={config.bannerText}
              onChange={(e) => setConfig((c) => ({ ...c, bannerText: e.target.value }))}
              className="rounded-xl mt-1"
              placeholder="Custom banner message..."
            />
          </div>
        )}

        {/* Preview */}
        {config.active && (
          <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5">
            <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1.5">
              <Eye size={12} /> Preview
            </p>
            {config.showBanner && (
              <div
                className="rounded-lg text-white text-center py-2 px-3 text-xs font-medium mb-2"
                style={{ background: SEASONAL_THEMES[config.id]?.bannerBg || "hsl(var(--primary))" }}
              >
                {config.bannerText || SEASONAL_THEMES[config.id]?.bannerText}
              </div>
            )}
            {config.showOverlay && (
              <div className="flex gap-2 justify-center text-lg">
                {SEASONAL_THEMES[config.id]?.particles.map((p, i) => (
                  <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>{p}</span>
                ))}
              </div>
            )}
            {config.showColors && (
              <div className="flex gap-2 justify-center mt-2">
                {Object.entries(SEASONAL_THEMES[config.id]?.colorOverrides || {}).map(([prop, val], i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: `hsl(${val})` }} />
                    {prop.replace("--", "")}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button onClick={save} disabled={saving} className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
          {saving ? "Saving..." : <><Save size={16} /> Save Theme Settings</>}
        </Button>
      </div>
    </div>
  );
}
