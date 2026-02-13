import { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const langs: { code: Language; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "العربية", short: "AR" },
  { code: "es", label: "Español", short: "ES" },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const currentLang = langs.find((l) => l.code === language);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Options */}
      <div
        className={cn(
          "absolute bottom-16 right-0 flex flex-col gap-2 transition-all duration-300",
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        {langs
          .filter((l) => l.code !== language)
          .map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setOpen(false);
              }}
              className="flex items-center gap-2 bg-foreground/90 backdrop-blur-md text-white text-sm px-4 py-2.5 rounded-full shadow-lg border border-white/10 hover:scale-105 transition-transform whitespace-nowrap"
            >
              <span className="font-bold text-xs">{l.short}</span>
              <span className="text-white/70 text-xs">{l.label}</span>
            </button>
          ))}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "h-12 px-4 rounded-full bg-foreground/90 text-white shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 border border-white/10",
          open && "ring-2 ring-cta"
        )}
        aria-label="Switch language"
      >
        <Globe size={18} />
        <span className="text-sm font-bold">{currentLang?.short}</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
