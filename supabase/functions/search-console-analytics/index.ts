import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_search_console/webmasters/v3";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const GSC_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
    if (!GSC_KEY) throw new Error("GOOGLE_SEARCH_CONSOLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Auth: signed-in admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claims } = await createClient(SUPABASE_URL, ANON_KEY).auth.getClaims(token);
    const userId = claims?.claims?.sub;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (isAdmin !== true) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action: string = body.action || "queries";
    const days: number = Math.min(Math.max(parseInt(body.days ?? "28", 10) || 28, 1), 90);
    const siteUrl: string = body.siteUrl || "https://terrariaworkshops.lovable.app/";
    const filterTerm: string = (body.filter || "tetouan").toLowerCase();

    const headers = {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GSC_KEY,
      "Content-Type": "application/json",
    };

    // Sites list
    if (action === "sites") {
      const r = await fetch(`${GATEWAY_URL}/sites`, { headers });
      const j = await r.json();
      return new Response(JSON.stringify(j), {
        status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const encoded = encodeURIComponent(siteUrl);

    if (action === "timeseries") {
      // Daily clicks/impressions for queries containing filterTerm
      const payload = {
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions: ["date"],
        dimensionFilterGroups: [{
          filters: [{ dimension: "query", operator: "contains", expression: filterTerm }],
        }],
        rowLimit: 1000,
      };
      const r = await fetch(`${GATEWAY_URL}/sites/${encoded}/searchAnalytics/query`, {
        method: "POST", headers, body: JSON.stringify(payload),
      });
      const j = await r.json();
      return new Response(JSON.stringify(j), {
        status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // default: queries breakdown
    const payload = {
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions: ["query"],
      dimensionFilterGroups: [{
        filters: [{ dimension: "query", operator: "contains", expression: filterTerm }],
      }],
      rowLimit: 250,
    };
    const r = await fetch(`${GATEWAY_URL}/sites/${encoded}/searchAnalytics/query`, {
      method: "POST", headers, body: JSON.stringify(payload),
    });
    const j = await r.json();
    return new Response(JSON.stringify(j), {
      status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("search-console-analytics error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
