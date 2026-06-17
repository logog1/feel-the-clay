import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/social";

const DEFAULT_LINK = "https://wa.me/message/SBUBJACPVCNGM1";

// Re-export so existing imports from this module keep working.
export { WhatsAppIcon };

let cachedLink: string | null = null;

/**
 * Returns the configured public WhatsApp link (admin Settings → Website Contact Info).
 * Falls back to the default wa.me link.
 */
export function useWhatsAppLink() {
  const [link, setLink] = useState<string>(cachedLink ?? DEFAULT_LINK);

  useEffect(() => {
    if (cachedLink) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "public_whatsapp")
        .maybeSingle();
      const v = (data?.value || "").trim();
      if (v) {
        cachedLink = v;
        if (!cancelled) setLink(v);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return link;
}

/**
 * Build a WhatsApp click-to-chat URL that pre-fills a message.
 * Accepts either a wa.me/<number> link, a wa.me/message/<code> link, or a full https://wa.me/... URL.
 * For the /message/ short-link variant, WhatsApp ignores ?text=, so we keep it as-is.
 */
export function buildWhatsAppUrl(baseLink: string, message: string): string {
  if (!baseLink) return DEFAULT_LINK;
  const trimmed = baseLink.trim();
  // wa.me /message/ short links don't accept ?text=
  if (/wa\.me\/message\//i.test(trimmed)) return trimmed;
  const encoded = encodeURIComponent(message);
  return trimmed.includes("?")
    ? `${trimmed}&text=${encoded}`
    : `${trimmed}?text=${encoded}`;
}

interface BookOnWhatsAppProps {
  workshopName?: string;
  variant?: "primary" | "secondary" | "compact" | "ghost";
  fullWidth?: boolean;
  label?: string;
  className?: string;
}

const BookOnWhatsApp = ({
  workshopName,
  variant = "secondary",
  fullWidth = false,
  label,
  className,
}: BookOnWhatsAppProps) => {
  const link = useWhatsAppLink();
  const message = workshopName
    ? `Hi! I'd like to book the ${workshopName} workshop. Could you share availability and details?`
    : "Hi! I'd like to book a workshop. Could you share availability?";
  const href = buildWhatsAppUrl(link, message);

  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 active:scale-95";
  const variants: Record<string, string> = {
    primary:
      "bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/25 px-5 py-3 text-sm",
    secondary:
      "bg-white text-[#075E54] border-2 border-[#25D366]/40 hover:bg-[#25D366]/10 px-4 py-2.5 text-sm",
    compact:
      "bg-[#25D366] text-white hover:bg-[#20bd5a] px-3 py-1.5 text-xs",
    ghost:
      "bg-transparent text-[#075E54] hover:bg-[#25D366]/10 px-3 py-1.5 text-xs",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label || "Book on WhatsApp"}
      className={cn(base, variants[variant], fullWidth && "w-full", className)}
    >
      <WhatsAppIcon className={variant === "compact" || variant === "ghost" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      <span>{label || "Book on WhatsApp"}</span>
    </a>
  );
};

export default BookOnWhatsApp;
