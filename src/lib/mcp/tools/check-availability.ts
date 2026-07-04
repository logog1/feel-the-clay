import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "check_workshop_availability",
  title: "Check workshop availability",
  description:
    "Check upcoming available time slots for a Terraria workshop between two dates. Returns date, time, and remaining capacity per slot.",
  inputSchema: {
    workshop_slug: z
      .string()
      .describe("Workshop slug (e.g. 'pottery-experience', 'zellij', 'handbuilding')."),
    from_date: z.string().describe("Start date, ISO format YYYY-MM-DD."),
    to_date: z.string().describe("End date, ISO format YYYY-MM-DD."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ workshop_slug, from_date, to_date }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase.rpc("get_terraria_availability", {
      p_workshop_slug: workshop_slug,
      p_from_date: from_date,
      p_to_date: to_date,
    });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { slots: data ?? [] },
    };
  },
});
