import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { fr as frLocale, es as esLocale, ar as arLocale, enUS } from "date-fns/locale";
import {
  Clock, MapPin, Users, Sparkles, ArrowRight, X, Check, Loader2,
  Waves, Sun, Heart, Palette, Compass, Leaf, ChevronDown, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";
import { SOFITEL_STRINGS, type SofitelKey } from "@/i18n/sofitel-strings";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  ZelligeDivider,
  ZelligeInlineSeparator,
  ZelligeTileBand,
  ZelligeStar,
  ZelligeDiamond,
  ZelligeSparkle,
} from "@/components/sofitel/ZelligeSymbols";

import imgHeroWallpaper from "@/assets/sofitel/hero-wallpaper.jpg";
import imgSofitelLogo from "@/assets/sofitel/sofitel-logo.png";

import imgPotteryHandbuilding from "@/assets/sofitel/pottery-handbuilding.jpg";
import imgCanvasPainting from "@/assets/sofitel/canvas-painting.jpg";
import imgZellijMosaic from "@/assets/sofitel/zellij-mosaic.jpg";
import imgCeramicPainting from "@/assets/sofitel/ceramic-painting.jpg";
import imgRugWeaving from "@/assets/sofitel/rug-weaving.jpg";
import imgGardenPlant from "@/assets/sofitel/garden-plant.jpg";
import imgPotteryCooperative from "@/assets/sofitel/pottery-cooperative.jpg";
import imgCookingFamily from "@/assets/sofitel/cooking-family.jpg";

const SLUG_IMAGES: Record<string, string> = {
  "pottery-handbuilding": imgPotteryHandbuilding,
  "canvas-painting": imgCanvasPainting,
  "zellij-mosaic": imgZellijMosaic,
  "ceramic-painting": imgCeramicPainting,
  "moroccan-rug-weaving": imgRugWeaving,
  "garden-plant-experience": imgGardenPlant,
  "pottery-cooperative": imgPotteryCooperative,
  "cooking-local-family": imgCookingFamily,
};

// Pinterest-style varied card heights for masonry rhythm
const SLUG_HEIGHTS: Record<string, string> = {
  "pottery-handbuilding": "aspect-[4/5]",
  "canvas-painting": "aspect-[3/4]",
  "zellij-mosaic": "aspect-[4/5]",
  "ceramic-painting": "aspect-[3/4]",
  "moroccan-rug-weaving": "aspect-[4/6]",
  "garden-plant-experience": "aspect-[3/4]",
  "pottery-cooperative": "aspect-[4/5]",
  "cooking-local-family": "aspect-[3/4]",
};

type Experience = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  cover_image: string | null;
  category: string;
  audience: string;
  duration_minutes: number;
  difficulty: string;
  price_per_person: number;
  currency: string;
  capacity: number;
  location: string | null;
  scheduled_at: string;
};

const FILTERS: { id: string; labelKey: SofitelKey; icon: any }[] = [
  { id: "all", labelKey: "f_all", icon: Sparkles },
  { id: "in-hotel", labelKey: "f_in_hotel", icon: Waves },
  { id: "outdoor", labelKey: "f_outdoor", icon: Compass },
  { id: "cultural", labelKey: "f_cultural", icon: Leaf },
  { id: "couples", labelKey: "f_couples", icon: Heart },
  { id: "family", labelKey: "f_family", icon: Sun },
  { id: "adults", labelKey: "f_adults", icon: Palette },
];

const DATE_LOCALES: Record<Language, typeof enUS> = {
  en: enUS,
  fr: frLocale,
  es: esLocale,
  ar: arLocale,
};

