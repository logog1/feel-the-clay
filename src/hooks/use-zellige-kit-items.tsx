import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ZelligeKitKind = "piece" | "color" | "preset";

export interface ZelligeKitItem {
  id: string;
  kind: ZelligeKitKind;
  key: string;
  label: string | null;
  is_available: boolean;
  sort_order: number;
}

export function useZelligeKitItems(opts?: { adminMode?: boolean }) {
  const [items, setItems] = useState<ZelligeKitItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // RLS filters available items for non-admins; admins see all.
    // We ask for everything and let the DB filter.
    const { data, error } = await (supabase as any)
      .from("zellige_kit_items")
      .select("id, kind, key, label, is_available, sort_order")
      .order("kind", { ascending: true })
      .order("sort_order", { ascending: true });
    if (!error && data) setItems(data as ZelligeKitItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setAvailable = useCallback(async (id: string, is_available: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_available } : i)));
    await (supabase as any).from("zellige_kit_items").update({ is_available }).eq("id", id);
  }, []);

  const byKind = (kind: ZelligeKitKind) => items.filter((i) => i.kind === kind);

  return { items, byKind, loading, reload: load, setAvailable };
}
