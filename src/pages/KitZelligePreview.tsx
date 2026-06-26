import { useState, useMemo } from "react";
import { Check, Palette, MessageCircle, Sparkles, Package, Clock, Heart, ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";
import zelligeSvgRaw from "@/assets/zellige-kit-motif-final.svg?raw";

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

const DEFAULTS = Object.fromEntries(REGIONS.map((r) => [r.key, r.key])) as Record<string, string>;

const COPY: Record<Language, Record<string, string>> = {
  en: { banner: "Preview page, not published.", store: "Store", new: "New", title: "Kit Zellige", subtitle: "Create your own Moroccan craft masterpiece", duration: "1h30 to 2h", zone: "Pick a zone", palette: "Choose a color", reset: "Reset", whatsapp: "Order on WhatsApp", payment: "Cash on delivery or in-store payment · Delivery in Morocco", hint: "Pick a zone, then tap a color to recolor it.", descTitle: "A creative journey into zellige", desc: "Discover zellige, the ancestral art that shapes Moroccan craftsmanship. With our complete kit, you create your own unique piece using traditional methods.", contentsTitle: "Kit contents", whyTitle: "Why this kit?", greeting: "Hello, I would like to order the Zellige Kit.", customLine: "Custom design:" },
  fr: { banner: "Page d'aperçu, non publiée.", store: "Boutique", new: "Nouveau", title: "Kit Zellige", subtitle: "Créez votre propre chef-d'œuvre d'artisanat marocain", duration: "1h30 à 2h", zone: "Choisir une zone", palette: "Choisir une couleur", reset: "Réinitialiser", whatsapp: "Commander sur WhatsApp", payment: "Paiement à la livraison ou en boutique · Livraison Maroc", hint: "Sélectionnez une zone, puis touchez une couleur pour la recolorer.", descTitle: "Un voyage créatif au cœur du zellige", desc: "Plongez dans l'univers du zellige, cet art ancestral de l'artisanat marocain. Avec notre kit complet, vous créez votre pièce unique selon les méthodes traditionnelles.", contentsTitle: "Contenu du kit", whyTitle: "Pourquoi ce kit ?", greeting: "Bonjour, je souhaite commander le Kit Zellige.", customLine: "Modèle personnalisé :" },
  es: { banner: "Página de vista previa, no publicada.", store: "Tienda", new: "Nuevo", title: "Kit Zellige", subtitle: "Crea tu propia obra maestra de artesanía marroquí", duration: "1h30 a 2h", zone: "Elige una zona", palette: "Elige un color", reset: "Restablecer", whatsapp: "Pedir por WhatsApp", payment: "Pago contra entrega o en tienda · Entrega en Marruecos", hint: "Selecciona una zona y luego un color para recolorearla.", descTitle: "Un viaje creativo al corazón del zellige", desc: "Descubre el zellige, el arte ancestral de la artesanía marroquí. Con nuestro kit completo, creas tu pieza única siguiendo métodos tradicionales.", contentsTitle: "Contenido del kit", whyTitle: "¿Por qué este kit?", greeting: "Hola, quiero pedir el Kit Zellige.", customLine: "Diseño personalizado:" },
  ar: { banner: "صفحة معاينة غير منشورة.", store: "المتجر", new: "جديد", title: "طقم الزليج", subtitle: "اصنع تحفتك الخاصة من الحرف المغربية", duration: "ساعة ونصف إلى ساعتين", zone: "اختر منطقة", palette: "اختر لوناً", reset: "إعادة", whatsapp: "اطلب عبر واتساب", payment: "الدفع عند الاستلام أو في المتجر · التوصيل داخل المغرب", hint: "اختر منطقة ثم لوناً لإعادة تلوينها.", descTitle: "رحلة إبداعية في عالم الزليج", desc: "اكتشف الزليج، الفن العريق للصناعة التقليدية المغربية. مع طقمنا الكامل تصنع قطعة فريدة باتباع طرق تقليدية.", contentsTitle: "محتويات الطقم", whyTitle: "لماذا هذا الطقم؟", greeting: "مرحباً، أريد طلب طقم الزليج.", customLine: "تصميم مخصص:" },
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
  const [colors, setColors] = useState<Record<string, string>>(DEFAULTS);
  const [selected, setSelected] = useState<string>(REGIONS[0].key);

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
    const lines = [
      t.greeting,
      `${t.customLine} ${REGIONS.map((r) => `${r.label[language]}=${colors[r.key]}`).join(", ")}`,
    ];
    return encodeURIComponent(lines.join("\n"));
  }, [colors, t, language]);

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
          {/* Motif preview */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl bg-card border-2 border-border/40 shadow-sm p-6 sm:p-10 overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">{t.hint}</p>
          </div>

          {/* Details + builder */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cta/10 text-cta text-[11px] font-bold uppercase tracking-widest">
                <Package size={12} /> {t.new}
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">{t.title}</h1>
              <p className="mt-1 text-base text-foreground/70">{t.subtitle}</p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-cta">350 DH</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> {t.duration}</span>
              </div>
            </div>

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

            <a
              href={`https://wa.me/message/SBUBJACPVCNGM1?text=${orderText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-2xl bg-cta text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-cta-hover active:scale-95 transition-all shadow-lg shadow-cta/30"
            >
              <MessageCircle size={16} /> {t.whatsapp}
            </a>
            <p className="text-[11px] text-center text-muted-foreground">{t.payment}</p>
          </div>
        </div>

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
