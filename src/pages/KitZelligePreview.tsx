import { useState, useMemo } from "react";
import { Check, Palette, MessageCircle, Sparkles, Package, Clock, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";

/**
 * Preview page (not linked from nav) for the upcoming Zellige DIY Kit product.
 * Shows the 5 preset colorways AND a "Customize" mode (à la carreaux-zellige.com)
 * where the user paints each region of the motif from a palette.
 *
 * Route: /preview/kit-zellige
 */

// ── Palette ────────────────────────────────────────────────────────────────
const PALETTE = [
  { name: "Rouge",     hex: "#B23A2E" },
  { name: "Beige",     hex: "#E2C9A0" },
  { name: "Bleu",      hex: "#2F5E8A" },
  { name: "Vert",      hex: "#1F6B3A" },
  { name: "Jaune",     hex: "#E5B23A" },
  { name: "Rose",      hex: "#D88A8A" },
  { name: "Bleu clair",hex: "#A9C8E0" },
  { name: "Noir",      hex: "#1A1A1A" },
  { name: "Blanc",     hex: "#F4EFE6" },
];

// ── Presets (matching the reference tile) ──────────────────────────────────
// Regions: corners (blue), sides (coral), diamonds (maroon X), petals (orange diamond), center (8-pt star), frame (white)
type Region = "corners" | "sides" | "diamonds" | "petals" | "center" | "frame";
type ColorMap = Record<Region, string>;

const PRESETS: { id: string; label: string; colors: ColorMap }[] = [
  { id: "p1", label: "Bleu & Corail",   colors: { corners: "#5A6FF0", sides: "#FF5B66", diamonds: "#8B2E2E", petals: "#FF7300", center: "#EE8A00", frame: "#FFFFFF" } },
  { id: "p2", label: "Vert & Rose",     colors: { corners: "#1F6B3A", sides: "#D88A8A", diamonds: "#6B1F25", petals: "#3FA89A", center: "#E5B23A", frame: "#FFFFFF" } },
  { id: "p3", label: "Rouge & Beige",   colors: { corners: "#B23A2E", sides: "#E2C9A0", diamonds: "#6B1F25", petals: "#E96A1F", center: "#C98727", frame: "#FFFFFF" } },
  { id: "p4", label: "Bleu & Jaune",    colors: { corners: "#2F5E8A", sides: "#A9C8E0", diamonds: "#1A3A5C", petals: "#E5B23A", center: "#B23A2E", frame: "#FFFFFF" } },
  { id: "p5", label: "Noir & Rouge",    colors: { corners: "#1A1A1A", sides: "#D88A8A", diamonds: "#1A1A1A", petals: "#B23A2E", center: "#E5B23A", frame: "#FFFFFF" } },
];

// Dark olive base — peeks through between tiles as small accent shapes
const OLIVE_BASE = "#454A16";
const GROUT = 2.5; // white grout stroke width

// ── Motif SVG — Moroccan zellige tile (viewBox 0 0 400 400)
const Motif = ({
  colors,
  selectedRegion,
  onSelectRegion,
  interactive,
}: {
  colors: ColorMap;
  selectedRegion?: Region | null;
  onSelectRegion?: (r: Region) => void;
  interactive?: boolean;
}) => {
  const handle = (r: Region) => (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    onSelectRegion?.(r);
  };
  const ring = (r: Region) =>
    interactive && selectedRegion === r
      ? "outline outline-2 outline-offset-2 outline-cta"
      : "";

  // Stepped 8-point star (Khatim) — square with 4 rectangular protrusions
  // Built as union of a base square + 4 rectangles, expressed as a single polygon
  const stepStar = (cx: number, cy: number, half: number, arm: number) => {
    // half = half-side of base square; arm = depth of each protruding rectangle; arm-width = half
    const h = half, a = arm;
    // walk perimeter clockwise starting at top-left of top protrusion
    return [
      `${cx - h/2},${cy - h - a}`, `${cx + h/2},${cy - h - a}`,
      `${cx + h/2},${cy - h}`,     `${cx + h},${cy - h}`,
      `${cx + h},${cy - h/2}`,     `${cx + h + a},${cy - h/2}`,
      `${cx + h + a},${cy + h/2}`, `${cx + h},${cy + h/2}`,
      `${cx + h},${cy + h}`,       `${cx + h/2},${cy + h}`,
      `${cx + h/2},${cy + h + a}`, `${cx - h/2},${cy + h + a}`,
      `${cx - h/2},${cy + h}`,     `${cx - h},${cy + h}`,
      `${cx - h},${cy + h/2}`,     `${cx - h - a},${cy + h/2}`,
      `${cx - h - a},${cy - h/2}`, `${cx - h},${cy - h/2}`,
      `${cx - h},${cy - h}`,       `${cx - h/2},${cy - h}`,
    ].join(" ");
  };

  // ── Outer ring geometry ─────────────────────────────────────────────────
  // Blue corner blocks (chamfered pentagons) — inner corner cut diagonally
  const cornerTiles = [
    "0,0 120,0 120,80 80,120 0,120",                       // TL
    "280,0 400,0 400,120 320,120 280,80",                  // TR
    "0,280 80,280 120,320 120,400 0,400",                  // BL
    "320,280 400,280 400,400 280,400 280,320",             // BR
  ];

  // Coral elongated octagons on each side (flat outer edge along canvas edge)
  const sideTiles = [
    "140,0 260,0 300,40 300,100 260,140 140,140 100,100 100,40",       // TOP
    "400,140 400,260 360,300 300,300 260,260 260,140 300,100 360,100", // RIGHT
    "260,400 140,400 100,360 100,300 140,260 260,260 300,300 300,360", // BOTTOM
    "0,260 0,140 40,100 100,100 140,140 140,260 100,300 40,300",       // LEFT
  ];

  // ── Inner motif (within white-framed square 110..290) ───────────────────
  // 4 burgundy corner kites — each fills a corner of the inner square,
  // formed by joining the two triangles adjacent to a corner (4 vertices, apex at center)
  const burgundyKites = [
    "110,110 140,110 200,200 110,140", // TL
    "260,110 290,110 290,140 200,200", // TR
    "290,260 290,290 260,290 200,200", // BR
    "110,260 200,200 140,290 110,290", // BL
  ];

  // 4 orange cardinal triangles — wide base on each inner-square edge, apex at center
  const orangeTris = [
    "140,110 260,110 200,200", // N
    "290,140 290,260 200,200", // E
    "260,290 140,290 200,200", // S
    "110,260 110,140 200,200", // W
  ];

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full" shapeRendering="geometricPrecision">
      {/* olive base — shows through as small accent pieces between tiles */}
      <rect x="0" y="0" width="400" height="400" fill={OLIVE_BASE} pointerEvents="none" />

      {/* 4 blue chamfered corner blocks */}
      {cornerTiles.map((pts, i) => (
        <polygon
          key={`c-${i}`}
          points={pts}
          fill={colors.corners}
          stroke={colors.frame}
          strokeWidth={GROUT}
          strokeLinejoin="miter"
          onClick={handle("corners")}
          className={cn(interactive && "cursor-pointer", ring("corners"))}
        />
      ))}

      {/* 4 coral octagonal side tiles */}
      {sideTiles.map((pts, i) => (
        <polygon
          key={`s-${i}`}
          points={pts}
          fill={colors.sides}
          stroke={colors.frame}
          strokeWidth={GROUT}
          strokeLinejoin="miter"
          onClick={handle("sides")}
          className={cn(interactive && "cursor-pointer", ring("sides"))}
        />
      ))}

      {/* white inner square (frame / grout field) */}
      <rect
        x="110" y="110" width="180" height="180"
        fill={colors.frame}
        stroke={colors.frame}
        strokeWidth={GROUT}
        onClick={handle("frame")}
        className={cn(interactive && "cursor-pointer", ring("frame"))}
      />

      {/* 4 burgundy triangles forming the X (full-edge bases) */}
      {burgundyTris.map((pts, i) => (
        <polygon
          key={`b-${i}`}
          points={pts}
          fill={colors.diamonds}
          stroke={colors.frame}
          strokeWidth={GROUT}
          strokeLinejoin="miter"
          onClick={handle("diamonds")}
          className={cn(interactive && "cursor-pointer", ring("diamonds"))}
        />
      ))}

      {/* 4 orange triangles in front of burgundy (narrow, pointing to center) */}
      {orangeTris.map((pts, i) => (
        <polygon
          key={`o-${i}`}
          points={pts}
          fill={colors.petals}
          stroke={colors.frame}
          strokeWidth={GROUT}
          strokeLinejoin="miter"
          onClick={handle("petals")}
          className={cn(interactive && "cursor-pointer", ring("petals"))}
        />
      ))}

      {/* central stepped 8-point star (khatam) */}
      <polygon
        points={stepStar(200, 200, 22, 14)}
        fill={colors.center}
        stroke={colors.frame}
        strokeWidth={GROUT}
        strokeLinejoin="miter"
        onClick={handle("center")}
        className={cn(interactive && "cursor-pointer", ring("center"))}
      />
    </svg>
  );
};


