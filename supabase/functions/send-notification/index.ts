import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function sanitizeText(text: string): string {
  return text.replace(/[*_~`]/g, '');
}

interface NotificationPayload {
  type: "booking" | "purchase";
  data: Record<string, unknown>;
}

// In-memory rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 3;
const WINDOW_MS = 3600000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  if (limit && now < limit.resetAt) {
    if (limit.count >= MAX_REQUESTS) return true;
    limit.count++;
    return false;
  }
  rateLimits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { type, data } = (await req.json()) as NotificationPayload;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
    const OWNER_WHATSAPP_NUMBER = Deno.env.get("OWNER_WHATSAPP_NUMBER");

    // Create Supabase admin client to save to DB
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let emailSubject: string;
    let emailBody: string;
    let whatsappMessage: string;

    if (type === "booking") {
      const d = data as Record<string, string>;

      // Save booking to DB
      await supabaseAdmin.from("bookings").insert({
        name: d.name,
        city: d.city,
        email: d.email,
        phone: d.phone,
        workshop: d.workshop,
        session_info: d.sessionInfo,
        participants: parseInt(d.participants) || 1,
        booking_date: d.date,
        notes: d.notes || null,
      });

      emailSubject = `🏺 New Booking: ${d.workshop} — ${d.name}`;
      emailBody = `
        <h2>New Booking Request</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${escapeHtml(d.name)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">City</td><td style="padding:6px 12px;">${escapeHtml(d.city)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;">${escapeHtml(d.email)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${escapeHtml(d.phone)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Workshop</td><td style="padding:6px 12px;">${escapeHtml(d.workshop)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Session</td><td style="padding:6px 12px;">${escapeHtml(d.sessionInfo || "Open Workshop")}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Participants</td><td style="padding:6px 12px;">${escapeHtml(d.participants)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Date</td><td style="padding:6px 12px;">${escapeHtml(d.date)}</td></tr>
          ${d.notes ? `<tr><td style="padding:6px 12px;font-weight:bold;">Notes</td><td style="padding:6px 12px;">${escapeHtml(d.notes)}</td></tr>` : ""}
        </table>
      `;
      whatsappMessage =
        `🏺 *New Booking*\n\n` +
        `👤 ${sanitizeText(d.name)}\n🏙️ ${sanitizeText(d.city)}\n📧 ${sanitizeText(d.email)}\n📱 ${sanitizeText(d.phone)}\n\n` +
        `🎨 ${sanitizeText(d.workshop)} — ${sanitizeText(d.sessionInfo || "Open Workshop")}\n` +
        `👥 ${sanitizeText(d.participants)} participants\n📅 ${sanitizeText(d.date)}` +
        (d.notes ? `\n📝 ${sanitizeText(d.notes)}` : "");
    } else {
      // Purchase
      const d = data as Record<string, unknown>;
      const items = d.items as Array<{ name: string; quantity: number; price: number }>;
      const itemLines = items
        .map((i) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} DH`)
        .join("\n");

      const customerName = sanitizeText(String(d.customerName || ""));
      const customerPhone = sanitizeText(String(d.customerPhone || ""));
      const customerAddress = sanitizeText(String(d.customerAddress || ""));
      const region = sanitizeText(String(d.region || ""));
      const deliveryFee = d.deliveryFee || 0;
      const grandTotal = d.grandTotal || d.totalPrice;

      // Save order to DB
      await supabaseAdmin.from("orders").insert({
        customer_name: String(d.customerName || ""),
        customer_phone: String(d.customerPhone || ""),
        customer_address: String(d.customerAddress || ""),
        region: String(d.region || ""),
        items: items,
        subtotal: d.totalPrice,
        delivery_fee: deliveryFee,
        grand_total: grandTotal,
      });

      emailSubject = `🛒 New Order — ${grandTotal} DH — ${escapeHtml(customerName)}`;
      emailBody = `
        <h2>New Store Order</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Customer</td><td style="padding:6px 12px;">${escapeHtml(customerName)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${escapeHtml(customerPhone)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Address</td><td style="padding:6px 12px;">${escapeHtml(customerAddress)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Region</td><td style="padding:6px 12px;">${escapeHtml(region)}</td></tr>
          <tr><td colspan="2" style="padding:8px 12px;"><hr/></td></tr>
          ${items.map((i) => `<tr><td style="padding:4px 12px;">${escapeHtml(i.name)} × ${i.quantity}</td><td style="padding:4px 12px;text-align:right;">${i.price * i.quantity} DH</td></tr>`).join("")}
          <tr><td style="padding:4px 12px;">Delivery (${escapeHtml(region)})</td><td style="padding:4px 12px;text-align:right;">${deliveryFee} DH</td></tr>
          <tr style="border-top:2px solid #333;"><td style="padding:8px 12px;font-weight:bold;">Total</td><td style="padding:8px 12px;text-align:right;font-weight:bold;">${grandTotal} DH</td></tr>
        </table>
      `;
      whatsappMessage =
        `🛒 *New Order*\n\n` +
        `👤 ${customerName}\n📱 ${customerPhone}\n📍 ${customerAddress}\n🚚 ${region}\n\n` +
        `${itemLines}\n\n` +
        `🚚 Delivery: ${deliveryFee} DH\n` +
        `*Total: ${grandTotal} DH*`;
    }

    // Send email via Resend
    const emailResult = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Terraria <hello@terrariaworkshops.com>",
        to: ["contact.terraria@gmail.com"],
        subject: emailSubject,
        html: emailBody,
      }),
    });
    const emailJson = await emailResult.json();

    // Send WhatsApp via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioBody = new URLSearchParams({
      From: `whatsapp:${TWILIO_WHATSAPP_NUMBER?.startsWith('+') ? '' : '+'}${TWILIO_WHATSAPP_NUMBER}`,
      To: `whatsapp:${OWNER_WHATSAPP_NUMBER?.startsWith('+') ? '' : '+'}${OWNER_WHATSAPP_NUMBER}`,
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
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification. Please try again later.' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
