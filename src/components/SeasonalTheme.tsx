import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

export interface ThemeConfig {
  id: string;
  name: string;
  active: boolean;
  showBanner: boolean;
  showOverlay: boolean;
  showColors: boolean;
  bannerText: string;
  bannerEmoji: string;
}

export const SEASONAL_THEMES: Record<string, {
  name: string;
  bannerBg: string;
  bannerText: string;
  bannerEmoji: string;
  particles: string[];
  colorOverrides: Record<string, string>;
}> = {
  ramadan: {
    name: "Ramadan / Eid",
    bannerBg: "linear-gradient(135deg, hsl(45 80% 25%), hsl(38 90% 40%))",
    bannerText: "Ramadan Mubarak! ✨ Special workshop sessions available",
    bannerEmoji: "🌙",
    particles: ["🌙", "⭐", "🕌", "✨"],
    colorOverrides: {
      "--primary": "38 80% 45%",
      "--accent": "45 70% 30%",
      "--background": "40 30% 92%",
    },
  },
  womensday: {
    name: "8 Mars / Women's Day",
    bannerBg: "linear-gradient(135deg, hsl(320 60% 40%), hsl(280 50% 50%))",
    bannerText: "Happy International Women's Day! 💜",
    bannerEmoji: "💐",
    particles: ["🌸", "💜", "🌷", "✨"],
    colorOverrides: {
      "--primary": "320 60% 45%",
      "--accent": "280 50% 40%",
      "--background": "320 20% 93%",
    },
  },
  halloween: {
    name: "Halloween",
    bannerBg: "linear-gradient(135deg, hsl(30 90% 35%), hsl(270 60% 25%))",
    bannerText: "🎃 Spooky pottery season! Create your Halloween pieces",
    bannerEmoji: "🎃",
    particles: ["🎃", "🦇", "👻", "🕸️"],
    colorOverrides: {
      "--primary": "30 90% 45%",
      "--accent": "270 50% 30%",
      "--background": "30 20% 88%",
    },
  },
  summer: {
    name: "Summer",
    bannerBg: "linear-gradient(135deg, hsl(195 90% 45%), hsl(35 90% 55%))",
    bannerText: "☀️ Summer workshops are open! Book your spot now",
    bannerEmoji: "🌊",
    particles: ["☀️", "🌊", "🐚", "🌴"],
    colorOverrides: {
      "--primary": "195 80% 45%",
      "--accent": "35 70% 45%",
      "--background": "195 30% 93%",
    },
  },
};

// Floating particles component
function FloatingParticles({ particles }: { particles: string[] }) {
  const items = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      char: particles[i % particles.length],
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      size: 14 + Math.random() * 14,
    })), [particles]
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute animate-float-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.6,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

// Banner component
function ThemeBanner({ text, bg, onClose }: { text: string; bg: string; onClose: () => void }) {
  return (
    <div
      className="relative z-[60] text-white text-center py-2.5 px-4 text-sm font-medium"
      style={{ background: bg }}
    >
      <span>{text}</span>
      <button
        onClick={onClose}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function SeasonalThemeOverlay() {
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "seasonal_theme")
        .maybeSingle();
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value) as ThemeConfig;
          if (parsed.active) setConfig(parsed);
        } catch {}
      }
    };
    fetchTheme();
  }, []);

  // Apply color overrides
  useEffect(() => {
    if (!config?.showColors) return;
    const theme = SEASONAL_THEMES[config.id];
    if (!theme) return;

    const root = document.documentElement;
    const originals: Record<string, string> = {};
    
    Object.entries(theme.colorOverrides).forEach(([prop, val]) => {
      originals[prop] = root.style.getPropertyValue(prop);
      root.style.setProperty(prop, val);
    });

    return () => {
      Object.entries(originals).forEach(([prop, val]) => {
        if (val) root.style.setProperty(prop, val);
        else root.style.removeProperty(prop);
      });
    };
  }, [config]);

  if (!config) return null;

  const theme = SEASONAL_THEMES[config.id];
  if (!theme) return null;

  return (
    <>
      {config.showBanner && !bannerDismissed && (
        <ThemeBanner
          text={config.bannerText || theme.bannerText}
          bg={theme.bannerBg}
          onClose={() => setBannerDismissed(true)}
        />
      )}
      {config.showOverlay && <FloatingParticles particles={theme.particles} />}
    </>
  );
}
