import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth via shared API key
  const apiKey = req.headers.get("x-api-key");
  const SHARED_API_KEY = Deno.env.get("SHARED_API_KEY");
  if (!SHARED_API_KEY || apiKey !== SHARED_API_KEY) {
    return err("Unauthorized", 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  // Path after /public-api/
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Find index of "public-api" and get everything after
  const apiIndex = pathParts.indexOf("public-api");
  const route = pathParts.slice(apiIndex + 1);
  const resource = route[0] || "";
  const id = route[1] || null;
  const method = req.method;

  const ALLOWED_TABLES = ["bookings", "orders", "products", "workshop_availability", "store_sections"];

  if (!ALLOWED_TABLES.includes(resource)) {
    return err(`Unknown resource: ${resource}. Allowed: ${ALLOWED_TABLES.join(", ")}`, 404);
  }

  try {
    // GET - list or get by id
    if (method === "GET") {
      if (id) {
        const { data, error } = await supabase.from(resource).select("*").eq("id", id).single();
        if (error) return err(error.message, 404);
        return json(data);
      }
      // Support query params for filtering
      let query = supabase.from(resource).select("*");
      const status = url.searchParams.get("status");
      if (status) query = query.eq("status", status);
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) return err(error.message, 500);
      return json(data);
    }

    // POST - create
    if (method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase.from(resource).insert(body).select().single();
      if (error) return err(error.message, 422);
      return json(data, 201);
    }

    // PATCH/PUT - update by id
    if ((method === "PATCH" || method === "PUT") && id) {
      const body = await req.json();
      const { data, error } = await supabase.from(resource).update(body).eq("id", id).select().single();
      if (error) return err(error.message, 422);
      return json(data);
    }

    // DELETE by id
    if (method === "DELETE" && id) {
      const { error } = await supabase.from(resource).delete().eq("id", id);
      if (error) return err(error.message, 500);
      return json({ deleted: true });
    }

    return err("Method not allowed or missing ID", 405);
  } catch (e) {
    console.error("API error:", e);
    return err("Internal server error", 500);
  }
});
