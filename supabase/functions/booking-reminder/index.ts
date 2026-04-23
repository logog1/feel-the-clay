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

    // Idempotency suffix: target date + mode → ensures one send per booking per day per mode
    const idemSuffix = `${targetStr}-${mode}`;

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

    // Read fallback toggle: "off" | "on_failure" | "always"
    let fallbackMode: "off" | "on_failure" | "always" = "off";
    try {
      const { data: setting } = await supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", "booking_reminder_sms_fallback")
        .maybeSingle();
      if (setting?.value === "on_failure" || setting?.value === "always" || setting?.value === "off") {
        fallbackMode = setting.value;
      }
    } catch (_) { /* ignore */ }

    const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_FROM = Deno.env.get("TWILIO_WHATSAPP_NUMBER"); // e.g. "whatsapp:+14155238886"
    const twilioReady = !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM);

    function normalizePhone(raw?: string | null): string | null {
      if (!raw) return null;
      const trimmed = raw.trim().replace(/[\s\-()]/g, "");
      if (!trimmed) return null;
      // Already E.164
      if (/^\+\d{8,15}$/.test(trimmed)) return trimmed;
      // Moroccan local format starting with 0 → +212
      if (/^0\d{9}$/.test(trimmed)) return `+212${trimmed.slice(1)}`;
      return null;
    }

    async function sendTwilioMessage(toPhone: string, body: string, channel: "whatsapp" | "sms") {
      if (!twilioReady) throw new Error("Twilio not configured");
      const to = channel === "whatsapp" ? `whatsapp:${toPhone}` : toPhone;
      const from = channel === "whatsapp"
        ? (TWILIO_FROM!.startsWith("whatsapp:") ? TWILIO_FROM! : `whatsapp:${TWILIO_FROM}`)
        : TWILIO_FROM!.replace(/^whatsapp:/, "");
      const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ To: to, From: from, Body: body }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(`Twilio ${channel} ${res.status}: ${JSON.stringify(data)}`);
      return data;
    }

    function buildReminderText(b: any): string {
      const greet = b.name ? `Hi ${b.name},` : "Hi,";
      const when = mode === "evening_before" ? "tomorrow" : "today";
      const session = b.session_info ? ` (${b.session_info})` : "";
      const where = b.city ? ` in ${b.city}` : "";
      return `${greet} a friendly reminder from Terraria Workshops: your ${b.workshop}${session}${where} is ${when} (${b.booking_date}). Wear clothes you don't mind getting clay on, and arrive 5 min early. Reply here if anything changed.`;
    }

    let smsSent = 0;
    let smsFailed = 0;
    let smsSkipped = 0;

    // 1) Customer reminders — email first, optional WhatsApp/SMS fallback
    const customerResults = await Promise.allSettled(
      bookings.map(async (b: any) => {
        const hasEmail = b.email && typeof b.email === "string" && b.email.includes("@");
        let emailOk = false;
        let emailError: any = null;

        if (hasEmail) {
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
          if (error) emailError = error;
          else emailOk = true;
        }

        // Decide whether to send WhatsApp/SMS fallback
        const shouldFallback =
          fallbackMode === "always" ||
          (fallbackMode === "on_failure" && (!hasEmail || !emailOk));

        if (shouldFallback) {
          const phone = normalizePhone(b.phone);
          if (!phone) {
            smsSkipped++;
          } else if (!twilioReady) {
            smsSkipped++;
            console.warn(`Twilio not configured, skipping fallback for booking ${b.id}`);
          } else {
            const text = buildReminderText(b);
            // Try WhatsApp first, fall back to SMS on failure
            try {
              await sendTwilioMessage(phone, text, "whatsapp");
              smsSent++;
            } catch (waErr) {
              console.warn(`WhatsApp failed for ${b.id}, trying SMS:`, waErr);
              try {
                await sendTwilioMessage(phone, text, "sms");
                smsSent++;
              } catch (smsErr) {
                smsFailed++;
                console.error(`SMS also failed for ${b.id}:`, smsErr);
              }
            }
          }
        }

        if (hasEmail && !emailOk) throw emailError;
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
      `Reminders (${mode}, fallback=${fallbackMode}) for ${targetStr}: customers ${customerSent}/${bookings.length} (failed ${customerFailed}), sms ${smsSent} sent / ${smsFailed} failed / ${smsSkipped} skipped, admins ${adminSent}/${ADMIN_EMAILS.length}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        fallback_mode: fallbackMode,
        date: targetStr,
        bookings: bookings.length,
        customer_emails_sent: customerSent,
        customer_emails_failed: customerFailed,
        sms_sent: smsSent,
        sms_failed: smsFailed,
        sms_skipped: smsSkipped,
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