function tStr(key: SofitelKey, lang: Language, vars?: Record<string, string | number>): string {
  let s = (SOFITEL_STRINGS[key] as Record<Language, string>)[lang] || SOFITEL_STRINGS[key].en;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

function useT() {
  const { language } = useLanguage();
  const t = useCallback(
    (key: SofitelKey, vars?: Record<string, string | number>) => tStr(key, language, vars),
    [language]
  );
  const fmtDate = useCallback(
    (d: Date, pattern: string) => format(d, pattern, { locale: DATE_LOCALES[language] }),
    [language]
  );
  const spotsLabel = useCallback(
    (n: number) => tStr(n === 1 ? "spots_one" : "spots_other", language),
    [language]
  );
  return { t, fmtDate, spotsLabel, language };
}

// Local luxury palette: beach blue, sand yellow, off-white, soft black
const PALETTE = {
  bg: "#FBFAF6",        // off-white
  ink: "#0E1418",       // soft black
  blue: "#5B8AA6",      // beach blue
  blueDeep: "#2E5168",
  sand: "#E6C36B",      // sand yellow
  sandSoft: "#F1E2BE",
  line: "#E8E2D2",
};

export default function Sofitel() {
  const { t, fmtDate, spotsLabel, language } = useT();
  const dir: "ltr" | "rtl" = language === "ar" ? "rtl" : "ltr";
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<Experience | null>(null);
  const [confirmation, setConfirmation] = useState<{ name: string; experience: string } | null>(null);
  const [taken, setTaken] = useState<Record<string, number>>({});
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.documentElement.style.setProperty("--sofitel-bg", PALETTE.bg);
    document.body.style.background = PALETTE.bg;
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.body.style.background = "";
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const refreshAvailability = async () => {
    const { data } = await supabase.rpc("get_sofitel_availability");
    if (data) {
      const map: Record<string, number> = {};
      (data as any[]).forEach((r) => { map[r.experience_id] = r.taken; });
      setTaken(map);
    }
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("sofitel_experiences")
        .select("*")
        .eq("is_active", true)
        .order("scheduled_at", { ascending: true });
      if (error) toast.error(t("err_load"));
      setItems((data as Experience[]) || []);
      setLoading(false);
    })();
    refreshAvailability();
    const interval = setInterval(refreshAvailability, 20000);
    return () => clearInterval(interval);
  }, []);

  const days = useMemo(() => {
    const seen = new Map<string, Date>();
    items.forEach((i) => {
      const d = parseISO(i.scheduled_at);
      const key = format(d, "yyyy-MM-dd");
      if (!seen.has(key)) seen.set(key, d);
    });
    return Array.from(seen.entries()).map(([key, d]) => ({ key, date: d }));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const cat = filter === "all" || i.category === filter || i.audience === filter;
      const day = !activeDay || format(parseISO(i.scheduled_at), "yyyy-MM-dd") === activeDay;
      return cat && day;
    });
  }, [items, filter, activeDay]);

  return (
    <div
      dir={dir}
      className="min-h-screen"
      style={{ background: PALETTE.bg, color: PALETTE.ink, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Helmet>
        <html lang={language} />
        <title>{t("meta_title")}</title>
        <meta name="description" content={t("meta_desc")} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Helmet>

      {/* HERO — cinematic wallpaper */}
      <header className="relative overflow-hidden h-[88vh] sm:h-[92vh] min-h-[560px] flex items-end">
        {/* Parallax wallpaper */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate3d(0, ${scrollY * 0.35}px, 0) scale(${1 + scrollY * 0.0003})`,
            transition: "transform 60ms linear",
          }}
        >
          <img
            src={imgHeroWallpaper}
            alt="Sofitel Tamuda Bay terrace at golden hour"
            className="w-full h-[110%] object-cover"
            fetchPriority="high"
            width={1920}
            height={1280}
          />
        </div>

        {/* Cinematic gradient + grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              `linear-gradient(180deg, rgba(14,20,24,0.45) 0%, rgba(14,20,24,0.05) 35%, rgba(14,20,24,0.15) 60%, ${PALETTE.bg} 100%)`,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
          }}
        />

        {/* Floating zellige stars */}
        <ZelligeOrnament className="hidden sm:block absolute top-24 right-10 w-28 opacity-60 animate-[fade-in_1.2s_ease-out]" style={{ transform: `translateY(${scrollY * -0.2}px) rotate(${scrollY * 0.05}deg)` }} />
        <ZelligeOrnament className="absolute -bottom-8 -left-6 w-40 sm:w-56 opacity-30" style={{ transform: `translateY(${scrollY * -0.1}px) rotate(${scrollY * -0.04}deg)` }} />

        {/* Top co-branding bar */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-6xl mx-auto px-5 pt-5 sm:pt-7 flex items-center justify-between">
            <span
              className="text-[10px] sm:text-[11px] tracking-[0.32em] uppercase font-medium"
              style={{ color: "#FFFFFF", textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
            >
              {t("brand_topline")}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] tracking-[0.28em] uppercase" style={{ color: "#FFFFFF", textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}>
              <Star size={10} strokeWidth={1.5} fill="#E6C36B" stroke="#E6C36B" />
              <Star size={10} strokeWidth={1.5} fill="#E6C36B" stroke="#E6C36B" />
              <Star size={10} strokeWidth={1.5} fill="#E6C36B" stroke="#E6C36B" />
              <Star size={10} strokeWidth={1.5} fill="#E6C36B" stroke="#E6C36B" />
              <Star size={10} strokeWidth={1.5} fill="#E6C36B" stroke="#E6C36B" />
              <span className="ml-2 opacity-80">{t("luxury_resort")}</span>
            </div>
          </div>
        </div>

        {/* Main content (parallax inverse) */}
        <div
          className="relative z-10 max-w-6xl mx-auto px-5 pb-12 sm:pb-20 w-full"
          style={{ transform: `translateY(${scrollY * -0.15}px)`, opacity: Math.max(0, 1 - scrollY / 600) }}
        >
          {/* Co-branding lockup */}
          <div className="mb-6 sm:mb-8 inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full backdrop-blur-md animate-[fade-in_0.9s_ease-out]"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.5)" }}
          >
            <span className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase" style={{ color: PALETTE.blueDeep }}>
              Terraria
            </span>
            <span className="text-base" style={{ color: PALETTE.sand, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>×</span>
            <img src={imgSofitelLogo} alt="Sofitel" className="h-5 sm:h-6 w-auto" loading="eager" />
          </div>

          <h1
            className="text-[40px] sm:text-7xl md:text-[88px] leading-[0.98] font-light text-white animate-[fade-in_1s_ease-out]"
            style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 2px 30px rgba(14,20,24,0.4)" }}
          >
            {t("hero_title_1")}<br />
            <span style={{ fontStyle: "italic", color: "#F1E2BE" }}>{t("hero_title_2")}</span>
            <br className="sm:hidden" /> <span className="opacity-90">{t("hero_title_3")}</span>
          </h1>

          <p className="mt-5 sm:mt-7 max-w-xl text-[14px] sm:text-lg leading-relaxed text-white/85 animate-[fade-in_1.2s_ease-out]">
            {t("hero_subtitle")}
          </p>

          <div className="mt-7 sm:mt-10 flex items-center gap-3 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/90">
            <span className="h-px w-8 sm:w-12" style={{ background: PALETTE.sand }} />
            <ZelligeStar size={14} style={{ color: PALETTE.sand }} />
            <span>{t("this_week")}</span>
            <ZelligeStar size={14} style={{ color: PALETTE.sand }} />
            <span className="h-px flex-1 max-w-[80px]" style={{ background: "rgba(255,255,255,0.25)" }} />
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/80"
          style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
        >
          <span className="text-[9px] uppercase tracking-[0.4em]">{t("scroll")}</span>
          <ChevronDown size={16} className="animate-bounce" strokeWidth={1.5} />
        </div>
      </header>

      {/* Marquee ornament strip with zellige glyphs */}
      <div className="relative overflow-hidden border-y" style={{ borderColor: PALETTE.line, background: PALETTE.bg }}>
        <ZelligeTileBand
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none"
          color={PALETTE.sand}
          density={24}
        />
        <div className="relative flex gap-10 py-3 whitespace-nowrap animate-[marquee_40s_linear_infinite] will-change-transform">
          {Array.from({ length: 2 }).map((_, copy) => (
            <div key={copy} className="flex items-center gap-10 shrink-0">
              {[
                { k: "m_pottery" }, { g: "star" }, { k: "m_zellige" }, { g: "diamond" },
                { k: "m_cooking" }, { g: "sparkle" }, { k: "m_weaving" }, { g: "star" },
                { k: "m_painting" }, { g: "diamond" }, { k: "m_garden" }, { g: "sparkle" },
                { k: "m_cooperative" }, { g: "star" }, { k: "m_sunset" }, { g: "diamond" },
              ].map((item, i) => {
                if ("g" in item) {
                  const Glyph = item.g === "star" ? ZelligeStar : item.g === "diamond" ? ZelligeDiamond : ZelligeSparkle;
                  return <Glyph key={`${copy}-${i}`} size={14} style={{ color: PALETTE.sand }} />;
                }
                return (
                  <span
                    key={`${copy}-${i}`}
                    className="text-[11px] uppercase tracking-[0.32em]"
                    style={{ color: PALETTE.blueDeep }}
                  >
                    {t(item.k as SofitelKey)}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Section divider — into the program */}
      <div className="max-w-6xl mx-auto px-5 pt-10 sm:pt-14" style={{ color: PALETTE.sand }}>
        <ZelligeDivider symbol="star" lineColor={PALETTE.line} />
        <p className="mt-4 text-center text-[10px] sm:text-[11px] uppercase tracking-[0.36em]" style={{ color: PALETTE.blueDeep }}>
          <ZelligeInlineSeparator className="mr-2" color={PALETTE.sand} />
          {t("week_ahead")}
          <ZelligeInlineSeparator className="ml-2" color={PALETTE.sand} />
        </p>
      </div>

      {/* DAYS RAIL */}
      {days.length > 0 && (
        <div className="sticky top-0 z-20 backdrop-blur-md" style={{ background: `${PALETTE.bg}E6`, borderBottom: `1px solid ${PALETTE.line}` }}>
          <div className="max-w-6xl mx-auto px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <DayChip label={t("all_days")} active={!activeDay} onClick={() => setActiveDay(null)} />
            {days.map(({ key, date }) => (
              <DayChip
                key={key}
                label={fmtDate(date, "EEE d")}
                active={activeDay === key}
                onClick={() => setActiveDay(key === activeDay ? null : key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300",
                )}
                style={{
                  background: active ? PALETTE.ink : "transparent",
                  color: active ? PALETTE.bg : PALETTE.ink,
                  border: `1px solid ${active ? PALETTE.ink : PALETTE.line}`,
                }}
              >
                <f.icon size={13} strokeWidth={1.5} />
                {t(f.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID */}
      <main className="max-w-6xl mx-auto px-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin" style={{ color: PALETTE.blueDeep }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-24 opacity-60">{t("empty")}</p>
        ) : (
          <>
            {/* Mobile: swipeable horizontal rail */}
            <div className="sm:hidden -mx-5 px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {filtered.map((exp, idx) => (
                <div key={exp.id} className="snap-start shrink-0 w-[78%]">
                  <ExperienceCard
                    exp={exp}
                    index={idx}
                    remaining={Math.max(0, exp.capacity - (taken[exp.id] || 0))}
                    onBook={() => setSelected(exp)}
                  />
                </div>
              ))}
              <div className="shrink-0 w-2" aria-hidden />
            </div>
            {filtered.length > 1 && (
              <p className="sm:hidden mt-2 text-center text-[10px] uppercase tracking-[0.3em] opacity-50">
                {t("swipe_explore")}
              </p>
            )}

            {/* Tablet/desktop: grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((exp, idx) => (
                <div key={exp.id} className="h-full">
                  <ExperienceCard
                    exp={exp}
                    index={idx}
                    remaining={Math.max(0, exp.capacity - (taken[exp.id] || 0))}
                    onBook={() => setSelected(exp)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: PALETTE.line }}>
        <div className="max-w-6xl mx-auto px-5 pt-10">
          <ZelligeDivider symbol="rosette" lineColor={PALETTE.line} symbolColor={PALETTE.sand} />
        </div>
        <div className="max-w-6xl mx-auto px-5 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.32em] uppercase inline-flex items-center gap-2" style={{ color: PALETTE.blueDeep }}>
              <ZelligeStar size={12} style={{ color: PALETTE.sand }} />
              Terraria × Sofitel Tamuda Bay
            </p>
            <p className="mt-2 text-xs opacity-60">{t("footer_curated")}</p>
          </div>
          <p className="text-xs opacity-60 inline-flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            <ZelligeDiamond size={10} style={{ color: PALETTE.sand }} />
            "{t("footer_quote")}"
            <ZelligeDiamond size={10} style={{ color: PALETTE.sand }} />
          </p>
        </div>
      </footer>

      {selected && (
        <BookingSheet
          experience={selected}
          remaining={Math.max(0, selected.capacity - (taken[selected.id] || 0))}
          onClose={() => setSelected(null)}
          onConfirmed={(name) => {
            setConfirmation({ name, experience: selected.title });
            setSelected(null);
            refreshAvailability();
          }}
        />
      )}

      {confirmation && (
        <ConfirmationOverlay
          name={confirmation.name}
          experience={confirmation.experience}
          onClose={() => setConfirmation(null)}
        />
      )}

      <LanguageSwitcher />
    </div>
  );
}

function DayChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300"
      style={{
        background: active ? PALETTE.blueDeep : "transparent",
        color: active ? PALETTE.bg : PALETTE.ink,
        border: `1px solid ${active ? PALETTE.blueDeep : PALETTE.line}`,
      }}
    >
      {label}
    </button>
  );
}

function ExperienceCard({ exp, index, remaining, onBook }: { exp: Experience; index: number; remaining: number; onBook: () => void }) {
  const date = parseISO(exp.scheduled_at);
  const aspect = "aspect-[4/5]";
  const localImg = SLUG_IMAGES[exp.slug];
  return (
    <article
      className="group relative overflow-hidden rounded-3xl sm:rounded-[28px] bg-white animate-fade-in transition-all duration-500 sm:hover:-translate-y-1.5 h-full flex flex-col"
      style={{
        border: `1px solid ${PALETTE.line}`,
        animationDelay: `${index * 70}ms`,
        animationFillMode: "backwards",
        boxShadow: "0 1px 0 rgba(14,20,24,0.04), 0 24px 48px -28px rgba(46,81,104,0.18)",
      }}
      onMouseMove={(e) => {
        if (window.matchMedia("(hover: none)").matches) return;
        const t = e.currentTarget as HTMLElement;
        const r = t.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
        t.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      {/* Decorative corner ornament */}
      <svg
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"
        width="36" height="36" viewBox="0 0 36 36" fill="none"
      >
        <circle cx="18" cy="18" r="2" fill={PALETTE.sand} />
        <path d="M18 4 L18 12 M18 24 L18 32 M4 18 L12 18 M24 18 L32 18" stroke={PALETTE.sand} strokeWidth="0.8" strokeLinecap="round" />
        <circle cx="18" cy="18" r="14" stroke={PALETTE.sand} strokeWidth="0.6" strokeDasharray="2 3" />
      </svg>

      <div className={cn("relative overflow-hidden", aspect)}>
        <img
          src={localImg || exp.cover_image || "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200"}
          alt={exp.title}
          loading="lazy"
          width={1024}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]"
        />
        {/* Soft warm vignette */}
        <div
          className="absolute inset-0 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: `radial-gradient(120% 80% at 50% 100%, ${PALETTE.sandSoft}55 0%, transparent 60%)` }}
        />
        {/* Bottom gradient for legibility */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 30%, rgba(14,20,24,0.55) 75%, rgba(14,20,24,0.92) 100%)" }}
        />
        {/* Grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")" }}
        />

        <div className="absolute top-4 left-4 right-4 flex gap-2 items-start justify-between">
          <span
            className="text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full backdrop-blur-md inline-flex items-center gap-1.5 transition-transform duration-500 group-hover:-translate-y-0.5"
            style={{ background: "#FFFFFFE6", color: PALETTE.ink, boxShadow: "0 4px 12px rgba(14,20,24,0.08)" }}
          >
            <span className="w-1 h-1 rounded-full" style={{ background: PALETTE.sand }} />
            {exp.category === "in-hotel" ? "In-hotel" : exp.category === "outdoor" ? "Outdoor" : "Cultural"}
          </span>
          <SpotsBadge remaining={remaining} capacity={exp.capacity} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white">
          {exp.subtitle && (
            <p className="text-[10px] uppercase tracking-[0.32em] opacity-90 mb-1.5 sm:mb-2 inline-flex items-center gap-2">
              <span className="h-px w-6" style={{ background: PALETTE.sand }} />
              <span style={{ color: PALETTE.sand }}>{exp.subtitle}</span>
            </p>
          )}
          <h3
            className="text-[22px] sm:text-[28px] leading-[1.05] transition-transform duration-500 group-hover:translate-x-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
          >
            {exp.title}
          </h3>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 relative">
        <p className="text-[13px] sm:text-[13.5px] leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ color: PALETTE.ink, opacity: 0.78 }}>
          {exp.description}
        </p>

        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px]" style={{ color: PALETTE.blueDeep }}>
          <Meta icon={Clock}>{format(date, "EEE d MMM · HH:mm")}</Meta>
          <Meta icon={Users}>{remaining} of {exp.capacity}</Meta>
          {exp.location && <Meta icon={MapPin}>{exp.location}</Meta>}
        </div>

        <div className="flex items-end justify-between gap-3 pt-3 border-t" style={{ borderColor: PALETTE.line }}>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] opacity-50">From</p>
            <p className="text-[20px] sm:text-[22px] font-light leading-tight whitespace-nowrap" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {exp.price_per_person > 0 ? (
                <>
                  {exp.price_per_person} <span className="text-[12px] opacity-70">{exp.currency}</span>
                  <span className="text-[11px] opacity-60 ml-1">/ guest</span>
                </>
              ) : (
                <span style={{ fontStyle: "italic" }}>On request</span>
              )}
            </p>
          </div>
          <button
            onClick={onBook}
            disabled={remaining === 0}
            className="group/btn relative inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-[10.5px] font-medium uppercase tracking-[0.18em] sm:tracking-[0.22em] overflow-hidden transition-all duration-300 hover:gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:gap-2 shrink-0"
            style={{ background: PALETTE.ink, color: PALETTE.bg }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${PALETTE.blueDeep}, ${PALETTE.ink})` }}
            />
            <span className="relative">{remaining === 0 ? "Booked" : "Reserve"}</span>
            {remaining > 0 && <ArrowRight size={13} className="relative transition-transform group-hover/btn:translate-x-1" />}
          </button>
        </div>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={12} strokeWidth={1.5} />
      {children}
    </span>
  );
}

