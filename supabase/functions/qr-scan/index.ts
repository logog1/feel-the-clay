import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const Body = z.object({
  slug: z.string().min(1).max(120),
  variant: z.string().max(60).optional().nullable(),
  session_id: z.string().max(64).optional().nullable(),
});

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { slug, variant, session_id } = parsed.data;

    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // resolve partner
    const { data: partner, error: pErr } = await supa
      .from("hotel_partners")
      .select("id, name")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (pErr || !partner) {
      return new Response(JSON.stringify({ error: "Property not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // resolve variant (optional)
    let variant_code: string | null = null;
    let variant_label: string | null = null;
    let variant_scope: string | null = "property";
    if (variant) {
      const { data: v } = await supa
        .from("partner_qr_variants")
        .select("code, label, scope")
        .eq("partner_id", partner.id)
        .eq("code", variant)
        .eq("is_active", true)
        .maybeSingle();
      if (v) {
        variant_code = v.code;
        variant_label = v.label;
        variant_scope = v.scope;
      } else {
        // accept unknown variant slug, label it as raw
        variant_code = variant;
        variant_label = variant;
        variant_scope = "property";
      }
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const ua = req.headers.get("user-agent") || "";
    const ip_hash = ip ? await sha256(ip + "::" + ua) : null;
    const sid = session_id || crypto.randomUUID();

    // Ad-hoc rate limit: max 10 scans per (partner, variant, ip_hash) per minute.
    // Prevents casual scan inflation that would skew conversion analytics.
    if (ip_hash) {
      const sinceIso = new Date(Date.now() - 60_000).toISOString();
      const { count } = await supa
        .from("qr_scan_log")
        .select("id", { count: "exact", head: true })
        .eq("partner_id", partner.id)
        .eq("ip_hash", ip_hash)
        .eq("variant_code", variant_code)
        .gte("created_at", sinceIso);
      if ((count ?? 0) >= 10) {
        return new Response(
          JSON.stringify({ partner_id: partner.id, session_id: sid, variant_code, variant_scope, throttled: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    await supa.from("qr_scan_log").insert({
      partner_id: partner.id,
      variant_code,
      variant_label,
      variant_scope,
      ip_hash,
      session_id: sid,
      user_agent: ua.slice(0, 300),
      referrer: req.headers.get("referer")?.slice(0, 300) || null,
    });


    return new Response(JSON.stringify({
      partner_id: partner.id,
      session_id: sid,
      variant_code,
      variant_scope,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
