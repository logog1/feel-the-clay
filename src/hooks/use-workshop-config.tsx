import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MultiLang {
  en: string;
  ar: string;
  es: string;
  fr: string;
}

export interface WorkshopConfig {
  title: MultiLang;
  tagline: MultiLang;
  price: string;
  duration: MultiLang;
  drink: MultiLang;
  location: MultiLang;
  descriptions: MultiLang[];
  highlights: MultiLang[];
  is_available: boolean;
  is_popular: boolean;
  promo_enabled: boolean;
  promo_label: string;
  promo_price: string;
}

export type WorkshopId = "pottery" | "handbuilding" | "embroidery";

const WORKSHOP_KEYS: WorkshopId[] = ["pottery", "handbuilding", "embroidery"];

export function emptyMultiLang(): MultiLang {
  return { en: "", ar: "", es: "", fr: "" };
}

export function useWorkshopConfigs() {
  const [configs, setConfigs] = useState<Record<WorkshopId, WorkshopConfig | null>>({
    pottery: null,
    handbuilding: null,
    embroidery: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    setLoading(true);
    const keys = WORKSHOP_KEYS.map((k) => `workshop_config_${k}`);
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", keys);

    const result: Record<string, WorkshopConfig | null> = {
      pottery: null,
      handbuilding: null,
      embroidery: null,
    };

    if (data) {
      for (const row of data) {
        const id = row.key.replace("workshop_config_", "") as WorkshopId;
        try {
          result[id] = JSON.parse(row.value);
        } catch {
          result[id] = null;
        }
      }
    }

    setConfigs(result as Record<WorkshopId, WorkshopConfig | null>);
    setLoading(false);
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return { configs, loading, refetch: fetchConfigs };
}

/** Get a single workshop config for use on the live site */
export function useWorkshopConfig(workshopId: WorkshopId) {
  const [config, setConfig] = useState<WorkshopConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", `workshop_config_${workshopId}`)
        .maybeSingle();

      if (data?.value) {
        try {
          setConfig(JSON.parse(data.value));
        } catch {
          setConfig(null);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [workshopId]);

  return { config, loading };
}