function SpotsBadge({ remaining, capacity }: { remaining: number; capacity: number }) {
  const ratio = capacity > 0 ? remaining / capacity : 0;
  const full = remaining === 0;
  const low = !full && ratio <= 0.3;
  const bg = full ? "#0E1418" : low ? "#E6C36B" : "#FFFFFFCC";
  const color = full ? "#FFFFFF" : "#0E1418";
  const label = full ? "Fully booked" : low ? `Only ${remaining} left` : `${remaining} spots`;
  return (
    <span
      className={cn(
        "text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full backdrop-blur-md inline-flex items-center gap-1.5",
        low && !full && "animate-pulse"
      )}
      style={{ background: bg, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: full ? "#FFFFFF" : low ? "#0E1418" : "#5B8AA6" }}
      />
      {label}
    </span>
  );
}

function BookingSheet({
  experience,
  remaining,
  onClose,
  onConfirmed,
}: {
  experience: Experience;
  remaining: number;
  onClose: () => void;
  onConfirmed: (name: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [participants, setParticipants] = useState(1);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = experience.price_per_person * participants;
  const date = parseISO(experience.scheduled_at);
  const fullyBooked = remaining === 0;
  const low = !fullyBooked && remaining <= 3;

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Swipe-down to close (mobile)
  const [dragY, setDragY] = useState(0);
  const startYRef = useState<{ y: number | null }>({ y: null })[0];
  const onTouchStart = (e: React.TouchEvent) => { startYRef.y = e.touches[0].clientY; };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startYRef.y == null) return;
    const dy = e.touches[0].clientY - startYRef.y;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    if (dragY > 120) onClose();
    setDragY(0);
    startYRef.y = null;
  };

  const goToReview = () => {
    if (!name.trim() || !room.trim()) {
      toast.error("Name and room number are required");
      return;
    }
    if (participants > remaining) {
      toast.error(`Only ${remaining} ${remaining === 1 ? "spot" : "spots"} left`);
      return;
    }
    setStep(2);
  };

  const submit = async () => {
    setSubmitting(true);
    const { error } = await supabase.from("sofitel_bookings").insert({
      experience_id: experience.id,
      guest_name: name.trim(),
      room_number: room.trim(),
      guest_phone: phone.trim() || null,
      participants,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit your reservation");
      return;
    }
    onConfirmed(name.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      style={{ background: "#0E1418CC" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative w-full sm:max-w-lg max-h-[94vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-in-right sm:animate-scale-in shadow-2xl"
        style={{
          background: PALETTE.bg,
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragY ? "none" : "transform 250ms ease",
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <span className="block w-10 h-1.5 rounded-full" style={{ background: PALETTE.line }} />
        </div>

        {/* Header */}
        <div className="relative px-5 sm:px-8 pt-3 sm:pt-6 pb-4 flex items-start gap-3 border-b" style={{ borderColor: PALETTE.line }}>
          <img
            src={SLUG_IMAGES[experience.slug] || experience.cover_image || ""}
            alt={experience.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: PALETTE.blueDeep }}>
              {format(date, "EEE d MMM · HH:mm")}
            </p>
            <h2 className="mt-1 text-xl sm:text-2xl leading-tight truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {experience.title}
            </h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5 items-center text-[10.5px]">
              <span
                className="px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: fullyBooked ? PALETTE.ink : low ? PALETTE.sand : "#FFFFFF",
                  color: fullyBooked ? PALETTE.bg : PALETTE.ink,
                  border: `1px solid ${fullyBooked ? PALETTE.ink : low ? PALETTE.sand : PALETTE.line}`,
                }}
              >
                {fullyBooked ? "Fully booked" : low ? `Only ${remaining} left` : `${remaining} spots available`}
              </span>
              {experience.location && (
                <span className="opacity-60 inline-flex items-center gap-1">
                  <MapPin size={11} /> {experience.location}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: PALETTE.line, color: PALETTE.ink }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-5 sm:px-8 pt-4">
          <StepDot active={step >= 1} label="Details" done={step > 1} />
          <span className="flex-1 h-px" style={{ background: PALETTE.line }} />
          <StepDot active={step >= 2} label="Confirm" />
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-5">
          {step === 1 ? (
            <div className="space-y-4">
              <Field label="Full name" value={name} onChange={setName} placeholder="Jane Doe" autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Room number" value={room} onChange={setRoom} placeholder="412" inputMode="numeric" />
                <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+212 ..." inputMode="tel" />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] opacity-60">Number of guests</label>
                <div className="mt-2 flex items-center justify-between gap-3 p-2 rounded-2xl" style={{ background: "#FFFFFF", border: `1px solid ${PALETTE.line}` }}>
                  <Stepper value={participants} onChange={setParticipants} max={Math.max(1, remaining)} />
                  <span className="text-xs opacity-60 pr-2">
                    {remaining} {remaining === 1 ? "spot" : "spots"} left
                  </span>
                </div>
              </div>

              <p className="text-[11px] opacity-50 leading-relaxed">
                Charges will appear on your Sofitel folio. Free cancellation up to 12h before.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-60">Review your reservation</p>
              <div className="rounded-2xl p-4 space-y-2.5" style={{ background: "#FFFFFF", border: `1px solid ${PALETTE.line}` }}>
                <ReviewRow label="Guest" value={name} />
                <ReviewRow label="Room" value={room} />
                {phone && <ReviewRow label="Phone" value={phone} />}
                <ReviewRow label="Guests" value={String(participants)} />
                <ReviewRow label="When" value={format(date, "EEE d MMM · HH:mm")} />
                {experience.location && <ReviewRow label="Where" value={experience.location} />}
              </div>
              <p className="text-[11px] opacity-60 leading-relaxed text-center">
                A printed confirmation will be delivered to your room.
              </p>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div
          className="px-5 sm:px-8 py-4 border-t flex items-center justify-between gap-3"
          style={{ borderColor: PALETTE.line, background: PALETTE.bg, paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
        >
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] opacity-50">Total</p>
            <p className="text-xl sm:text-2xl font-light leading-tight whitespace-nowrap" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {experience.price_per_person > 0 ? (
                <>{total} <span className="text-xs opacity-70">{experience.currency}</span></>
              ) : (
                <span style={{ fontStyle: "italic" }}>On request</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-full text-[11px] uppercase tracking-[0.2em]"
                style={{ border: `1px solid ${PALETTE.line}`, color: PALETTE.ink }}
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={step === 1 ? goToReview : submit}
              disabled={submitting || fullyBooked}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] disabled:opacity-50"
              style={{ background: PALETTE.ink, color: PALETTE.bg }}
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : step === 1 ? (
                <>Continue <ArrowRight size={13} /></>
              ) : (
                <><Check size={14} /> Confirm</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDot({ active, label, done }: { active: boolean; label: string; done?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-all"
        style={{
          background: active ? PALETTE.ink : "transparent",
          color: active ? PALETTE.bg : PALETTE.ink,
          border: `1px solid ${active ? PALETTE.ink : PALETTE.line}`,
        }}
      >
        {done ? <Check size={10} /> : label === "Details" ? "1" : "2"}
      </span>
      <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: active ? PALETTE.ink : "#9aa0a6" }}>{label}</span>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-[11px] uppercase tracking-[0.22em] opacity-60">{label}</span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, inputMode, autoFocus,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  inputMode?: "text" | "numeric" | "tel" | "email"; autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] opacity-60">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoFocus={autoFocus}
        className="mt-1.5 w-full rounded-xl px-4 py-3 text-base outline-none transition-colors focus:ring-2"
        style={{
          background: "#FFFFFF",
          border: `1px solid ${PALETTE.line}`,
          color: PALETTE.ink,
        }}
      />
    </label>
  );
}

function Stepper({ value, onChange, max }: { value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="inline-flex items-center rounded-full" style={{ border: `1px solid ${PALETTE.line}`, background: PALETTE.bg }}>
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(1, value - 1))} className="w-10 h-10 text-lg active:scale-95 transition">−</button>
      <span className="w-8 text-center text-base font-medium tabular-nums">{value}</span>
      <button type="button" aria-label="Increase" onClick={() => onChange(Math.min(max, value + 1))} className="w-10 h-10 text-lg active:scale-95 transition">+</button>
    </div>
  );
}

function ConfirmationOverlay({ name, experience, onClose }: { name: string; experience: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-5" style={{ background: "#0E1418F2" }}>
      <div className="max-w-md text-center text-white animate-scale-in">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: PALETTE.sand, color: PALETTE.ink }}
        >
          <Check size={28} strokeWidth={1.5} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.32em]" style={{ color: PALETTE.sand }}>Reservation received</p>
        <h2 className="mt-4 text-4xl leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Merci, {name}.
        </h2>
        <p className="mt-4 opacity-80 leading-relaxed">
          Your seat at <em>{experience}</em> is being prepared. Our concierge will deliver
          a printed confirmation to your room shortly.
        </p>
        <button
          onClick={onClose}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[0.2em]"
          style={{ background: PALETTE.bg, color: PALETTE.ink }}
        >
          Continue browsing
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function ZelligeOrnament({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="#E6C36B" strokeWidth="0.8" fill="none" opacity="0.9">
        {/* 8-point Moroccan star */}
        <path d="M100 10 L118 60 L170 50 L138 92 L190 110 L138 128 L170 170 L118 160 L100 210 L82 160 L30 170 L62 128 L10 110 L62 92 L30 50 L82 60 Z" />
        <circle cx="100" cy="110" r="42" />
        <circle cx="100" cy="110" r="28" strokeDasharray="2 4" />
        <circle cx="100" cy="110" r="6" fill="#E6C36B" />
        {/* Inner cross */}
        <path d="M100 70 L100 150 M60 110 L140 110" />
      </g>
    </svg>
  );
}