const REGION_LABELS: Record<Region, string> = {
  corners: "Coins",
  sides: "Côtés",
  frame: "Filets",
  diamonds: "Triangles",
  petals: "Losange",
  center: "Étoile centrale",
};


const KitZelligePreview = () => {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [presetId, setPresetId] = useState<string>("p1");
  const [custom, setCustom] = useState<ColorMap>(PRESETS[0].colors);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>("center");

  const activeColors = mode === "preset"
    ? PRESETS.find((p) => p.id === presetId)!.colors
    : custom;

  const orderText = useMemo(() => {
    const lines = [
      "Bonjour, je souhaite commander le Kit Zellige.",
      mode === "preset"
        ? `Modèle choisi : ${PRESETS.find((p) => p.id === presetId)?.label}`
        : `Modèle personnalisé : ${Object.entries(custom).map(([k,v]) => `${REGION_LABELS[k as Region]} ${v}`).join(", ")}`,
    ];
    return encodeURIComponent(lines.join("\n"));
  }, [mode, presetId, custom]);

  const applyColor = (hex: string) => {
    if (!selectedRegion) return;
    setCustom((c) => ({ ...c, [selectedRegion]: hex }));
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead title="Kit Zellige — Aperçu" description="Aperçu du Kit Zellige DIY avec 5 modèles préfinis et option de personnalisation." path="/preview/kit-zellige" />

      {/* Preview banner */}
      <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs font-medium px-4 py-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Sparkles size={14} /> Page d'aperçu — non publiée. À valider avant lancement.
        </span>
        <Link to="/store" className="flex items-center gap-1 underline hover:no-underline">
          <ArrowLeft size={12} /> Store
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left: motif preview */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl bg-card border-2 border-border/40 shadow-sm p-6 sm:p-10">
              <Motif
                colors={activeColors}
                selectedRegion={mode === "custom" ? selectedRegion : null}
                onSelectRegion={setSelectedRegion}
                interactive={mode === "custom"}
              />
            </div>
            {mode === "custom" && (
              <p className="text-xs text-muted-foreground text-center">
                Cliquez sur une zone du motif, puis choisissez une couleur ci-dessous.
              </p>
            )}
          </div>

          {/* Right: details + selector */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cta/10 text-cta text-[11px] font-bold uppercase tracking-widest">
                <Package size={12} /> Nouveau
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Kit Zellige
              </h1>
              <p className="mt-1 text-base text-foreground/70">
                Créez votre propre chef-d'œuvre d'artisanat marocain
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-cta">350 DH</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> 1h30 – 2h</span>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex p-1 rounded-2xl bg-muted border border-border/40">
              <button
                onClick={() => setMode("preset")}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                  mode === "preset" ? "bg-card shadow text-foreground" : "text-muted-foreground"
                )}
              >
                5 modèles
              </button>
              <button
                onClick={() => { setMode("custom"); setCustom(activeColors); }}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5",
                  mode === "custom" ? "bg-card shadow text-foreground" : "text-muted-foreground"
                )}
              >
                <Palette size={14} /> Personnaliser
              </button>
            </div>

            {/* Preset selector */}
            {mode === "preset" && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Motif Zellige</p>
                <div className="grid grid-cols-5 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPresetId(p.id)}
                      className={cn(
                        "aspect-square rounded-xl border-2 p-1.5 transition-all",
                        presetId === p.id ? "border-cta scale-105 shadow-lg" : "border-border/40 hover:border-border"
                      )}
                      title={p.label}
                    >
                      <Motif colors={p.colors} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {PRESETS.find((p) => p.id === presetId)?.label}
                </p>
              </div>
            )}

            {/* Custom builder */}
            {mode === "custom" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Zone sélectionnée</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRegion(r)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1.5",
                          selectedRegion === r ? "border-cta bg-cta/10 text-cta" : "border-border/40 text-foreground/70 hover:border-border"
                        )}
                      >
                        <span className="inline-block w-3 h-3 rounded-full border border-border" style={{ background: custom[r] }} />
                        {REGION_LABELS[r]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Palette</p>
                  <div className="grid grid-cols-9 gap-2">
                    {PALETTE.map((c) => {
                      const active = selectedRegion && custom[selectedRegion] === c.hex;
                      return (
                        <button
                          key={c.hex}
                          onClick={() => applyColor(c.hex)}
                          className={cn(
                            "aspect-square rounded-lg border-2 transition-all flex items-center justify-center",
                            active ? "border-cta scale-110 shadow" : "border-border/40 hover:border-border"
                          )}
                          style={{ background: c.hex }}
                          title={c.name}
                        >
                          {active && <Check size={14} className="text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <a
              href={`https://wa.me/message/SBUBJACPVCNGM1?text=${orderText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-cta text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-cta-hover active:scale-95 transition-all shadow-lg shadow-cta/30"
            >
              <MessageCircle size={16} /> Commander sur WhatsApp
            </a>
            <p className="text-[11px] text-center text-muted-foreground">
              Paiement à la livraison ou en boutique · Livraison Maroc
            </p>
          </div>
        </div>

        {/* Long description */}
        <section className="mt-16 grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Un voyage créatif au cœur du zellige</h2>
            <p className="text-foreground/75 leading-relaxed text-sm">
              Plongez dans l'univers fascinant du zellige, cet art ancestral qui fait la renommée
              de l'artisanat marocain. Avec notre kit complet, vous créez votre propre pièce unique,
              en suivant les méthodes traditionnelles.
            </p>
            <h3 className="font-bold text-foreground pt-2">Contenu du kit</h3>
            <ul className="space-y-2 text-sm text-foreground/75">
              {[
                "Pièces de zellige taillées à la main",
                "Sachet de plâtre pour l'assemblage",
                "Lègant, cuillère et gobelet pour préparer le plâtre",
                "Carte d'instruction détaillée",
                "Brochure : histoire, origine et signification du motif",
                "Sous-cadre et cadre pour finaliser votre création",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <Check size={16} className="text-cta flex-shrink-0 mt-0.5" /> {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Pourquoi ce kit ?</h2>
            <div className="space-y-3">
              {[
                { icon: Sparkles, t: "Authenticité artisanale", d: "Chaque pièce de zellige est taillée à la main par des artisans marocains." },
                { icon: Heart,    t: "Immersion culturelle",    d: "Apprenez les techniques traditionnelles et explorez l'héritage du Maroc depuis chez vous." },
                { icon: Palette,  t: "Créativité et détente",   d: "Une activité relaxante qui stimule votre créativité." },
                { icon: Package,  t: "Objet unique",            d: "Créez une décoration personnalisée pour votre intérieur." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex gap-3 p-4 rounded-2xl bg-card border border-border/40">
                  <div className="w-10 h-10 rounded-xl bg-cta/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-cta" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{t}</p>
                    <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default KitZelligePreview;
