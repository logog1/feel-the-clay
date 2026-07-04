import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_workshops",
  title: "List workshops",
  description:
    "List Terraria Workshops experiences (pottery, zellij, embroidery, carpets, etc.) with their base pricing per city.",
  inputSchema: {
    city: z
      .string()
      .optional()
      .describe("Optional city slug or name to filter pricing (e.g. 'tetouan')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ city }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: cities, error: e1 } = await supabase
      .from("workshop_cities")
      .select("id, slug, name");
    if (e1) return { content: [{ type: "text", text: e1.message }], isError: true };

    const { data: pricing, error: e2 } = await supabase
      .from("workshop_city_pricing")
      .select("workshop_slug, city_id, price, currency, duration_minutes");
    if (e2) return { content: [{ type: "text", text: e2.message }], isError: true };

    const cityMap = new Map((cities ?? []).map((c: any) => [c.id, c]));
    const filtered = (pricing ?? []).filter((p: any) => {
      if (!city) return true;
      const c: any = cityMap.get(p.city_id);
      return c && (c.slug === city.toLowerCase() || c.name?.toLowerCase() === city.toLowerCase());
    });
    const rows = filtered.map((p: any) => ({
      workshop: p.workshop_slug,
      city: (cityMap.get(p.city_id) as any)?.name ?? null,
      price: p.price,
      currency: p.currency,
      duration_minutes: p.duration_minutes,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { workshops: rows },
    };
  },
});
