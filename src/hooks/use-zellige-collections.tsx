import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ZelligeCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  colors: Record<string, string>;
  is_published: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export function useZelligeCollections(opts?: { publishedOnly?: boolean }) {
  const [items, setItems] = useState<ZelligeCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = (supabase as any).from("zellige_kit_collections").select("*").order("sort_order").order("created_at");
    if (opts?.publishedOnly) q = q.eq("is_published", true);
    const { data, error } = await q;
    if (!error && data) {
      setItems((data as any[]).map((r) => ({ ...r, colors: r.colors || {} })) as ZelligeCollection[]);
    }
    setLoading(false);
  }, [opts?.publishedOnly]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (input: Partial<ZelligeCollection>) => {
    const payload = {
      name: input.name ?? "New collection",
      slug: input.slug ?? `col-${Math.random().toString(36).slice(2, 7)}`,
      description: input.description ?? "",
      price: input.price ?? 390,
      stock: input.stock ?? 10,
      image_url: input.image_url ?? null,
      colors: input.colors ?? {},
      is_published: input.is_published ?? false,
      sort_order: input.sort_order ?? 999,
    };
    const { data, error } = await (supabase as any).from("zellige_kit_collections").insert(payload).select("*").single();
    if (!error && data) setItems((prev) => [...prev, { ...data, colors: data.colors || {} }]);
    return { data, error };
  }, []);

  const update = useCallback(async (id: string, patch: Partial<ZelligeCollection>) => {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } as ZelligeCollection : c)));
    const { error } = await (supabase as any).from("zellige_kit_collections").update(patch).eq("id", id);
    return { error };
  }, []);

  const remove = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
    await (supabase as any).from("zellige_kit_collections").delete().eq("id", id);
  }, []);

  return { items, loading, reload: load, create, update, remove };
}
