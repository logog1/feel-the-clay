import { useState, useMemo, useEffect } from "react";
import { Check, Palette, ShoppingBag, Sparkles, Package, Clock, Heart, ArrowLeft, RotateCcw, CheckCircle, Loader2, Truck, RefreshCw, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import zelligeSvgRaw from "@/assets/zellige-kit-motif-final.svg?raw";
import gallery1 from "@/assets/zellige-kit-gallery-1.jpg";
import gallery2 from "@/assets/zellige-kit-gallery-2.jpg";
import gallery3 from "@/assets/zellige-kit-gallery-3.jpg";
import gallery4 from "@/assets/zellige-kit-gallery-4.jpg";
import { useZelligeCollections } from "@/hooks/use-zellige-collections";
import { useKitZelligeSettings } from "@/hooks/use-kit-zellige-settings";


const KIT_PRICE_FALLBACK = 390;
const orderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(5).max(300),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
type OrderForm = z.infer<typeof orderSchema>;

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
  en: { banner: "Preview page, not published.", store: "Store", new: "New", title: "Kit Zellige", subtitle: "Create your own Moroccan craft masterpiece", duration: "1h30 to 2h", zone: "Pick a zone", palette: "Choose a color", reset: "Reset", order: "Order this kit", payment: "Cash on delivery or in-store payment · Delivery in Morocco", hint: "Pick a zone, then tap a color to recolor it.", descTitle: "A creative journey into zellige", desc: "Discover zellige, the ancestral art that shapes Moroccan craftsmanship. With our complete kit, you create your own unique piece using traditional methods.", contentsTitle: "Kit contents", whyTitle: "Why this kit?", modeReady: "Ready models", modeCustom: "Customize", presetLine: "Model", customLine: "Custom design", formName: "Full name", formPhone: "Phone", formAddress: "Delivery address", formEmail: "Email (optional)", formNotes: "Notes (optional)", submit: "Confirm order", sending: "Sending…", success: "Order received!", successDesc: "We'll contact you shortly to confirm delivery.", back: "Back", errorMsg: "Could not send. Please try again." },
  fr: { banner: "Page d'aperçu, non publiée.", store: "Boutique", new: "Nouveau", title: "Kit Zellige", subtitle: "Créez votre propre chef-d'œuvre d'artisanat marocain", duration: "1h30 à 2h", zone: "Choisir une zone", palette: "Choisir une couleur", reset: "Réinitialiser", order: "Commander ce kit", payment: "Paiement à la livraison ou en boutique · Livraison Maroc", hint: "Sélectionnez une zone, puis touchez une couleur pour la recolorer.", descTitle: "Un voyage créatif au cœur du zellige", desc: "Plongez dans l'univers du zellige, cet art ancestral de l'artisanat marocain. Avec notre kit complet, vous créez votre pièce unique selon les méthodes traditionnelles.", contentsTitle: "Contenu du kit", whyTitle: "Pourquoi ce kit ?", modeReady: "Modèles prêts", modeCustom: "Personnaliser", presetLine: "Modèle", customLine: "Personnalisé", formName: "Nom complet", formPhone: "Téléphone", formAddress: "Adresse de livraison", formEmail: "Email (optionnel)", formNotes: "Notes (optionnel)", submit: "Confirmer la commande", sending: "Envoi…", success: "Commande reçue !", successDesc: "Nous vous contactons sous peu pour confirmer.", back: "Retour", errorMsg: "Envoi impossible. Réessayez." },
  es: { banner: "Página de vista previa, no publicada.", store: "Tienda", new: "Nuevo", title: "Kit Zellige", subtitle: "Crea tu propia obra maestra de artesanía marroquí", duration: "1h30 a 2h", zone: "Elige una zona", palette: "Elige un color", reset: "Restablecer", order: "Pedir este kit", payment: "Pago contra entrega o en tienda · Entrega en Marruecos", hint: "Selecciona una zona y luego un color para recolorearla.", descTitle: "Un viaje creativo al corazón del zellige", desc: "Descubre el zellige, el arte ancestral de la artesanía marroquí. Con nuestro kit completo, creas tu pieza única siguiendo métodos tradicionales.", contentsTitle: "Contenido del kit", whyTitle: "¿Por qué este kit?", modeReady: "Modelos listos", modeCustom: "Personalizar", presetLine: "Modelo", customLine: "Personalizado", formName: "Nombre completo", formPhone: "Teléfono", formAddress: "Dirección de entrega", formEmail: "Email (opcional)", formNotes: "Notas (opcional)", submit: "Confirmar pedido", sending: "Enviando…", success: "¡Pedido recibido!", successDesc: "Te contactaremos pronto para confirmar.", back: "Volver", errorMsg: "No se pudo enviar. Inténtalo de nuevo." },
  ar: { banner: "صفحة معاينة غير منشورة.", store: "المتجر", new: "جديد", title: "طقم الزليج", subtitle: "اصنع تحفتك الخاصة من الحرف المغربية", duration: "ساعة ونصف إلى ساعتين", zone: "اختر منطقة", palette: "اختر لوناً", reset: "إعادة", order: "اطلب هذا الطقم", payment: "الدفع عند الاستلام أو في المتجر · التوصيل داخل المغرب", hint: "اختر منطقة ثم لوناً لإعادة تلوينها.", descTitle: "رحلة إبداعية في عالم الزليج", desc: "اكتشف الزليج، الفن العريق للصناعة التقليدية المغربية. مع طقمنا الكامل تصنع قطعة فريدة باتباع طرق تقليدية.", contentsTitle: "محتويات الطقم", whyTitle: "لماذا هذا الطقم؟", modeReady: "نماذج جاهزة", modeCustom: "تخصيص", presetLine: "النموذج", customLine: "تصميم مخصص", formName: "الاسم الكامل", formPhone: "الهاتف", formAddress: "عنوان التوصيل", formEmail: "البريد الإلكتروني (اختياري)", formNotes: "ملاحظات (اختياري)", submit: "تأكيد الطلب", sending: "جارٍ الإرسال…", success: "تم استلام الطلب!", successDesc: "سنتصل بك قريباً للتأكيد.", back: "رجوع", errorMsg: "تعذّر الإرسال. حاول مجدداً." },
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
  
  const [form, setForm] = useState<OrderForm>({ name: "", phone: "", address: "", email: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({});
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [honey, setHoney] = useState("");

  // Availability filters (admin-controlled). Empty maps => show everything.
  const [availPieces, setAvailPieces] = useState<Set<string> | null>(null);
  const [availColors, setAvailColors] = useState<Set<string> | null>(null);
  const [availPresets, setAvailPresets] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("zellige_kit_items")
        .select("kind, key, is_available")
        .eq("is_available", true);
      if (cancelled || !data) return;
      const norm = (v: string) => v.toLowerCase();
      const pieces = new Set<string>();
      const colors = new Set<string>();
      const presets = new Set<string>();
      for (const row of data as { kind: string; key: string }[]) {
        if (row.kind === "piece") pieces.add(norm(row.key));
        else if (row.kind === "color") colors.add(norm(row.key));
        else if (row.kind === "preset") presets.add(row.key);
      }
      setAvailPieces(pieces);
      setAvailColors(colors);
      setAvailPresets(presets);
    })();
    return () => { cancelled = true; };
  }, []);

  const visibleRegions = useMemo(
    () => (availPieces && availPieces.size ? REGIONS.filter((r) => availPieces.has(r.key.toLowerCase())) : REGIONS),
    [availPieces]
  );
  const visiblePalette = useMemo(
    () => (availColors && availColors.size ? PALETTE.filter((c) => availColors.has(c.toLowerCase())) : PALETTE),
    [availColors]
  );
  const visiblePresets = useMemo(
    () => (availPresets && availPresets.size ? PRESETS.filter((p) => availPresets.has(p.id)) : PRESETS),
    [availPresets]
  );

  // Keep selection/preset valid if admin disables current choice.
  useEffect(() => {
    if (visibleRegions.length && !visibleRegions.find((r) => r.key === selected)) {
      setSelected(visibleRegions[0].key);
    }
  }, [visibleRegions, selected]);
  useEffect(() => {
    if (visiblePresets.length && !visiblePresets.find((p) => p.id === presetId)) {
      setPresetId(visiblePresets[0].id);
      setColors(visiblePresets[0].colors);
    }
  }, [visiblePresets, presetId]);


  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setColors(p.colors);
  };

  const svg = useMemo(() => {
    let s = zelligeSvgRaw
      .replace(/\swidth="[^"]*"/i, "")
      .replace(/\sheight="[^"]*"/i, "")
      .replace(/\szoomAndPan="[^"]*"/i, "");
    for (const r of REGIONS) {
      const target = colors[r.key];
      if (target.toLowerCase() === r.key.toLowerCase()) continue;
      s = s.split(`fill="${r.key}"`).join(`fill="${target}"`);
      s = s.split(`fill="${r.key.toUpperCase()}"`).join(`fill="${target}"`);
    }
    return s;
  }, [colors]);

  const kitLabel = useMemo(() => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (mode === "ready" && preset) return `${t.title} — ${t.presetLine}: ${preset.label[language]}`;
    const palette = REGIONS.map((r) => `${r.label[language]}=${colors[r.key]}`).join(", ");
    return `${t.title} — ${t.customLine} (${palette})`;
  }, [mode, presetId, colors, language, t]);

  const applyColor = (hex: string) => setColors((c) => ({ ...c, [selected]: hex }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honey) return;
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      const fe: Partial<Record<keyof OrderForm, string>> = {};
      parsed.error.errors.forEach((err) => {
        const f = err.path[0] as keyof OrderForm;
        if (!fe[f]) fe[f] = err.message;
      });
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSending(true);
    try {
      const preset = PRESETS.find((p) => p.id === presetId);
      const { error } = await supabase.functions.invoke("send-notification", {
        body: {
          type: "purchase",
          data: {
            items: [{ name: kitLabel, quantity: 1, price: KIT_PRICE }],
            totalPrice: KIT_PRICE,
            totalItems: 1,
            deliveryFee: 0,
            grandTotal: KIT_PRICE,
            region: "Kit Zellige",
            customerName: parsed.data.name,
            customerEmail: parsed.data.email || "",
            customerPhone: parsed.data.phone,
            customerAddress: parsed.data.address,
            notes: [
              parsed.data.notes || "",
              `Kit: ${kitLabel}`,
              mode === "custom" ? `Colors: ${JSON.stringify(colors)}` : `Preset: ${preset?.id}`,
            ].filter(Boolean).join(" | "),
          },
        },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Kit order failed:", err);
      setSubmitError(t.errorMsg);
    } finally {
      setSending(false);
    }
  };


  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-20">
        <SEOHead title="Kit Zellige · Moroccan DIY craft kit | Terraria" description="Create your own Moroccan zellige masterpiece at home. Hand-cut tiles, plaster, frame, and step-by-step booklet. Delivered in Morocco." path="/preview/kit-zellige" />

        <div className="container-x max-w-6xl mx-auto pt-6">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Link to="/store" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              <ArrowLeft size={12} /> {t.store}
            </Link>
            <span className="opacity-50">/</span>
            <span className="text-foreground font-medium">{t.title}</span>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto container-x section-y">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {/* Motif preview + builder directly underneath */}
            <div className="space-y-5 order-2 md:order-1">
              <div className="aspect-square rounded-3xl bg-card border-2 border-border/40 shadow-sm p-6 sm:p-10 overflow-hidden">
                <div
                role="img"
                aria-label={t.title}
                onClick={(e) => {
                  e.preventDefault();
                  const el = (e.target as SVGElement).closest("[fill]") as SVGElement | null;
                  const fill = el?.getAttribute("fill")?.toLowerCase();
                  if (!fill) return;
                  const region = REGIONS.find((r) => colors[r.key].toLowerCase() === fill);
                  if (region) {
                    setMode("custom");
                    setSelected(region.key);
                  }
                }}
                className="w-full h-full flex items-center justify-center cursor-pointer select-none touch-manipulation [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:pointer-events-auto [&_[fill]]:transition-colors [&_[fill]]:duration-300 hover:[&_[fill]]:opacity-90"
                style={{ ["--sel" as string]: colors[selected]?.toLowerCase(), WebkitTapHighlightColor: "transparent" }}
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
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {language === "fr" ? "Touchez un modèle pour l'aperçu"
                    : language === "es" ? "Toca un modelo para previsualizar"
                    : language === "ar" ? "اضغط على نموذج للمعاينة"
                    : "Tap a preset to preview"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                {visiblePresets.map((p) => {
                  const active = presetId === p.id;
                  const selectedLabel = language === "fr" ? "Sélectionné"
                    : language === "es" ? "Seleccionado"
                    : language === "ar" ? "محدد"
                    : "Selected";
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      aria-pressed={active}
                      className={cn(
                        "relative p-3 rounded-2xl border-2 text-left transition-all",
                        active ? "border-cta bg-cta/5 ring-2 ring-cta/25 shadow-sm" : "border-border/40 hover:border-border bg-card"
                      )}
                    >
                      {active && (
                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cta text-primary-foreground text-[10px] font-bold">
                          <Check size={10} strokeWidth={3} /> {selectedLabel}
                        </span>
                      )}
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
                    {visibleRegions.map((r) => (
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
                    {visiblePalette.map((hex) => {
                      const active = colors[selected]?.toLowerCase() === hex.toLowerCase();
                      return (
                        <button
                          key={hex}
                          onClick={() => applyColor(hex)}
                          className={cn(
                            "aspect-square rounded-lg border-2 transition-all flex items-center justify-center",
                            active ? "border-cta ring-2 ring-cta/30 shadow" : "border-border/40 hover:border-border"
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
          <div className="space-y-6 order-1 md:order-2">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cta/10 text-cta text-[11px] font-bold uppercase tracking-widest">
                <Package size={12} /> {t.new}
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">{t.title}</h1>
              <p className="mt-1 text-base text-foreground/70">{t.subtitle}</p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/40">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-cta">{KIT_PRICE} DH</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> {t.duration}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3 truncate" title={kitLabel}>{kitLabel}</p>

              {submitted ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-cta mx-auto" />
                  <p className="font-bold text-foreground">{t.success}</p>
                  <p className="text-xs text-muted-foreground">{t.successDesc}</p>
                  <button
                    onClick={() => { setSubmitted(false); setShowForm(false); setForm({ name: "", phone: "", address: "", email: "", notes: "" }); }}
                    className="mt-2 text-xs underline text-muted-foreground hover:text-foreground"
                  >
                    {t.back}
                  </button>
                </div>
              ) : !showForm ? (
                <Button
                  type="button"
                  variant="cta"
                  size="lg"
                  onClick={() => {
                    setShowForm(true);
                    requestAnimationFrame(() => {
                      const el = document.getElementById("kit-name");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        setTimeout(() => el.focus({ preventScroll: true }), 350);
                      }
                    });
                  }}
                  className="w-full"
                >
                  <ShoppingBag size={16} />
                  {t.order}
                </Button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" aria-hidden="true" />
                  {(["name","phone","address","email","notes"] as const).map((field) => {
                    const isArea = field === "address" || field === "notes";
                    const labelText = t[`form${field[0].toUpperCase()}${field.slice(1)}` as keyof typeof t];
                    const inputId = `kit-${field}`;
                    const invalid = !!errors[field];
                    const common = {
                      id: inputId,
                      value: form[field] || "",
                      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setForm({ ...form, [field]: e.target.value }),
                      "aria-invalid": invalid,
                      className: cn(invalid && "border-destructive focus-visible:ring-destructive"),
                    };
                    return (
                      <div key={field} className="space-y-1.5">
                        <Label htmlFor={inputId} className="text-xs">{labelText}</Label>
                        {isArea ? (
                          <Textarea rows={2} {...common} />
                        ) : (
                          <Input type={field === "email" ? "email" : "text"} {...common} />
                        )}
                        {invalid && <p className="text-[11px] text-destructive">{errors[field]}</p>}
                      </div>
                    );
                  })}
                  {submitError && <p className="text-xs text-destructive text-center">{submitError}</p>}
                  <Button type="submit" variant="cta" size="lg" disabled={sending} className="w-full">
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                    {sending ? t.sending : t.submit}
                  </Button>
                </form>
              )}

              <p className="mt-2 text-[11px] text-center text-muted-foreground">{t.payment}</p>

              <ul className="mt-4 pt-4 border-t border-border/40 space-y-2 text-[11px] text-foreground/75">
                <li className="flex items-center gap-2">
                  <Truck size={13} className="text-cta flex-shrink-0" />
                  <span>
                    {language === "fr" ? "Livraison au Maroc en 2 à 5 jours ouvrés"
                      : language === "es" ? "Entrega en Marruecos en 2 a 5 días laborables"
                      : language === "ar" ? "التوصيل داخل المغرب خلال 2 إلى 5 أيام عمل"
                      : "Delivered across Morocco in 2 to 5 working days"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw size={13} className="text-cta flex-shrink-0" />
                  <span>
                    {language === "fr" ? "Retour gratuit sous 7 jours si le kit arrive endommagé"
                      : language === "es" ? "Devolución gratuita en 7 días si el kit llega dañado"
                      : language === "ar" ? "إرجاع مجاني خلال 7 أيام إذا وصل الطقم متضرراً"
                      : "Free 7-day return if the kit arrives damaged"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={13} className="text-cta flex-shrink-0" />
                  <span>
                    {language === "fr" ? "Fabriqué à la main à Tétouan, Maroc"
                      : language === "es" ? "Hecho a mano en Tetuán, Marruecos"
                      : language === "ar" ? "مصنوع يدوياً في تطوان، المغرب"
                      : "Handmade in Tétouan, Morocco"}
                  </span>
                </li>
              </ul>

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
      <Footer />
    </>
  );
};


export default KitZelligePreview;
