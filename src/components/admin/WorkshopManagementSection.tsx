import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Save, ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
  Star, Ban, Tag, DollarSign, Clock, Coffee, MapPin, Sparkles,
  Plus, Trash2, Globe, Languages,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { WorkshopConfig, WorkshopId, MultiLang } from "@/hooks/use-workshop-config";
import { emptyMultiLang } from "@/hooks/use-workshop-config";
import { translations } from "@/i18n/translations";

const WORKSHOPS: { id: WorkshopId; label: string; translationPrefix: string }[] = [
  { id: "pottery", label: "Full Pottery Experience", translationPrefix: "pottery" },
  { id: "handbuilding", label: "Handbuilding Workshop", translationPrefix: "hand" },
  { id: "embroidery", label: "Embroidery Workshop", translationPrefix: "embr" },
  { id: "zellij", label: "Zellij Workshop", translationPrefix: "zellij" },
  { id: "carpets", label: "Carpets Workshop", translationPrefix: "carpets" },
  { id: "gardening", label: "Gardening Workshop", translationPrefix: "gardening" },
];

const LANGS = ["en", "ar", "es", "fr"] as const;
const LANG_LABELS: Record<string, string> = { en: "English", ar: "العربية", es: "Español", fr: "Français" };

function getTranslation(key: string): MultiLang {
  const t = (translations as any)[key];
  if (!t) return emptyMultiLang();
  return { en: t.en || "", ar: t.ar || "", es: t.es || "", fr: t.fr || "" };
}

