import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["errachidyothmane@gmail.com", "terraria.socials@gmail.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Configured mode controls which scheduled cron is allowed to fire.
    // - "morning_of": cron runs at 09:00 UTC, targets bookings happening today
    // - "evening_before": cron runs at 18:00 UTC, targets bookings happening tomorrow
    let configuredMode: "evening_before" | "morning_of" = "morning_of";
    try {
      const { data: setting } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", "booking_reminder_mode")
        .maybeSingle();
      if (setting?.value === "evening_before" || setting?.value === "morning_of") {
        configuredMode = setting.value;
      }
    } catch (_) { /* ignore, use default */ }

    // The cron passes its own mode in the body. If absent, fall back to configured.
    let invokedMode: "evening_before" | "morning_of" | null = null;
    let force = false;
    try {
      if (req.headers.get("content-type")?.includes("application/json")) {
        const body = await req.clone().json().catch(() => null);
        if (body?.mode === "evening_before" || body?.mode === "morning_of") {
          invokedMode = body.mode;
        }
        if (body?.force === true) force = true;
      }
    } catch (_) { /* ignore */ }

    const mode = invokedMode ?? configuredMode;

    // If a cron call's mode doesn't match the configured mode, skip silently.
    // This lets both crons stay scheduled while only the active one sends.
    if (invokedMode && invokedMode !== configuredMode && !force) {
      console.log(`Skipping: invoked mode=${invokedMode} != configured=${configuredMode}`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, invokedMode, configuredMode }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // morning_of → target = today (sessions happening today)
    // evening_before → target = tomorrow (sessions happening tomorrow)
    const target = new Date();
    if (mode === "evening_before") target.setDate(target.getDate() + 1);
    const targetStr = target.toISOString().split("T")[0];

    console.log(`Reminder mode: ${mode}, target date: ${targetStr}`);

    const { data: bookings, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .eq("booking_date", targetStr);

    if (fetchError) {
      console.error("Failed to fetch bookings:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch bookings" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!bookings || bookings.length === 0) {
      console.log(`No confirmed bookings for ${targetStr}`);
      return new Response(JSON.stringify({ success: true, reminders: 0, mode }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${bookings.length} confirmed bookings for ${targetStr}`);

    // Idempotency keys include the mode so a manual mode switch can re-send
    // without colliding with a previous run for the same date.
    const idemSuffix = `${targetStr}-${mode}`;

    // 1) Customer reminders — branded, idempotent per booking + date + mode
    const customerResults = await Promise.allSettled(
      bookings
        .filter((b: any) => b.email && typeof b.email === "string" && b.email.includes("@"))
        .map(async (b: any) => {
          const { error } = await supabaseAdmin.functions.invoke("send-transactional-email", {
            body: {
              templateName: "booking-reminder",
              recipientEmail: b.email,
              idempotencyKey: `booking-reminder-${b.id}-${idemSuffix}`,
              templateData: {
                name: b.name,
                workshop: b.workshop,
                date: b.booking_date,
                participants: b.participants || 1,
                city: b.city,
                sessionInfo: b.session_info,
                mode,
              },
            },
          });
          if (error) throw error;
        }),
    );
    const customerSent = customerResults.filter((r) => r.status === "fulfilled").length;
    const customerFailed = customerResults.filter((r) => r.status === "rejected").length;

    // 2) Admin recap — one branded email per admin, idempotent per day + mode
    const adminPayload = {
      date: targetStr,
      mode,
      bookings: bookings.map((b: any) => ({
        name: b.name,
        workshop: b.workshop,
        participants: b.participants || 1,
        phone: b.phone,
        email: b.email,
        city: b.city,
        sessionInfo: b.session_info,
      })),
    };

    const adminResults = await Promise.allSettled(
      ADMIN_EMAILS.map(async (adminEmail) => {
        const { error } = await supabaseAdmin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "booking-admin-reminder",
            recipientEmail: adminEmail,
            idempotencyKey: `booking-admin-reminder-${idemSuffix}-${adminEmail}`,
            templateData: adminPayload,
          },
        });
        if (error) throw error;
      })
    );
    const adminSent = adminResults.filter((r) => r.status === "fulfilled").length;

    console.log(
      `Reminders (${mode}) for ${targetStr}: customers ${customerSent}/${bookings.length} (failed ${customerFailed}), admins ${adminSent}/${ADMIN_EMAILS.length}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        date: targetStr,
        bookings: bookings.length,
        customer_emails_sent: customerSent,
        customer_emails_failed: customerFailed,
        admin_emails_sent: adminSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Booking reminder error:", error);
    return new Response(JSON.stringify({ error: "Failed to send reminders" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
