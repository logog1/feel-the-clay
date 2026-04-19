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

// ---------- Input validation ----------
// Per-resource allowlists of writable fields. Any field not in this list is
// stripped before reaching the database, preventing arbitrary column writes
// from holders of the SHARED_API_KEY (e.g. third-party integrations).
type FieldSpec = {
  type: "string" | "number" | "integer" | "boolean" | "json";
  maxLength?: number;
  required?: boolean;
};

const SCHEMAS: Record<string, Record<string, FieldSpec>> = {
  bookings: {
    name: { type: "string", maxLength: 200, required: true },
    email: { type: "string", maxLength: 320 },
    phone: { type: "string", maxLength: 50 },
    city: { type: "string", maxLength: 100 },
    workshop: { type: "string", maxLength: 100, required: true },
    session_info: { type: "string", maxLength: 500 },
    participants: { type: "integer" },
    booking_date: { type: "string", maxLength: 50 },
    notes: { type: "string", maxLength: 2000 },
    status: { type: "string", maxLength: 50 },
  },
  orders: {
    customer_name: { type: "string", maxLength: 200, required: true },
    customer_phone: { type: "string", maxLength: 50 },
    customer_address: { type: "string", maxLength: 500 },
    region: { type: "string", maxLength: 100 },
    items: { type: "json" },
    subtotal: { type: "number" },
    delivery_fee: { type: "number" },
    grand_total: { type: "number" },
    status: { type: "string", maxLength: 50 },
  },
  products: {
    id: { type: "string", maxLength: 100 },
    name: { type: "string", maxLength: 200, required: true },
    category: { type: "string", maxLength: 100, required: true },
    price: { type: "number" },
    original_price: { type: "number" },
    dimensions: { type: "string", maxLength: 200 },
    images: { type: "json" },
    stock: { type: "integer" },
    is_sold_out: { type: "boolean" },
    is_promotion: { type: "boolean" },
    promotion_label: { type: "string", maxLength: 100 },
  },
  workshop_availability: {
    workshop: { type: "string", maxLength: 100 },
    date: { type: "string", maxLength: 50, required: true },
    is_available: { type: "boolean" },
  },
  store_sections: {
    id: { type: "string", maxLength: 100 },
    title_en: { type: "string", maxLength: 200, required: true },
    title_ar: { type: "string", maxLength: 200 },
    title_es: { type: "string", maxLength: 200 },
    title_fr: { type: "string", maxLength: 200 },
    description_en: { type: "string", maxLength: 1000 },
    description_ar: { type: "string", maxLength: 1000 },
    description_es: { type: "string", maxLength: 1000 },
    description_fr: { type: "string", maxLength: 1000 },
    sort_order: { type: "integer" },
    enabled: { type: "boolean" },
    donation: { type: "boolean" },
  },
};

function validatePayload(
  resource: string,
  body: unknown,
  isUpdate: boolean
): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const schema = SCHEMAS[resource];
  if (!schema) return { ok: false, error: `No schema defined for ${resource}` };

  const input = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [field, spec] of Object.entries(schema)) {
    if (!(field in input)) {
      if (spec.required && !isUpdate) {
        return { ok: false, error: `Missing required field: ${field}` };
      }
      continue;
    }
    const v = input[field];
    if (v === null) {
      out[field] = null;
      continue;
    }
    switch (spec.type) {
      case "string": {
        if (typeof v !== "string") return { ok: false, error: `${field} must be a string` };
        if (spec.maxLength && v.length > spec.maxLength) {
          return { ok: false, error: `${field} exceeds max length ${spec.maxLength}` };
        }
        out[field] = v;
        break;
      }
      case "number": {
        if (typeof v !== "number" || !Number.isFinite(v)) {
          return { ok: false, error: `${field} must be a finite number` };
        }
        out[field] = v;
        break;
      }
      case "integer": {
        if (typeof v !== "number" || !Number.isInteger(v)) {
          return { ok: false, error: `${field} must be an integer` };
        }
        out[field] = v;
        break;
      }
      case "boolean": {
        if (typeof v !== "boolean") return { ok: false, error: `${field} must be a boolean` };
        out[field] = v;
        break;
      }
      case "json": {
        // Accept any JSON-serializable value (objects/arrays); reject functions/undefined
        try {
          JSON.stringify(v);
          out[field] = v;
        } catch {
          return { ok: false, error: `${field} must be JSON-serializable` };
        }
        break;
      }
    }
  }

  if (Object.keys(out).length === 0) {
    return { ok: false, error: "No valid fields provided" };
  }
  return { ok: true, data: out };
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
  const pathParts = url.pathname.split("/").filter(Boolean);
  const apiIndex = pathParts.indexOf("public-api");
  const route = pathParts.slice(apiIndex + 1);
  const resource = route[0] || "";
  const id = route[1] || null;
  const method = req.method;

  const ALLOWED_TABLES = Object.keys(SCHEMAS);

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
      let query = supabase.from(resource).select("*");
      const status = url.searchParams.get("status");
      if (status) query = query.eq("status", status);
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
      const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0);
      query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) return err(error.message, 500);
      return json(data);
    }

    // POST - create
    if (method === "POST") {
      const body = await req.json().catch(() => null);
      const result = validatePayload(resource, body, false);
      if (!result.ok) return err(result.error, 400);
      const { data, error } = await supabase.from(resource).insert(result.data).select().single();
      if (error) return err(error.message, 422);
      return json(data, 201);
    }

    // PATCH/PUT - update by id
    if ((method === "PATCH" || method === "PUT") && id) {
      const body = await req.json().catch(() => null);
      const result = validatePayload(resource, body, true);
      if (!result.ok) return err(result.error, 400);
      const { data, error } = await supabase.from(resource).update(result.data).eq("id", id).select().single();
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
