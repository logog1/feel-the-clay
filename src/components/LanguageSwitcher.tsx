import { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const langs: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ar", label: "AR", flag: "🇲🇦" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Options */}
      <div
        className={cn(
          "absolute bottom-14 right-0 flex flex-col gap-2 transition-all duration-300",
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
              className="flex items-center gap-2 bg-card/90 backdrop-blur-md text-foreground text-sm px-4 py-2.5 rounded-full shadow-lg border border-border/30 hover:scale-105 transition-transform"
            >
              <span>{l.flag}</span>
              <span className="font-medium">{l.label}</span>
            </button>
          ))}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-12 h-12 rounded-full bg-terracotta text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
          open && "rotate-180"
        )}
        aria-label="Switch language"
      >
        <Globe size={20} />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
