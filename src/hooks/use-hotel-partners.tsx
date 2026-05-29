import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HotelPartnerPerk = { key: string; enabled: boolean; label: string; desc?: string };

export interface HotelPartner {
  id: string;
  slug: string;
  name: string;
  type: "hotel" | "riad" | "boutique" | string;
  city: string | null;
  brand_color: string;
  logo_url: string | null;
  cover_image: string | null;
  intro_en: string;
  intro_fr: string;
  intro_es: string;
  intro_ar: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  website_url: string | null;
  perks: HotelPartnerPerk[];
  experiences_config: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useHotelPartners() {
  const [partners, setPartners] = useState<HotelPartner[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("hotel_partners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setPartners((data || []) as HotelPartner[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { partners, loading, refresh };
}

export function useHotelPartnerBySlug(slug: string | undefined) {
  const [partner, setPartner] = useState<HotelPartner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("hotel_partners")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      setPartner((data as HotelPartner) || null);
      setLoading(false);
    })();
  }, [slug]);

  return { partner, loading };
}
