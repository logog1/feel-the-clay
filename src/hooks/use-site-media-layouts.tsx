import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  createDefaultMediaLayout,
  getMediaLayoutSiteSettingKey,
  parseMediaLayout,
  type MediaLayoutSettings,
} from "@/lib/media-layout";

export function useSiteMediaLayouts(layoutIds: string[]) {
  const [layouts, setLayouts] = useState<Record<string, MediaLayoutSettings>>({});
  const idsKey = useMemo(() => layoutIds.join("|"), [layoutIds]);

  useEffect(() => {
    if (!layoutIds.length) {
      setLayouts({});
      return;
    }

    const fetchLayouts = async () => {
      const settingKeys = layoutIds.map(getMediaLayoutSiteSettingKey);
      const { data } = await supabase.from("site_settings").select("key, value").in("key", settingKeys);

      const nextLayouts = layoutIds.reduce<Record<string, MediaLayoutSettings>>((acc, layoutId) => {
        acc[layoutId] = createDefaultMediaLayout();
        return acc;
      }, {});

      data?.forEach((row) => {
        const layoutId = row.key.replace("media_layout_", "");
        nextLayouts[layoutId] = parseMediaLayout(row.value);
      });

      setLayouts(nextLayouts);
    };

    fetchLayouts();
  }, [idsKey, layoutIds]);

  return layouts;
}
