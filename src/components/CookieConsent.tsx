import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show after a short delay so it doesn't block first paint
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    // If already accepted, ensure FB pixel is active
    if (consent === "accepted") {
      enableTracking();
    }
  }, []);

  const enableTracking = () => {
    // Re-enable FB pixel if it was blocked
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("consent", "grant");
    }
  };

  const disableTracking = () => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("consent", "revoke");
    }
  };

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    enableTracking();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    disableTracking();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-6 md:max-w-sm z-40",
        "glass-card p-4 shadow-xl border border-border/40",
        "animate-fade-up"
      )}
    >
      <p className="text-xs text-foreground/80 leading-relaxed mb-3">
        We use cookies to analyze site traffic and improve your experience. You can accept or decline non-essential cookies.
      </p>
      <div className="flex gap-2">
        <Button
          onClick={decline}
          variant="outline"
          size="sm"
          className="flex-1 text-xs rounded-xl h-8"
        >
          Decline
        </Button>
        <Button
          onClick={accept}
          size="sm"
          className="flex-1 text-xs rounded-xl h-8 bg-cta hover:bg-cta-hover text-white"
        >
          Accept
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
