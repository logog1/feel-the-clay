import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CUSTOMIZE_KEY = "kit_zellige_customize_enabled";

export function useKitZelligeSettings() {
  const [customizeEnabled, setCustomizeEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("site_settings")
      .select("key, value")
      .eq("key", CUSTOMIZE_KEY)
      .maybeSingle();
    setCustomizeEnabled(data?.value === "true");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setCustomize = useCallback(async (enabled: boolean) => {
    setCustomizeEnabled(enabled);
    await (supabase as any)
      .from("site_settings")
      .upsert({ key: CUSTOMIZE_KEY, value: enabled ? "true" : "false" }, { onConflict: "key" });
  }, []);

  return { customizeEnabled, setCustomize, loading, reload: load };
}
