import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GalleryImage = { url: string; alt: string; size?: "large" | "medium" };

const GALLERY_KEYS = [
  "gallery_moments",
  "gallery_about",
  "gallery_workshop_handbuilding",
  "gallery_workshop_pottery",
  "gallery_workshop_embroidery",
] as const;

export type GalleryKey = (typeof GALLERY_KEYS)[number];

export function useSiteGallery(key: GalleryKey) {
  const [images, setImages] = useState<GalleryImage[] | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setImages(parsed);
            }
          } catch { /* fallback to null */ }
        }
      });
  }, [key]);

  return images;
}
