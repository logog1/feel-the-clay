import { useState, useMemo } from "react";
import { Check, Palette, MessageCircle, Sparkles, Package, Clock, Heart, ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";
import zelligeSvgRaw from "@/assets/zellige-kit-motif-final.svg?raw";
import gallery1 from "@/assets/zellige-kit-gallery-1.jpg";
import gallery2 from "@/assets/zellige-kit-gallery-2.jpg";
import gallery3 from "@/assets/zellige-kit-gallery-3.jpg";
import gallery4 from "@/assets/zellige-kit-gallery-4.jpg";

/**
 * Kit Zellige preview — customize the motif by recoloring each
 * region (= each unique fill in the source SVG).
 * Route: /preview/kit-zellige
 */

// Each region is keyed by its original fill in the source SVG.
const REGIONS = [
  { key: "#b86a0a", label: { en: "8-point star (Khatim)", fr: "Étoile 8 branches (Khatim)", es: "Estrella de 8 puntas", ar: "خاتم (نجمة ثمانية)" } },
  { key: "#fe8f00", label: { en: "Triangles", fr: "Triangles", es: "Triángulos", ar: "مثلثات" } },
  { key: "#a44135", label: { en: "Kites", fr: "Cerfs-volants", es: "Cometas", ar: "معينات" } },
  { key: "#ff3131", label: { en: "Octagons", fr: "Octogones", es: "Octógonos", ar: "مثمنات" } },
  { key: "#5170ff", label: { en: "Chamfered squares", fr: "Carrés chanfreinés", es: "Cuadrados achaflanados", ar: "مربعات مشطوفة" } },
  { key: "#91a597", label: { en: "Background", fr: "Fond", es: "Fondo", ar: "خلفية" } },
  { key: "#ffffff", label: { en: "Joints", fr: "Joints", es: "Juntas", ar: "الفواصل" } },
] as const;

const PALETTE = [
  "#B23A2E", "#E2C9A0", "#2F5E8A", "#1F6B3A", "#E5B23A",
  "#D88A8A", "#A9C8E0", "#1A1A1A", "#F4EFE6", "#5170ff",
  "#ff3131", "#a44135", "#fe8f00", "#b86a0a", "#91a597",
  "#ffffff", "#0F3D2E", "#C97B3F",
];

// Neutral, traditional zellige preset applied on load (overrides raw SVG fills).
const DEFAULTS: Record<string, string> = {
  "#b86a0a": "#B23A2E", // 8-point star → terracotta
  "#fe8f00": "#E2C9A0", // triangles → cream
  "#a44135": "#C97B3F", // kites → ochre
  "#ff3131": "#2F5E8A", // octagons → deep blue
  "#5170ff": "#1F6B3A", // chamfered squares → green
  "#91a597": "#F4EFE6", // background → bone
  "#ffffff": "#FFFFFF", // joints → white
};

// Ready-made colorways (each maps region key → color).
const PRESETS: { id: string; label: Record<Language, string>; colors: Record<string, string> }[] = [
  {
    id: "fes-classic",
    label: { en: "Fès Classic", fr: "Fès Classique", es: "Fez Clásico", ar: "فاس الكلاسيكي" },
    colors: { "#b86a0a": "#B23A2E", "#fe8f00": "#E2C9A0", "#a44135": "#C97B3F", "#ff3131": "#2F5E8A", "#5170ff": "#1F6B3A", "#91a597": "#F4EFE6", "#ffffff": "#FFFFFF" },
  },
  {
    id: "majorelle",
    label: { en: "Majorelle Blue", fr: "Bleu Majorelle", es: "Azul Majorelle", ar: "أزرق ماجوريل" },
    colors: { "#b86a0a": "#1B3A8A", "#fe8f00": "#E5B23A", "#a44135": "#0F3D2E", "#ff3131": "#1B3A8A", "#5170ff": "#F4EFE6", "#91a597": "#F4EFE6", "#ffffff": "#FFFFFF" },
  },
  {
    id: "sahara",
    label: { en: "Sahara Sand", fr: "Sable du Sahara", es: "Arena del Sahara", ar: "رمال الصحراء" },
    colors: { "#b86a0a": "#8B4513", "#fe8f00": "#E2C9A0", "#a44135": "#C97B3F", "#ff3131": "#B23A2E", "#5170ff": "#A0825A", "#91a597": "#F4EFE6", "#ffffff": "#FFFFFF" },
  },
  {
    id: "midnight",
    label: { en: "Midnight Medina", fr: "Médina Nuit", es: "Medina Nocturna", ar: "مدينة الليل" },
    colors: { "#b86a0a": "#E5B23A", "#fe8f00": "#1A1A1A", "#a44135": "#0F3D2E", "#ff3131": "#2F5E8A", "#5170ff": "#1A1A1A", "#91a597": "#1F2937", "#ffffff": "#F4EFE6" },
  },
];

const COPY: Record<Language, Record<string, string>> = {
  en: { banner: "Preview page, not published.", store: "Store", new: "New", title: "Kit Zellige", subtitle: "Create your own Moroccan craft masterpiece", duration: "1h30 to 2h", zone: "Pick a zone", palette: "Choose a color", reset: "Reset", whatsapp: "Order on WhatsApp", payment: "Cash on delivery or in-store payment · Delivery in Morocco", hint: "Pick a zone, then tap a color to recolor it.", descTitle: "A creative journey into zellige", desc: "Discover zellige, the ancestral art that shapes Moroccan craftsmanship. With our complete kit, you create your own unique piece using traditional methods.", contentsTitle: "Kit contents", whyTitle: "Why this kit?", greeting: "Hello, I would like to order the Zellige Kit.", customLine: "Custom design:", modeReady: "Ready models", modeCustom: "Customize", presetLine: "Model:" },
  fr: { banner: "Page d'aperçu, non publiée.", store: "Boutique", new: "Nouveau", title: "Kit Zellige", subtitle: "Créez votre propre chef-d'œuvre d'artisanat marocain", duration: "1h30 à 2h", zone: "Choisir une zone", palette: "Choisir une couleur", reset: "Réinitialiser", whatsapp: "Commander sur WhatsApp", payment: "Paiement à la livraison ou en boutique · Livraison Maroc", hint: "Sélectionnez une zone, puis touchez une couleur pour la recolorer.", descTitle: "Un voyage créatif au cœur du zellige", desc: "Plongez dans l'univers du zellige, cet art ancestral de l'artisanat marocain. Avec notre kit complet, vous créez votre pièce unique selon les méthodes traditionnelles.", contentsTitle: "Contenu du kit", whyTitle: "Pourquoi ce kit ?", greeting: "Bonjour, je souhaite commander le Kit Zellige.", customLine: "Modèle personnalisé :", modeReady: "Modèles prêts", modeCustom: "Personnaliser", presetLine: "Modèle :" },
  es: { banner: "Página de vista previa, no publicada.", store: "Tienda", new: "Nuevo", title: "Kit Zellige", subtitle: "Crea tu propia obra maestra de artesanía marroquí", duration: "1h30 a 2h", zone: "Elige una zona", palette: "Elige un color", reset: "Restablecer", whatsapp: "Pedir por WhatsApp", payment: "Pago contra entrega o en tienda · Entrega en Marruecos", hint: "Selecciona una zona y luego un color para recolorearla.", descTitle: "Un viaje creativo al corazón del zellige", desc: "Descubre el zellige, el arte ancestral de la artesanía marroquí. Con nuestro kit completo, creas tu pieza única siguiendo métodos tradicionales.", contentsTitle: "Contenido del kit", whyTitle: "¿Por qué este kit?", greeting: "Hola, quiero pedir el Kit Zellige.", customLine: "Diseño personalizado:", modeReady: "Modelos listos", modeCustom: "Personalizar", presetLine: "Modelo:" },
  ar: { banner: "صفحة معاينة غير منشورة.", store: "المتجر", new: "جديد", title: "طقم الزليج", subtitle: "اصنع تحفتك الخاصة من الحرف المغربية", duration: "ساعة ونصف إلى ساعتين", zone: "اختر منطقة", palette: "اختر لوناً", reset: "إعادة", whatsapp: "اطلب عبر واتساب", payment: "الدفع عند الاستلام أو في المتجر · التوصيل داخل المغرب", hint: "اختر منطقة ثم لوناً لإعادة تلوينها.", descTitle: "رحلة إبداعية في عالم الزليج", desc: "اكتشف الزليج، الفن العريق للصناعة التقليدية المغربية. مع طقمنا الكامل تصنع قطعة فريدة باتباع طرق تقليدية.", contentsTitle: "محتويات الطقم", whyTitle: "لماذا هذا الطقم؟", greeting: "مرحباً، أريد طلب طقم الزليج.", customLine: "تصميم مخصص:", modeReady: "نماذج جاهزة", modeCustom: "تخصيص", presetLine: "النموذج:" },
};

const CONTENTS: Record<Language, string[]> = {
  en: ["Hand-cut zellige pieces", "Plaster pouch for assembly", "Lègant, spoon and cup", "Detailed instruction card", "Booklet about the motif", "Back-frame and frame"],
  fr: ["Pièces de zellige taillées à la main", "Sachet de plâtre pour l'assemblage", "Lègant, cuillère et gobelet", "Carte d'instruction détaillée", "Brochure sur le motif", "Sous-cadre et cadre"],
  es: ["Piezas de zellige cortadas a mano", "Bolsa de yeso para el montaje", "Lègant, cuchara y vaso", "Tarjeta de instrucciones detallada", "Folleto sobre el motivo", "Base y marco"],
  ar: ["قطع زليج مقطوعة يدوياً", "كيس جبس للتركيب", "لگّانت وملعقة وكأس", "بطاقة تعليمات مفصلة", "كتيب عن الزخرفة", "قاعدة وإطار"],
};

const BENEFITS: Record<Language, { title: string; description: string; icon: typeof Sparkles }[]> = {
  en: [
    { icon: Sparkles, title: "Artisanal authenticity", description: "Each piece is hand-cut by Moroccan artisans." },
    { icon: Heart, title: "Cultural immersion", description: "Learn traditional techniques from home." },
    { icon: Palette, title: "Creativity and calm", description: "A relaxing activity that stimulates creativity." },
    { icon: Package, title: "A unique object", description: "Create a personalized piece for your home." },
  ],
  fr: [
    { icon: Sparkles, title: "Authenticité artisanale", description: "Chaque pièce est taillée à la main par des artisans marocains." },
    { icon: Heart, title: "Immersion culturelle", description: "Apprenez les techniques traditionnelles depuis chez vous." },
    { icon: Palette, title: "Créativité et détente", description: "Une activité relaxante qui stimule votre créativité." },
    { icon: Package, title: "Objet unique", description: "Créez une décoration personnalisée pour votre intérieur." },
  ],
  es: [
    { icon: Sparkles, title: "Autenticidad artesanal", description: "Cada pieza está cortada a mano por artesanos marroquíes." },
    { icon: Heart, title: "Inmersión cultural", description: "Aprende técnicas tradicionales desde casa." },
    { icon: Palette, title: "Creatividad y calma", description: "Una actividad relajante que estimula la creatividad." },
    { icon: Package, title: "Objeto único", description: "Crea una pieza personalizada para tu hogar." },
  ],
  ar: [
    { icon: Sparkles, title: "أصالة حرفية", description: "كل قطعة مقطوعة يدوياً من طرف حرفيين مغاربة." },
    { icon: Heart, title: "انغماس ثقافي", description: "تعلم تقنيات تقليدية من منزلك." },
    { icon: Palette, title: "إبداع وهدوء", description: "نشاط مريح يحفز الإبداع." },
    { icon: Package, title: "قطعة فريدة", description: "اصنع قطعة مخصصة لمنزلك." },
  ],
};

const KitZelligePreview = () => {
  const { language } = useLanguage();
  const t = COPY[language];
  const [mode, setMode] = useState<"ready" | "custom">("ready");
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [colors, setColors] = useState<Record<string, string>>(PRESETS[0].colors);
  const [selected, setSelected] = useState<string>(REGIONS[0].key);

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setColors(p.colors);
  };

  const svg = useMemo(() => {
    let s = zelligeSvgRaw
      .replace(/\swidth="[^"]*"/i, "")
      .replace(/\sheight="[^"]*"/i, "");
    for (const r of REGIONS) {
      const target = colors[r.key];
      if (target.toLowerCase() === r.key.toLowerCase()) continue;
      s = s.split(`fill="${r.key}"`).join(`fill="${target}"`);
      s = s.split(`fill="${r.key.toUpperCase()}"`).join(`fill="${target}"`);
    }
    return s;
  }, [colors]);

  const orderText = useMemo(() => {
    const preset = PRESETS.find((p) => p.id === presetId);
    const lines = [
      t.greeting,
      mode === "ready" && preset
        ? `${t.presetLine} ${preset.label[language]}`
        : `${t.customLine} ${REGIONS.map((r) => `${r.label[language]}=${colors[r.key]}`).join(", ")}`,
    ];
    return encodeURIComponent(lines.join("\n"));
  }, [colors, t, language, mode, presetId]);

  const applyColor = (hex: string) => setColors((c) => ({ ...c, [selected]: hex }));

  return (
    <main className="min-h-screen bg-background">
      <SEOHead title="Zellige Kit Preview" description="Preview of the DIY Zellige Kit with customization." path="/preview/kit-zellige" />

      <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs font-medium px-4 py-2 flex items-center justify-between">
        <span className="flex items-center gap-2"><Sparkles size={14} /> {t.banner}</span>
        <Link to="/store" className="flex items-center gap-1 underline hover:no-underline">
          <ArrowLeft size={12} /> {t.store}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Motif preview + builder directly underneath */}
          <div className="space-y-5">
            <div className="aspect-square rounded-3xl bg-card border-2 border-border/40 shadow-sm p-6 sm:p-10 overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">{t.hint}</p>

            {/* Mode toggle: Ready models vs Customize */}
            <div className="inline-flex p-1 rounded-full bg-muted/60 border border-border/40">
              {(["ready", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    mode === m ? "bg-cta text-primary-foreground shadow" : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {m === "ready" ? t.modeReady : t.modeCustom}
                </button>
              ))}
            </div>

            {mode === "ready" ? (
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => {
                  const active = presetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      className={cn(
                        "p-3 rounded-2xl border-2 text-left transition-all",
                        active ? "border-cta bg-cta/5" : "border-border/40 hover:border-border bg-card"
                      )}
                    >
                      <div className="flex gap-1 mb-2">
                        {REGIONS.slice(0, 5).map((r) => (
                          <span key={r.key} className="w-5 h-5 rounded-md border border-border/40" style={{ background: p.colors[r.key] }} />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-foreground">{p.label[language]}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.zone}</p>
                    <button
                      onClick={() => setColors(DEFAULTS)}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <RotateCcw size={11} /> {t.reset}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {REGIONS.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => setSelected(r.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-2",
                          selected === r.key ? "border-cta bg-cta/10 text-cta" : "border-border/40 text-foreground/70 hover:border-border"
                        )}
                      >
                        <span className="w-3 h-3 rounded-full border border-border/60" style={{ background: colors[r.key] }} />
                        {r.label[language]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t.palette}</p>
                  <div className="grid grid-cols-9 gap-2">
                    {PALETTE.map((hex) => {
                      const active = colors[selected]?.toLowerCase() === hex.toLowerCase();
                      return (
                        <button
                          key={hex}
                          onClick={() => applyColor(hex)}
                          className={cn(
                            "aspect-square rounded-lg border-2 transition-all flex items-center justify-center",
                            active ? "border-cta scale-110 shadow" : "border-border/40 hover:border-border"
                          )}
                          style={{ background: hex }}
                          title={hex}
                        >
                          {active && <Check size={14} className="text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details + price + CTA */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cta/10 text-cta text-[11px] font-bold uppercase tracking-widest">
                <Package size={12} /> {t.new}
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">{t.title}</h1>
              <p className="mt-1 text-base text-foreground/70">{t.subtitle}</p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/40">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-cta">350 DH</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> {t.duration}</span>
              </div>
              <a
                href={`https://wa.me/message/SBUBJACPVCNGM1?text=${orderText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full py-4 rounded-2xl bg-cta text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-cta-hover active:scale-95 transition-all shadow-lg shadow-cta/30"
              >
                <MessageCircle size={16} /> {t.whatsapp}
              </a>
              <p className="mt-2 text-[11px] text-center text-muted-foreground">{t.payment}</p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <section className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[gallery1, gallery2, gallery3, gallery4].map((src, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-card border border-border/40">
              <img
                src={src}
                alt={`${t.title} ${i + 1}`}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </section>

        <section className="mt-16 grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{t.descTitle}</h2>
            <p className="text-foreground/75 leading-relaxed text-sm">{t.desc}</p>
            <h3 className="font-bold text-foreground pt-2">{t.contentsTitle}</h3>
            <ul className="space-y-2 text-sm text-foreground/75">
              {CONTENTS[language].map((line) => (
                <li key={line} className="flex gap-2">
                  <Check size={16} className="text-cta flex-shrink-0 mt-0.5" /> {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{t.whyTitle}</h2>
            <div className="space-y-3">
              {BENEFITS[language].map(({ icon: Icon, title, description }) => (
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
