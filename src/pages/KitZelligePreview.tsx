import { useState, useMemo } from "react";
import { Check, Palette, MessageCircle, Sparkles, Package, Clock, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";
import zelligeSvgRaw from "@/assets/zellige-motif.svg?raw";

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

const PRESETS: { id: string; colors: ColorMap }[] = [
  { id: "p1", colors: { corners: "#5A6FF0", sides: "#FF5B66", diamonds: "#8B2E2E", petals: "#FF7300", center: "#EE8A00", frame: "#FFFFFF" } },
  { id: "p2", colors: { corners: "#1F6B3A", sides: "#D88A8A", diamonds: "#6B1F25", petals: "#3FA89A", center: "#E5B23A", frame: "#FFFFFF" } },
  { id: "p3", colors: { corners: "#B23A2E", sides: "#E2C9A0", diamonds: "#6B1F25", petals: "#E96A1F", center: "#C98727", frame: "#FFFFFF" } },
  { id: "p4", colors: { corners: "#2F5E8A", sides: "#A9C8E0", diamonds: "#1A3A5C", petals: "#E5B23A", center: "#B23A2E", frame: "#FFFFFF" } },
  { id: "p5", colors: { corners: "#1A1A1A", sides: "#D88A8A", diamonds: "#1A1A1A", petals: "#B23A2E", center: "#E5B23A", frame: "#FFFFFF" } },
];

// Source fills present in the original SVG file — used to recolor by region.
const SRC_COLORS: Record<Region, string> = {
  corners: "#5170ff",
  sides:   "#ff5757",
  diamonds:"#812c2c",
  petals:  "#ff6200",
  center:  "#e2830d",
  frame:   "#ffffff",
};

const Motif = ({ colors }: { colors: ColorMap; selectedRegion?: Region | null; onSelectRegion?: (r: Region) => void; interactive?: boolean }) => {
  const svg = useMemo(() => {
    let s = zelligeSvgRaw;
    (Object.keys(SRC_COLORS) as Region[]).forEach((r) => {
      const src = SRC_COLORS[r];
      const target = colors[r];
      s = s.split(`fill="${src}"`).join(`fill="${target}"`);
      s = s.split(`fill="${src.toUpperCase()}"`).join(`fill="${target}"`);
    });
    return s;
  }, [colors]);
  return (
    <div
      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};



const PRESET_LABELS: Record<Language, Record<string, string>> = {
  en: { p1: "Blue & Coral", p2: "Green & Pink", p3: "Red & Beige", p4: "Blue & Yellow", p5: "Black & Red" },
  fr: { p1: "Bleu & Corail", p2: "Vert & Rose", p3: "Rouge & Beige", p4: "Bleu & Jaune", p5: "Noir & Rouge" },
  es: { p1: "Azul y coral", p2: "Verde y rosa", p3: "Rojo y beige", p4: "Azul y amarillo", p5: "Negro y rojo" },
  ar: { p1: "أزرق ومرجاني", p2: "أخضر ووردي", p3: "أحمر وبيج", p4: "أزرق وأصفر", p5: "أسود وأحمر" },
};

const REGION_LABELS: Record<Language, Record<Region, string>> = {
  en: { corners: "Chamfered square", sides: "Octagon", frame: "Background", diamonds: "Kite", petals: "Triangle", center: "8-point star (Khatim)" },
  fr: { corners: "Carré chanfreiné", sides: "Octogone", frame: "Fond", diamonds: "Cerf-volant", petals: "Triangle", center: "Étoile 8 branches (Khatim)" },
  es: { corners: "Cuadrado achaflanado", sides: "Octógono", frame: "Fondo", diamonds: "Cometa", petals: "Triángulo", center: "Estrella de 8 puntas" },
  ar: { corners: "مربع مشطوف", sides: "مثمن", frame: "خلفية", diamonds: "معين طائر", petals: "مثلث", center: "خاتم (نجمة ثمانية)" },
};

const RegionIcon = ({ r, fill }: { r: Region; fill: string }) => {
  const props = { fill, stroke: "currentColor", strokeWidth: 1, strokeLinejoin: "round" as const };
  switch (r) {
    case "corners":
      return <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0"><polygon points="1,1 19,1 19,13 13,19 1,19" {...props} /></svg>;
    case "sides":
      return <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0"><polygon points="6,1 14,1 19,6 19,14 14,19 6,19 1,14 1,6" {...props} /></svg>;
    case "diamonds":
      return <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0"><polygon points="2,2 10,10 18,2 10,18" {...props} /></svg>;
    case "petals":
      return <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0"><polygon points="10,2 18,18 2,18" {...props} /></svg>;
    case "center":
      return <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0"><polygon points="10,1 12,7 19,7 13.5,11 15.5,18 10,13.5 4.5,18 6.5,11 1,7 8,7" {...props} /></svg>;
    case "frame":
      return <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0"><rect x="1" y="1" width="18" height="18" {...props} /></svg>;
  }
};

const KIT_COPY: Record<Language, {
  seoTitle: string;
  seoDescription: string;
  previewBanner: string;
  storeLabel: string;
  customHint: string;
  newLabel: string;
  subtitle: string;
  duration: string;
  presetMode: string;
  customMode: string;
  motifLabel: string;
  selectedZone: string;
  palette: string;
  whatsappCta: string;
  payment: string;
  descriptionTitle: string;
  description: string;
  contentsTitle: string;
  contents: string[];
  whyTitle: string;
  benefits: { title: string; description: string; icon: typeof Sparkles }[];
  orderGreeting: string;
  orderPreset: string;
  orderCustom: string;
}> = {
  en: {
    seoTitle: "Zellige Kit Preview",
    seoDescription: "Preview of the DIY Zellige Kit with preset designs and a customization option.",
    previewBanner: "Preview page, not published. To validate before launch.",
    storeLabel: "Store",
    customHint: "Click an area of the motif, then choose a color below.",
    newLabel: "New",
    subtitle: "Create your own Moroccan craft masterpiece",
    duration: "1h30 to 2h",
    presetMode: "5 designs",
    customMode: "Customize",
    motifLabel: "Zellige motif",
    selectedZone: "Selected area",
    palette: "Palette",
    whatsappCta: "Order on WhatsApp",
    payment: "Cash on delivery or in-store payment · Delivery in Morocco",
    descriptionTitle: "A creative journey into zellige",
    description: "Discover zellige, the ancestral art that shaped Moroccan craftsmanship. With our complete kit, you create your own unique piece while following traditional methods.",
    contentsTitle: "Kit contents",
    contents: [
      "Hand-cut zellige pieces",
      "Plaster pouch for assembly",
      "Lègant, spoon and cup to prepare the plaster",
      "Detailed instruction card",
      "Booklet about the history, origin and meaning of the motif",
      "Back frame and frame to finish your creation",
    ],
    whyTitle: "Why this kit?",
    benefits: [
      { icon: Sparkles, title: "Artisanal authenticity", description: "Each zellige piece is hand-cut by Moroccan artisans." },
      { icon: Heart, title: "Cultural immersion", description: "Learn traditional techniques and explore Morocco's heritage from home." },
      { icon: Palette, title: "Creativity and calm", description: "A relaxing activity that stimulates your creativity." },
      { icon: Package, title: "A unique object", description: "Create a personalized decoration for your home." },
    ],
    orderGreeting: "Hello, I would like to order the Zellige Kit.",
    orderPreset: "Chosen design:",
    orderCustom: "Custom design:",
  },
  fr: {
    seoTitle: "Kit Zellige, Aperçu",
    seoDescription: "Aperçu du Kit Zellige DIY avec modèles prédéfinis et option de personnalisation.",
    previewBanner: "Page d'aperçu, non publiée. À valider avant lancement.",
    storeLabel: "Boutique",
    customHint: "Cliquez sur une zone du motif, puis choisissez une couleur ci-dessous.",
    newLabel: "Nouveau",
    subtitle: "Créez votre propre chef-d'œuvre d'artisanat marocain",
    duration: "1h30 à 2h",
    presetMode: "5 modèles",
    customMode: "Personnaliser",
    motifLabel: "Motif Zellige",
    selectedZone: "Zone sélectionnée",
    palette: "Palette",
    whatsappCta: "Commander sur WhatsApp",
    payment: "Paiement à la livraison ou en boutique · Livraison Maroc",
    descriptionTitle: "Un voyage créatif au cœur du zellige",
    description: "Plongez dans l'univers fascinant du zellige, cet art ancestral qui fait la renommée de l'artisanat marocain. Avec notre kit complet, vous créez votre propre pièce unique, en suivant les méthodes traditionnelles.",
    contentsTitle: "Contenu du kit",
    contents: [
      "Pièces de zellige taillées à la main",
      "Sachet de plâtre pour l'assemblage",
      "Lègant, cuillère et gobelet pour préparer le plâtre",
      "Carte d'instruction détaillée",
      "Brochure : histoire, origine et signification du motif",
      "Sous-cadre et cadre pour finaliser votre création",
    ],
    whyTitle: "Pourquoi ce kit ?",
    benefits: [
      { icon: Sparkles, title: "Authenticité artisanale", description: "Chaque pièce de zellige est taillée à la main par des artisans marocains." },
      { icon: Heart, title: "Immersion culturelle", description: "Apprenez les techniques traditionnelles et explorez l'héritage du Maroc depuis chez vous." },
      { icon: Palette, title: "Créativité et détente", description: "Une activité relaxante qui stimule votre créativité." },
      { icon: Package, title: "Objet unique", description: "Créez une décoration personnalisée pour votre intérieur." },
    ],
    orderGreeting: "Bonjour, je souhaite commander le Kit Zellige.",
    orderPreset: "Modèle choisi :",
    orderCustom: "Modèle personnalisé :",
  },
  es: {
    seoTitle: "Kit Zellige, Vista previa",
    seoDescription: "Vista previa del Kit Zellige DIY con diseños predefinidos y opción de personalización.",
    previewBanner: "Página de vista previa, no publicada. Para validar antes del lanzamiento.",
    storeLabel: "Tienda",
    customHint: "Haz clic en una zona del motivo y elige un color abajo.",
    newLabel: "Nuevo",
    subtitle: "Crea tu propia obra maestra de artesanía marroquí",
    duration: "1h30 a 2h",
    presetMode: "5 diseños",
    customMode: "Personalizar",
    motifLabel: "Motivo Zellige",
    selectedZone: "Zona seleccionada",
    palette: "Paleta",
    whatsappCta: "Pedir por WhatsApp",
    payment: "Pago contra entrega o en tienda · Entrega en Marruecos",
    descriptionTitle: "Un viaje creativo al corazón del zellige",
    description: "Descubre el zellige, el arte ancestral que distingue la artesanía marroquí. Con nuestro kit completo, creas tu propia pieza única siguiendo métodos tradicionales.",
    contentsTitle: "Contenido del kit",
    contents: [
      "Piezas de zellige cortadas a mano",
      "Bolsa de yeso para el montaje",
      "Lègant, cuchara y vaso para preparar el yeso",
      "Tarjeta de instrucciones detallada",
      "Folleto sobre la historia, el origen y el significado del motivo",
      "Base y marco para finalizar tu creación",
    ],
    whyTitle: "¿Por qué este kit?",
    benefits: [
      { icon: Sparkles, title: "Autenticidad artesanal", description: "Cada pieza de zellige está cortada a mano por artesanos marroquíes." },
      { icon: Heart, title: "Inmersión cultural", description: "Aprende técnicas tradicionales y explora la herencia de Marruecos desde casa." },
      { icon: Palette, title: "Creatividad y calma", description: "Una actividad relajante que estimula tu creatividad." },
      { icon: Package, title: "Objeto único", description: "Crea una decoración personalizada para tu hogar." },
    ],
    orderGreeting: "Hola, quiero pedir el Kit Zellige.",
    orderPreset: "Diseño elegido:",
    orderCustom: "Diseño personalizado:",
  },
  ar: {
    seoTitle: "معاينة طقم الزليج",
    seoDescription: "معاينة طقم الزليج المنزلي مع تصاميم جاهزة وخيار التخصيص.",
    previewBanner: "صفحة معاينة غير منشورة. للمراجعة قبل الإطلاق.",
    storeLabel: "المتجر",
    customHint: "اضغط على جزء من الزخرفة، ثم اختر اللون من الأسفل.",
    newLabel: "جديد",
    subtitle: "اصنع تحفتك الخاصة من الحرف المغربية",
    duration: "ساعة ونصف إلى ساعتين",
    presetMode: "5 تصاميم",
    customMode: "تخصيص",
    motifLabel: "زخرفة الزليج",
    selectedZone: "الجزء المختار",
    palette: "لوحة الألوان",
    whatsappCta: "اطلب عبر واتساب",
    payment: "الدفع عند الاستلام أو في المتجر · التوصيل داخل المغرب",
    descriptionTitle: "رحلة إبداعية في عالم الزليج",
    description: "اكتشف الزليج، الفن العريق الذي يميز الصناعة التقليدية المغربية. مع طقمنا الكامل، تصنع قطعة فريدة خاصة بك باتباع طرق تقليدية.",
    contentsTitle: "محتويات الطقم",
    contents: [
      "قطع زليج مقطوعة يدوياً",
      "كيس جبس للتركيب",
      "لگّانت وملعقة وكأس لتحضير الجبس",
      "بطاقة تعليمات مفصلة",
      "كتيب عن تاريخ الزخرفة وأصلها ومعناها",
      "قاعدة وإطار لإنهاء عملك",
    ],
    whyTitle: "لماذا هذا الطقم؟",
    benefits: [
      { icon: Sparkles, title: "أصالة حرفية", description: "كل قطعة زليج مقطوعة يدوياً من طرف حرفيين مغاربة." },
      { icon: Heart, title: "انغماس ثقافي", description: "تعلم تقنيات تقليدية واكتشف تراث المغرب من منزلك." },
      { icon: Palette, title: "إبداع وهدوء", description: "نشاط مريح يحفز الإبداع." },
      { icon: Package, title: "قطعة فريدة", description: "اصنع ديكوراً مخصصاً لمنزلك." },
    ],
    orderGreeting: "مرحباً، أريد طلب طقم الزليج.",
    orderPreset: "التصميم المختار:",
    orderCustom: "تصميم مخصص:",
  },
};


const KitZelligePreview = () => {
  const { language } = useLanguage();
  const copy = KIT_COPY[language];
  const regionLabels = REGION_LABELS[language];
  const presetLabels = PRESET_LABELS[language];
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [presetId, setPresetId] = useState<string>("p1");
  const [custom, setCustom] = useState<ColorMap>(PRESETS[0].colors);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>("center");

  const activeColors = mode === "preset"
    ? PRESETS.find((p) => p.id === presetId)!.colors
    : custom;

  const orderText = useMemo(() => {
    const lines = [
      copy.orderGreeting,
      mode === "preset"
        ? `${copy.orderPreset} ${presetLabels[presetId]}`
        : `${copy.orderCustom} ${Object.entries(custom).map(([k,v]) => `${regionLabels[k as Region]} ${v}`).join(", ")}`,
    ];
    return encodeURIComponent(lines.join("\n"));
  }, [mode, presetId, custom, copy, presetLabels, regionLabels]);

  const applyColor = (hex: string) => {
    if (!selectedRegion) return;
    setCustom((c) => ({ ...c, [selectedRegion]: hex }));
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead title={copy.seoTitle} description={copy.seoDescription} path="/preview/kit-zellige" />

      {/* Preview banner */}
      <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs font-medium px-4 py-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Sparkles size={14} /> {copy.previewBanner}
        </span>
        <Link to="/store" className="flex items-center gap-1 underline hover:no-underline">
          <ArrowLeft size={12} /> {copy.storeLabel}
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
                {copy.customHint}
              </p>
            )}
          </div>

          {/* Right: details + selector */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cta/10 text-cta text-[11px] font-bold uppercase tracking-widest">
                <Package size={12} /> {copy.newLabel}
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Kit Zellige
              </h1>
              <p className="mt-1 text-base text-foreground/70">
                {copy.subtitle}
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-cta">350 DH</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> {copy.duration}</span>
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
                {copy.presetMode}
              </button>
              <button
                onClick={() => { setMode("custom"); setCustom(activeColors); }}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5",
                  mode === "custom" ? "bg-card shadow text-foreground" : "text-muted-foreground"
                )}
              >
                <Palette size={14} /> {copy.customMode}
              </button>
            </div>

            {/* Preset selector */}
            {mode === "preset" && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{copy.motifLabel}</p>
                <div className="grid grid-cols-5 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPresetId(p.id)}
                      className={cn(
                        "aspect-square rounded-xl border-2 p-1.5 transition-all",
                        presetId === p.id ? "border-cta scale-105 shadow-lg" : "border-border/40 hover:border-border"
                      )}
                      title={presetLabels[p.id]}
                    >
                      <Motif colors={p.colors} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {presetLabels[presetId]}
                </p>
              </div>
            )}

            {/* Custom builder */}
            {mode === "custom" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{copy.selectedZone}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(regionLabels) as Region[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRegion(r)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1.5",
                          selectedRegion === r ? "border-cta bg-cta/10 text-cta" : "border-border/40 text-foreground/70 hover:border-border"
                        )}
                      >
                        <span className="inline-block w-3 h-3 rounded-full border border-border" style={{ background: custom[r] }} />
                        {regionLabels[r]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{copy.palette}</p>
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
                          {active && <Check size={14} className="text-primary-foreground drop-shadow" />}
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
              <MessageCircle size={16} /> {copy.whatsappCta}
            </a>
            <p className="text-[11px] text-center text-muted-foreground">
              {copy.payment}
            </p>
          </div>
        </div>

        {/* Long description */}
        <section className="mt-16 grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{copy.descriptionTitle}</h2>
            <p className="text-foreground/75 leading-relaxed text-sm">
              {copy.description}
            </p>
            <h3 className="font-bold text-foreground pt-2">{copy.contentsTitle}</h3>
            <ul className="space-y-2 text-sm text-foreground/75">
              {copy.contents.map((line) => (
                <li key={line} className="flex gap-2">
                  <Check size={16} className="text-cta flex-shrink-0 mt-0.5" /> {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{copy.whyTitle}</h2>
            <div className="space-y-3">
              {copy.benefits.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-3 p-4 rounded-2xl bg-card border border-border/40">
                  <div className="w-10 h-10 rounded-xl bg-cta/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-cta" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{title}</p>
                    <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">{description}</p>
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
