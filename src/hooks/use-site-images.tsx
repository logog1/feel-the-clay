import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const IMAGE_KEYS = [
  "image_hero_bg",
  "image_workshop_handbuilding",
  "image_workshop_pottery",
  "image_workshop_embroidery",
] as const;

export type SiteImageKey = (typeof IMAGE_KEYS)[number];

export function useSiteImages(keys?: SiteImageKey[]) {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchKeys = keys || [...IMAGE_KEYS];
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", fetchKeys)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((r: any) => {
            if (r.value) map[r.key] = r.value;
          });
          setImages(map);
        }
      });
  }, []);

  return images;
}
