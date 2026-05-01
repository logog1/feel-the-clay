import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Renders an admin-configured booking widget for a specific workshop.
 *
 * Admin can paste raw embed HTML into site_settings under one of these keys:
 *   booking_embed_<slug>           (workshop-specific override)
 *   booking_embed_default          (used when no per-workshop override)
 *
 * If neither is set, nothing renders. The form below the embed (or a WhatsApp
 * CTA elsewhere on the page) remains the booking path.
 *
 * Supports FareHarbor (script + <a class="fh-...">), Bokun
 * (data-src widget div + script), or any other provider's snippet.
 *
 * SECURITY: Embed HTML is set ONLY via admin Settings (RLS protected). It is
 * inserted with innerHTML; admins are trusted operators.
 */

interface BookingEmbedProps {
  workshopSlug?: string;
  className?: string;
}

const BookingEmbed = ({ workshopSlug, className }: BookingEmbedProps) => {
  const [embed, setEmbed] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const keys = workshopSlug
        ? [`booking_embed_${workshopSlug}`, "booking_embed_default"]
        : ["booking_embed_default"];
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", keys);
      if (cancelled) return;
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => {
        if (r?.value) map[r.key] = r.value;
      });
      const html =
        (workshopSlug && map[`booking_embed_${workshopSlug}`]) ||
        map["booking_embed_default"] ||
        "";
      setEmbed(html.trim());
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [workshopSlug]);

  // Re-execute any <script> tags found in the embed HTML.
  useEffect(() => {
    if (!embed) return;
    const container = document.getElementById(`booking-embed-${workshopSlug || "default"}`);
    if (!container) return;
    const scripts = Array.from(container.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value),
      );
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [embed, workshopSlug]);

  if (!loaded || !embed) return null;

  return (
    <div className={className}>
      <div
        id={`booking-embed-${workshopSlug || "default"}`}
        // Admin-managed trusted HTML
        dangerouslySetInnerHTML={{ __html: embed }}
      />
    </div>
  );
};

export default BookingEmbed;
