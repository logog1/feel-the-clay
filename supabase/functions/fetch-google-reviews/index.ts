import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!GOOGLE_PLACES_API_KEY) {
      return new Response(JSON.stringify({ error: "Google Places API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SHARED_API_KEY = Deno.env.get("SHARED_API_KEY");
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Authorization: cron with x-api-key OR signed-in admin user.
    const apiKeyHeader = req.headers.get("x-api-key");
    const authHeader = req.headers.get("Authorization");
    let authorized = false;
    if (SHARED_API_KEY && apiKeyHeader && apiKeyHeader === SHARED_API_KEY) {
      authorized = true;
    } else if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, "");
        const { data: claimsData } = await createClient(SUPABASE_URL, ANON_KEY).auth.getClaims(token);
        const userId = claimsData?.claims?.sub;
        if (userId) {
          const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" });
          if (isAdmin === true) authorized = true;
        }
      } catch (_) { /* deny */ }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // Terraria Workshops Place ID — update if needed
    const PLACE_ID = Deno.env.get("GOOGLE_PLACE_ID") || "ChIJD8xMdCYlsQ0RjIyMjIxeXno";

    // Fetch reviews from Google Places API (New)
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${GOOGLE_PLACES_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.result?.reviews) {
      console.error("Google Places API error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Failed to fetch reviews", details: data.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviews = data.result.reviews;

    // Cache in database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Clear old reviews and insert fresh ones
    await supabaseAdmin.from("google_reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const rows = reviews.map((r: any) => ({
      author_name: r.author_name,
      rating: r.rating,
      text: r.text || "",
      relative_time_description: r.relative_time_description,
      profile_photo_url: r.profile_photo_url,
    }));

    const { error: insertError } = await supabaseAdmin.from("google_reviews").insert(rows);
    if (insertError) {
      console.error("Insert error:", insertError);
    }

    return new Response(JSON.stringify({ success: true, count: reviews.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
