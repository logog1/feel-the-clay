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
  { id: "p1", label: "Bleu & Corail",   colors: { corners: "#5778C9", sides: "#F37B6E", diamonds: "#6B2A2E", petals: "#E96A1F", center: "#C98727", frame: "#F4EFE6" } },
  { id: "p2", label: "Vert & Rose",     colors: { corners: "#1F6B3A", sides: "#D88A8A", diamonds: "#6B1F25", petals: "#3FA89A", center: "#E5B23A", frame: "#F4EFE6" } },
  { id: "p3", label: "Rouge & Beige",   colors: { corners: "#B23A2E", sides: "#E2C9A0", diamonds: "#6B1F25", petals: "#E96A1F", center: "#C98727", frame: "#F4EFE6" } },
  { id: "p4", label: "Bleu & Jaune",    colors: { corners: "#2F5E8A", sides: "#A9C8E0", diamonds: "#1A3A5C", petals: "#E5B23A", center: "#B23A2E", frame: "#F4EFE6" } },
  { id: "p5", label: "Noir & Rouge",    colors: { corners: "#1A1A1A", sides: "#D88A8A", diamonds: "#1A1A1A", petals: "#B23A2E", center: "#E5B23A", frame: "#F4EFE6" } },
];

// Dark olive base — peeks through as small accent triangles at tile junctions
const OLIVE_BASE = "#3A3D1F";

// ── Motif SVG — square zellige tile matching the reference photo
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

  // 8-point star (Khatim) from two rotated squares
  const star = (cx: number, cy: number, r: number, rot = 0) => {
    const inner = r * Math.cos(Math.PI / 8);
    const pts: string[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i - Math.PI / 2 + rot;
      const a2 = a + Math.PI / 8;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
      pts.push(`${cx + inner * Math.cos(a2)},${cy + inner * Math.sin(a2)}`);
    }
    return pts.join(" ");
  };

  // Chamfered corner tiles (blue) — 50×50 with diagonal cut toward center
  const cornerTiles = [
    "0,0 50,0 50,35 35,50 0,50",                   // top-left
    "150,0 200,0 200,50 165,50 150,35",            // top-right
    "0,150 35,150 50,165 50,200 0,200",            // bottom-left
    "200,150 200,200 150,200 150,165 165,150",     // bottom-right
  ];

  // Side tiles (coral) — between corners, full edge to inner square
  const sideTiles = [
    "50,0 150,0 150,50 50,50",     // top
    "150,50 200,50 200,150 150,150", // right
    "50,150 150,150 150,200 50,200", // bottom
    "0,50 50,50 50,150 0,150",      // left
  ];

  // Inner square (50..150) — split by both diagonals into 4 triangles
  // Maroon triangles fill the four sides between the orange diamond and the white frame
  const maroonTris = [
    "50,50 150,50 100,100",   // top
    "150,50 150,150 100,100", // right
    "150,150 50,150 100,100", // bottom
    "50,150 50,50 100,100",   // left
  ];

  // Orange diamond (rotated square inscribed in inner square)
  const orangeDiamond = "100,50 150,100 100,150 50,100";

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* olive base — shows through as small accent triangles */}
      <rect x="0" y="0" width="200" height="200" fill={OLIVE_BASE} pointerEvents="none" />

      {/* 4 blue chamfered corner tiles */}
      {cornerTiles.map((pts, i) => (
        <polygon
          key={`c-${i}`}
          points={pts}
          fill={colors.corners}
          stroke={colors.frame}
          strokeWidth="1.5"
          strokeLinejoin="miter"
          onClick={handle("corners")}
          className={cn(interactive && "cursor-pointer", ring("corners"))}
        />
      ))}

      {/* 4 coral side tiles */}
      {sideTiles.map((pts, i) => (
        <polygon
          key={`s-${i}`}
          points={pts}
          fill={colors.sides}
          stroke={colors.frame}
          strokeWidth="1.5"
          onClick={handle("sides")}
          className={cn(interactive && "cursor-pointer", ring("sides"))}
        />
      ))}

      {/* white inner square frame */}
      <rect
        x="50" y="50" width="100" height="100"
        fill={colors.frame}
        onClick={handle("frame")}
        className={cn(interactive && "cursor-pointer", ring("frame"))}
      />

      {/* 4 maroon triangles (X across inner square) */}
      {maroonTris.map((pts, i) => (
        <polygon
          key={`m-${i}`}
          points={pts}
          fill={colors.diamonds}
          onClick={handle("diamonds")}
          className={cn(interactive && "cursor-pointer", ring("diamonds"))}
        />
      ))}

      {/* orange diamond on top — leaves 4 maroon corner triangles visible */}
      <polygon
        points={orangeDiamond}
        fill={colors.petals}
        stroke={colors.frame}
        strokeWidth="2"
        onClick={handle("petals")}
        className={cn(interactive && "cursor-pointer", ring("petals"))}
      />

      {/* central 8-point star (Khatim) */}
      <polygon
        points={star(100, 100, 20)}
        fill={colors.center}
        stroke={colors.frame}
        strokeWidth="1"
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