function buildDefaultConfig(prefix: string): WorkshopConfig {
  const customDefaults: Record<string, WorkshopConfig> = {
    zellij: {
      title: { en: "Zellij Workshop", ar: "ورشة الزليج", es: "Taller de Zellij", fr: "Atelier Zellij" },
      tagline: { en: "Discover Moroccan geometric tile craft through pattern, color, and patient handwork.", ar: "اكتشف حرفة الزليج المغربي من خلال الألوان والهندسة والعمل اليدوي.", es: "Descubre el zellij marroquí a través del patrón, el color y el trabajo manual.", fr: "Découvrez le zellij marocain à travers les motifs, la couleur et le geste artisanal." },
      price: "Coming soon",
      duration: { en: "Coming soon", ar: "قريبا", es: "Próximamente", fr: "Bientôt" },
      drink: { en: "Tea included", ar: "الشاي مشمول", es: "Té incluido", fr: "Thé inclus" },
      location: { en: "Tetouan, Morocco", ar: "تطوان، المغرب", es: "Tetuán, Marruecos", fr: "Tétouan, Maroc" },
      descriptions: [
        { en: "A future workshop dedicated to Moroccan zellij, geometric thinking, and decorative craft traditions.", ar: "ورشة مستقبلية مخصصة للزليج المغربي والهندسة والحرف الزخرفية.", es: "Un futuro taller dedicado al zellij marroquí, la geometría y las artes decorativas.", fr: "Un futur atelier dédié au zellij marocain, à la géométrie et aux traditions décoratives." },
      ],
      highlights: [
        { en: "Pattern and color introduction", ar: "مقدمة في النقوش والألوان", es: "Introducción a patrones y colores", fr: "Introduction aux motifs et couleurs" },
        { en: "Local craft context", ar: "سياق الحرفة المحلية", es: "Contexto artesanal local", fr: "Contexte artisanal local" },
      ],
      is_available: false,
      is_popular: false,
      promo_enabled: false,
      promo_label: "",
      promo_price: "",
    },
    carpets: {
      title: { en: "Carpets Workshop", ar: "ورشة الزرابي", es: "Taller de Alfombras", fr: "Atelier Tapis" },
      tagline: { en: "A future weaving experience around Moroccan rugs, textures, symbols, and artisan stories.", ar: "تجربة نسج مستقبلية حول الزرابي المغربية والرموز وحكايات الحرفيين.", es: "Una futura experiencia de tejido sobre alfombras marroquíes, texturas y símbolos.", fr: "Une future expérience de tissage autour des tapis marocains, textures et symboles." },
      price: "Coming soon",
      duration: { en: "Coming soon", ar: "قريبا", es: "Próximamente", fr: "Bientôt" },
      drink: { en: "Tea included", ar: "الشاي مشمول", es: "Té incluido", fr: "Thé inclus" },
      location: { en: "Tetouan, Morocco", ar: "تطوان، المغرب", es: "Tetuán, Marruecos", fr: "Tétouan, Maroc" },
      descriptions: [
        { en: "A future textile workshop centered on Moroccan carpets, Amazigh motifs, and the rhythm of handmade weaving.", ar: "ورشة نسيج مستقبلية حول الزرابي المغربية والزخارف الأمازيغية وإيقاع النسج اليدوي.", es: "Un futuro taller textil sobre alfombras marroquíes, motivos amazigh y tejido manual.", fr: "Un futur atelier textile autour des tapis marocains, motifs amazighs et du tissage à la main." },
      ],
      highlights: [
        { en: "Textile symbols and materials", ar: "رموز ومواد النسيج", es: "Símbolos y materiales textiles", fr: "Symboles et matières textiles" },
        { en: "Artisan storytelling", ar: "حكايات الحرفيين", es: "Historias de artesanos", fr: "Récits d’artisanes" },
      ],
      is_available: false,
      is_popular: false,
      promo_enabled: false,
      promo_label: "",
      promo_price: "",
    },
    gardening: {
      title: { en: "Paint a Pot & Plant Workshop", ar: "ورشة طلاء الأصص والزراعة", es: "Taller de Pintar Maceta y Plantar", fr: "Atelier Peindre un Pot et Planter" },
      tagline: { en: "Paint your own terracotta pot, plant a small companion, and leave with a care guide for life at home.", ar: "اطلِ أصيصك الفخاري، ازرع نبتتك الصغيرة، وعد إلى البيت بدليل العناية بها.", es: "Pinta tu propia maceta de terracota, planta tu compañera verde y llévate una guía de cuidados.", fr: "Peignez votre pot en terre cuite, plantez une petite compagne et repartez avec un guide d’entretien." },
      price: "150 DH",
      duration: { en: "About 2 hours", ar: "حوالي ساعتين", es: "Unas 2 horas", fr: "Environ 2 heures" },
      drink: { en: "Mint tea included", ar: "شاي بالنعناع مشمول", es: "Té con menta incluido", fr: "Thé à la menthe inclus" },
      location: { en: "Tetouan, Morocco", ar: "تطوان، المغرب", es: "Tetuán, Marruecos", fr: "Tétouan, Maroc" },
      descriptions: [
        { en: "A creative gardening workshop where you decorate your own handmade terracotta pot with paints inspired by Moroccan motifs.", ar: "ورشة بستنة إبداعية تزيّن فيها أصيصك الفخاري المصنوع يدويا بألوان مستوحاة من الزخارف المغربية.", es: "Un taller creativo de jardinería donde decoras tu propia maceta de terracota con pinturas inspiradas en motivos marroquíes.", fr: "Un atelier créatif de jardinage où vous décorez votre propre pot en terre cuite avec des peintures inspirées des motifs marocains." },
        { en: "Then choose a small plant or succulent suited to your home, plant it in your pot, and walk away with a personalized care guide.", ar: "ثم تختار نبتة صغيرة أو نبتة عصارية تناسب بيتك، وتزرعها في أصيصك، وتغادر بدليل عناية شخصي.", es: "Luego eliges una pequeña planta o suculenta para tu hogar, la plantas en tu maceta y te llevas una guía de cuidados personalizada.", fr: "Choisissez ensuite une petite plante ou succulente adaptée à votre intérieur, plantez-la dans votre pot et repartez avec un guide d’entretien personnalisé." },
      ],
      highlights: [
        { en: "Hand-painted terracotta pot to keep", ar: "أصيص فخاري مرسوم يدويا تحتفظ به", es: "Maceta de terracota pintada a mano", fr: "Pot en terre cuite peint à la main" },
        { en: "One small plant or succulent", ar: "نبتة صغيرة أو نبتة عصارية", es: "Una pequeña planta o suculenta", fr: "Une petite plante ou succulente" },
        { en: "Soil, paints, brushes and tools provided", ar: "تربة وألوان وفراشي وأدوات", es: "Tierra, pinturas, pinceles y herramientas", fr: "Terre, peintures, pinceaux et outils fournis" },
        { en: "Personalized plant care guide to take home", ar: "دليل عناية شخصي لأخذه معك", es: "Guía personalizada de cuidados para llevar", fr: "Guide d’entretien personnalisé à emporter" },
        { en: "Mint tea and a relaxed creative atmosphere", ar: "شاي بالنعناع وأجواء إبداعية مريحة", es: "Té con menta y ambiente creativo y relajado", fr: "Thé à la menthe et ambiance créative détendue" },
      ],
      is_available: true,
      is_popular: false,
      promo_enabled: false,
      promo_label: "",
      promo_price: "",
    },
  };

  if (customDefaults[prefix]) return customDefaults[prefix];

  const descKeys = [`${prefix}.desc1`, `${prefix}.desc2`];
  const highlightKeys: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const key = `${prefix}.h${i}`;
    if ((translations as any)[key]) highlightKeys.push(key);
  }

  return {
    title: getTranslation(`${prefix}.title`),
    tagline: getTranslation(`${prefix}.tagline`),
    price: (translations as any)[`${prefix}.price`]?.en || "100 DH",
    duration: getTranslation(`${prefix}.duration`),
    drink: getTranslation(`${prefix}.drink`),
    location: getTranslation(`${prefix}.location`),
    descriptions: descKeys.map((k) => getTranslation(k)),
    highlights: highlightKeys.map((k) => getTranslation(k)),
    is_available: prefix !== "embr",
    is_popular: prefix === "hand",
    promo_enabled: false,
    promo_label: "",
    promo_price: "",
  };
}

