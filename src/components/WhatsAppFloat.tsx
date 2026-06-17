import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useWhatsAppLink } from "@/components/BookOnWhatsApp";
import { WhatsAppIcon } from "@/components/icons/social";

const HIDDEN_PATHS = ["/feedback"];

const WhatsAppFloat = () => {
  // useLocation reacts to React Router navigation — we previously polled
  // window.location.pathname every 500ms because popstate doesn't fire on
  // pushState. The poll ran for the lifetime of every page; this replaces it.
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const link = useWhatsAppLink();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 250);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const pulseTimer = setTimeout(() => setPulse(false), 12000);
    const labelTimer = setTimeout(() => setShowLabel(false), 8000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(pulseTimer);
      clearTimeout(labelTimer);
    };
  }, []);

  if (HIDDEN_PATHS.includes(pathname)) return null;
  if (!visible) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book on WhatsApp"
      onClick={() => setShowLabel(false)}
      className={cn(
        "fixed bottom-6 left-6 z-50 flex items-center gap-2 pl-3 pr-4 py-2.5",
        "rounded-full shadow-xl transition-all duration-300",
        "hover:scale-105 hover:shadow-2xl",
        "bg-[#25D366] text-white",
        pulse && "animate-bounce",
      )}
    >
      <WhatsAppIcon size={20} />
      <span
        className={cn(
          "text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-500",
          showLabel ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0",
        )}
      >
        Book on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppFloat;
