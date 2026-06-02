import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "Missing auth" }, 401);

    // Verify caller and admin status
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const action = body.action as "invite" | "remove";
    const partnerId = body.partner_id as string;
    if (!partnerId) return json({ error: "partner_id required" }, 400);

    if (action === "remove") {
      const staffId = body.staff_id as string;
      const { error } = await admin.from("partner_staff").delete().eq("id", staffId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // invite flow
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return json({ error: "email required" }, 400);

    // Find or invite user
    let targetUserId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const match = list?.users?.find((u) => (u.email || "").toLowerCase() === email);
    if (match) {
      targetUserId = match.id;
    } else {
      const redirectTo = body.redirect_to || `${new URL(req.url).origin}`;
      const { data: invited, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
      });
      if (invErr || !invited.user) return json({ error: invErr?.message || "Invite failed" }, 400);
      targetUserId = invited.user.id;
    }

    // Ensure hotel_staff role
    const { data: existingRole } = await admin
      .from("user_roles")
      .select("id, role")
      .eq("user_id", targetUserId)
      .maybeSingle();
    if (!existingRole) {
      await admin.from("user_roles").insert({ user_id: targetUserId, role: "hotel_staff" });
    } else if (existingRole.role !== "admin" && existingRole.role !== "hotel_staff") {
      await admin.from("user_roles").update({ role: "hotel_staff" }).eq("id", existingRole.id);
    }

    // Upsert assignment
    const { error: linkErr } = await admin
      .from("partner_staff")
      .upsert({ partner_id: partnerId, user_id: targetUserId, email }, { onConflict: "partner_id,user_id" });
    if (linkErr) return json({ error: linkErr.message }, 400);

    return json({ ok: true, user_id: targetUserId, invited: !match });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