function MultiLangInput({ value, onChange, label, textarea }: {
  value: MultiLang; onChange: (v: MultiLang) => void; label: string; textarea?: boolean;
}) {
  const [showLangs, setShowLangs] = useState(false);
  const Comp = textarea ? Textarea : Input;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <button
          type="button"
          onClick={() => setShowLangs(!showLangs)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Languages size={12} /> {showLangs ? "Hide" : "All languages"}
        </button>
      </div>
      <Comp
        value={value.en}
        onChange={(e: any) => onChange({ ...value, en: e.target.value })}
        placeholder={`${label} (English)`}
        className="rounded-xl text-sm"
      />
      {showLangs && LANGS.filter((l) => l !== "en").map((lang) => (
        <Comp
          key={lang}
          value={value[lang]}
          onChange={(e: any) => onChange({ ...value, [lang]: e.target.value })}
          placeholder={`${label} (${LANG_LABELS[lang]})`}
          className="rounded-xl text-sm"
          dir={lang === "ar" ? "rtl" : "ltr"}
        />
      ))}
    </div>
  );
}

export function WorkshopManagementSection() {
  const [configs, setConfigs] = useState<Record<WorkshopId, WorkshopConfig>>({
    pottery: buildDefaultConfig("pottery"),
    handbuilding: buildDefaultConfig("hand"),
    embroidery: buildDefaultConfig("embr"),
    zellij: buildDefaultConfig("zellij"),
    carpets: buildDefaultConfig("carpets"),
    gardening: buildDefaultConfig("gardening"),
  });
  const [expanded, setExpanded] = useState<WorkshopId | null>(null);
  const [saving, setSaving] = useState<WorkshopId | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const keys = WORKSHOPS.map((w) => `workshop_config_${w.id}`);
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", keys);

      if (data) {
        const updated = { ...configs };
        for (const row of data) {
          const id = row.key.replace("workshop_config_", "") as WorkshopId;
          try {
            updated[id] = JSON.parse(row.value);
          } catch { /* keep default */ }
        }
        setConfigs(updated);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const updateConfig = (id: WorkshopId, partial: Partial<WorkshopConfig>) => {
    setConfigs((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  };

  const saveConfig = async (id: WorkshopId) => {
    setSaving(id);
    const key = `workshop_config_${id}`;
    const value = JSON.stringify(configs[id]);

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) {
      toast.error("Failed to save workshop config");
    } else {
      toast.success(`${WORKSHOPS.find((w) => w.id === id)?.label} saved!`);
    }
    setSaving(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading workshops…</div>;
  }

  return (
    <div className="space-y-4">
      {WORKSHOPS.map((ws) => {
        const config = configs[ws.id];
        const isExpanded = expanded === ws.id;

        return (
          <div key={ws.id} className="rounded-2xl bg-card border-2 border-border/40 overflow-hidden">
            {/* Header */}
            <div
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : ws.id)}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                config.is_available ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
              )}>
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{config.title.en || ws.label}</h4>
                <p className="text-xs text-muted-foreground">
                  {config.price}
                  {config.promo_enabled && ` → ${config.promo_price} (${config.promo_label})`}
                  {!config.is_available && " · Coming Soon"}
                  {config.is_popular && " · ⭐ Popular"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); updateConfig(ws.id, { is_available: !config.is_available }); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={config.is_available ? "Mark unavailable" : "Mark available"}
                >
                  {config.is_available ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} />}
                </button>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </div>
            </div>

            {/* Expanded */}
            {isExpanded && (
              <div className="border-t border-border/30 p-5 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Globe size={14} className="text-cta" /> Basic Info
                  </h5>
                  <MultiLangInput
                    label="Title"
                    value={config.title}
                    onChange={(v) => updateConfig(ws.id, { title: v })}
                  />
                  <MultiLangInput
                    label="Tagline"
                    value={config.tagline}
                    onChange={(v) => updateConfig(ws.id, { tagline: v })}
                    textarea
                  />
                </div>

                {/* Quick Settings */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign size={14} className="text-cta" /> Price & Details
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1">
                        <DollarSign size={12} /> Price
                      </label>
                      <Input
                        value={config.price}
                        onChange={(e) => updateConfig(ws.id, { price: e.target.value })}
                        placeholder="e.g. 100 DH"
                        className="rounded-xl text-sm"
                      />
                    </div>
                    <MultiLangInput
                      label="Duration"
                      value={config.duration}
                      onChange={(v) => updateConfig(ws.id, { duration: v })}
                    />
                    <MultiLangInput
                      label="Drink included"
                      value={config.drink}
                      onChange={(v) => updateConfig(ws.id, { drink: v })}
                    />
                    <MultiLangInput
                      label="Location"
                      value={config.location}
                      onChange={(v) => updateConfig(ws.id, { location: v })}
                    />
                  </div>
                </div>

                {/* Promotion */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Tag size={14} className="text-cta" /> Promotion
                  </h5>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                    <button
                      onClick={() => updateConfig(ws.id, { promo_enabled: !config.promo_enabled })}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {config.promo_enabled ? <ToggleRight size={24} className="text-cta" /> : <ToggleLeft size={24} />}
                    </button>
                    <span className="text-sm text-foreground font-medium">
                      {config.promo_enabled ? "Promotion active" : "No promotion"}
                    </span>
                  </div>
                  {config.promo_enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Promo Label</label>
                        <Input
                          value={config.promo_label}
                          onChange={(e) => updateConfig(ws.id, { promo_label: e.target.value })}
                          placeholder="e.g. 20% OFF"
                          className="rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-foreground">Promo Price</label>
                        <Input
                          value={config.promo_price}
                          onChange={(e) => updateConfig(ws.id, { promo_price: e.target.value })}
                          placeholder="e.g. 80 DH"
                          className="rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Star size={14} className="text-cta" /> Status
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                      <button onClick={() => updateConfig(ws.id, { is_popular: !config.is_popular })}>
                        {config.is_popular ? <ToggleRight size={24} className="text-amber-500" /> : <ToggleLeft size={24} className="text-muted-foreground" />}
                      </button>
                      <span className="text-sm text-foreground font-medium">
                        <Star size={14} className="inline text-amber-500 mr-1" /> Popular badge
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                      <button onClick={() => updateConfig(ws.id, { is_available: !config.is_available })}>
                        {config.is_available ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-muted-foreground" />}
                      </button>
                      <span className="text-sm text-foreground font-medium">
                        {config.is_available ? "Available" : <><Ban size={14} className="inline text-cta mr-1" /> Coming Soon</>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Globe size={14} className="text-cta" /> Description Paragraphs
                  </h5>
                  {config.descriptions.map((desc, idx) => (
                    <div key={idx} className="relative">
                      <MultiLangInput
                        label={`Paragraph ${idx + 1}`}
                        value={desc}
                        onChange={(v) => {
                          const updated = [...config.descriptions];
                          updated[idx] = v;
                          updateConfig(ws.id, { descriptions: updated });
                        }}
                        textarea
                      />
                      {config.descriptions.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = config.descriptions.filter((_, i) => i !== idx);
                            updateConfig(ws.id, { descriptions: updated });
                          }}
                          className="absolute top-0 right-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfig(ws.id, { descriptions: [...config.descriptions, emptyMultiLang()] })}
                    className="rounded-xl gap-2"
                  >
                    <Plus size={12} /> Add Paragraph
                  </Button>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Star size={14} className="text-cta" /> What's Included (Highlights)
                  </h5>
                  {config.highlights.map((h, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="w-6 h-6 rounded-lg bg-cta/15 flex items-center justify-center flex-shrink-0 mt-2">
                        <span className="text-cta text-xs font-bold">{idx + 1}</span>
                      </span>
                      <div className="flex-1">
                        <MultiLangInput
                          label={`Highlight ${idx + 1}`}
                          value={h}
                          onChange={(v) => {
                            const updated = [...config.highlights];
                            updated[idx] = v;
                            updateConfig(ws.id, { highlights: updated });
                          }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updated = config.highlights.filter((_, i) => i !== idx);
                          updateConfig(ws.id, { highlights: updated });
                        }}
                        className="text-muted-foreground hover:text-destructive mt-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfig(ws.id, { highlights: [...config.highlights, emptyMultiLang()] })}
                    className="rounded-xl gap-2"
                  >
                    <Plus size={12} /> Add Highlight
                  </Button>
                </div>

                {/* Save */}
                <div className="pt-3 border-t border-border/30 flex justify-end">
                  <Button
                    onClick={() => saveConfig(ws.id)}
                    disabled={saving === ws.id}
                    className="rounded-xl gap-2 bg-cta hover:bg-cta/90 text-primary-foreground"
                  >
                    <Save size={14} /> {saving === ws.id ? "Saving…" : "Save Workshop"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
