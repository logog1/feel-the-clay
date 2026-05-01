import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const DEFAULT_LINK = "https://wa.me/message/SBUBJACPVCNGM1";

export const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
