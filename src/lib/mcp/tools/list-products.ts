import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_store_products",
  title: "List store products",
  description: "List handmade products available in the Terraria Workshops online store.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max products (default 20)."),
    section: z.string().optional().describe("Optional store section slug filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, section }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let query = supabase
      .from("products")
      .select("id, name, description, price, currency, section, image_url, in_stock")
      .limit(limit ?? 20);
    if (section) query = query.eq("section", section);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
