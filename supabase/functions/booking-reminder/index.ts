import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Get contacts from settings
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["notification_email", "whatsapp_numbers"]);
    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((s: any) => { settingsMap[s.key] = s.value; });
    const toEmail = settingsMap["notification_email"] || "contact.terraria@gmail.com";
    const whatsappNumbers = (settingsMap["whatsapp_numbers"] || "")
      .split(",").map((s: string) => s.trim()).filter(Boolean);

    // Find confirmed bookings for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .eq("booking_date", tomorrowStr);

    if (!bookings || bookings.length === 0) {
      console.log(`No confirmed bookings for ${tomorrowStr}`);
      return new Response(JSON.stringify({ success: true, reminders: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${bookings.length} bookings for ${tomorrowStr}`);

    // ── Send branded reminder email to each customer (idempotent per booking+date) ──
    const customerEmailResults = await Promise.allSettled(
      bookings
        .filter((b: any) => b.email && typeof b.email === "string" && b.email.includes("@"))
        .map(async (b: any) => {
          const { error } = await supabaseAdmin.functions.invoke("send-transactional-email", {
            body: {
              templateName: "booking-reminder",
              recipientEmail: b.email,
              idempotencyKey: `booking-reminder-${b.id}-${tomorrowStr}`,
              templateData: {
                name: b.name,
                workshop: b.workshop,
                date: b.booking_date,
                participants: b.participants || 1,
                city: b.city,
                sessionInfo: b.session_info,
              },
            },
          });
          if (error) throw error;
        }),
    );
    const customerEmailsSent = customerEmailResults.filter((r) => r.status === "fulfilled").length;
    const customerEmailsFailed = customerEmailResults.filter((r) => r.status === "rejected").length;
    if (customerEmailsFailed > 0) {
      console.error(`${customerEmailsFailed} customer reminder emails failed to enqueue`);
    }

    // ── Admin recap email + WhatsApp (existing behavior) ──
    const bookingLines = bookings.map((b: any) =>
      `• ${b.name} — ${b.workshop} (${b.participants || 1} pax) ${b.session_info ? `[${b.session_info}]` : ""}`
    ).join("\n");

    const emailBody = `
      <h2 style="font-family:sans-serif;color:#333;">⏰ Booking Reminder — Tomorrow (${tomorrowStr})</h2>
      <p style="font-family:sans-serif;">You have <strong>${bookings.length}</strong> confirmed booking(s) for tomorrow:</p>
      <ul style="font-family:sans-serif;">
        ${bookings.map((b: any) => `<li><strong>${b.name}</strong> — ${b.workshop} (${b.participants || 1} participants) ${b.phone ? `📱 ${b.phone}` : ""}</li>`).join("")}
      </ul>
      <p style="font-family:sans-serif;color:#888;font-size:12px;">Auto-reminder by Terraria Workshops • Customer reminders sent: ${customerEmailsSent}</p>
    `;

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Terraria <onboarding@resend.dev>",
          to: [toEmail],
          subject: `⏰ ${bookings.length} booking(s) tomorrow — ${tomorrowStr}`,
          html: emailBody,
        }),
      });
    }

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER) {
      const whatsappMsg = `⏰ *Booking Reminder — Tomorrow*\n\n${bookingLines}\n\n📅 ${tomorrowStr}`;
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      const fromNumber = `whatsapp:${TWILIO_WHATSAPP_NUMBER.startsWith('+') ? '' : '+'}${TWILIO_WHATSAPP_NUMBER}`;

      await Promise.allSettled(
        whatsappNumbers.map(async (toNumber) => {
          const body = new URLSearchParams({
            From: fromNumber,
            To: `whatsapp:${toNumber.startsWith('+') ? '' : '+'}${toNumber}`,
            Body: whatsappMsg,
          });
          await fetch(twilioUrl, {
            method: "POST",
            headers: {
              Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          });
        })
      );
    }

    console.log(`Sent ${bookings.length} booking reminders for ${tomorrowStr} (customer emails: ${customerEmailsSent}/${bookings.length})`);

    return new Response(
      JSON.stringify({
        success: true,
        bookings: bookings.length,
        customer_emails_sent: customerEmailsSent,
        customer_emails_failed: customerEmailsFailed,
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
