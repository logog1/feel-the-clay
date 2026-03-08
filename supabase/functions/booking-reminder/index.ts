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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get contacts from settings
    const { data: settings } = await supabaseAdmin.from("site_settings").select("key, value").in("key", ["notification_email", "whatsapp_numbers"]);
    const settingsMap: Record<string, string> = {};
    (settings || []).forEach((s: any) => { settingsMap[s.key] = s.value; });
    const toEmail = settingsMap["notification_email"] || "contact.terraria@gmail.com";
    const whatsappNumbers = (settingsMap["whatsapp_numbers"] || "").split(",").map((s: string) => s.trim()).filter(Boolean);

    // Find confirmed bookings for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

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

    // Build reminder content
    const bookingLines = bookings.map((b: any) =>
      `• ${b.name} — ${b.workshop} (${b.participants || 1} pax) ${b.session_info ? `[${b.session_info}]` : ""}`
    ).join("\n");

    const emailBody = `
      <h2 style="font-family:sans-serif;color:#333;">⏰ Booking Reminder — Tomorrow (${tomorrowStr})</h2>
      <p style="font-family:sans-serif;">You have <strong>${bookings.length}</strong> confirmed booking(s) for tomorrow:</p>
      <ul style="font-family:sans-serif;">
        ${bookings.map((b: any) => `<li><strong>${b.name}</strong> — ${b.workshop} (${b.participants || 1} participants) ${b.phone ? `📱 ${b.phone}` : ""}</li>`).join("")}
      </ul>
      <p style="font-family:sans-serif;color:#888;font-size:12px;">Auto-reminder by Terraria Workshops</p>
    `;

    // Send email
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

    // Send WhatsApp
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

    console.log(`Sent ${bookings.length} booking reminders for ${tomorrowStr}`);

    return new Response(JSON.stringify({ success: true, reminders: bookings.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Booking reminder error:", error);
    return new Response(JSON.stringify({ error: "Failed to send reminders" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
