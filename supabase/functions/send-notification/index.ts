const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationPayload {
  type: "booking" | "purchase";
  data: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = (await req.json()) as NotificationPayload;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    let emailSubject: string;
    let emailBody: string;
    let whatsappMessage: string;

    if (type === "booking") {
      const d = data as Record<string, string>;
      emailSubject = `🏺 New Booking: ${d.workshop} — ${d.name}`;
      emailBody = `
        <h2>New Booking Request</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${d.name}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">City</td><td style="padding:6px 12px;">${d.city}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;">${d.email}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${d.phone}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Workshop</td><td style="padding:6px 12px;">${d.workshop}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Session</td><td style="padding:6px 12px;">${d.sessionInfo || "Open Workshop"}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Participants</td><td style="padding:6px 12px;">${d.participants}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Date</td><td style="padding:6px 12px;">${d.date}</td></tr>
          ${d.notes ? `<tr><td style="padding:6px 12px;font-weight:bold;">Notes</td><td style="padding:6px 12px;">${d.notes}</td></tr>` : ""}
        </table>
      `;
      whatsappMessage =
        `🏺 *New Booking*\n\n` +
        `👤 ${d.name}\n🏙️ ${d.city}\n📧 ${d.email}\n📱 ${d.phone}\n\n` +
        `🎨 ${d.workshop} — ${d.sessionInfo || "Open Workshop"}\n` +
        `👥 ${d.participants} participants\n📅 ${d.date}` +
        (d.notes ? `\n📝 ${d.notes}` : "");
    } else {
      // Purchase
      const d = data as Record<string, unknown>;
      const items = d.items as Array<{ name: string; quantity: number; price: number }>;
      const itemLines = items
        .map((i) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} DH`)
        .join("\n");

      emailSubject = `🛒 New Order — ${d.totalPrice} DH`;
      emailBody = `
        <h2>New Store Order</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          ${items.map((i) => `<tr><td style="padding:4px 12px;">${i.name} × ${i.quantity}</td><td style="padding:4px 12px;text-align:right;">${i.price * i.quantity} DH</td></tr>`).join("")}
          <tr style="border-top:2px solid #333;"><td style="padding:8px 12px;font-weight:bold;">Total</td><td style="padding:8px 12px;text-align:right;font-weight:bold;">${d.totalPrice} DH</td></tr>
        </table>
      `;
      whatsappMessage =
        `🛒 *New Order*\n\n${itemLines}\n\n*Total: ${d.totalPrice} DH*\n*Items: ${d.totalItems}*`;
    }

    // Send email via Resend
    const emailResult = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Terraria <notifications@terrariaworkshops.com>",
        to: ["contact.terraria@gmail.com"],
        subject: emailSubject,
        html: emailBody,
      }),
    });
    const emailJson = await emailResult.json();

    // Send WhatsApp via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioBody = new URLSearchParams({
      From: `whatsapp:+${TWILIO_WHATSAPP_NUMBER}`,
      To: `whatsapp:+${TWILIO_WHATSAPP_NUMBER}`,
      Body: whatsappMessage,
    });

    const whatsappResult = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioBody.toString(),
    });
    const whatsappJson = await whatsappResult.json();

    return new Response(
      JSON.stringify({
        success: true,
        email: emailJson,
        whatsapp: whatsappJson,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
