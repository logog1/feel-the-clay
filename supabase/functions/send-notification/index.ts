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

// Simple validation helpers
function validateString(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen);
}

function validateEmail(val: unknown): string | null {
  const s = validateString(val, 255);
  if (!s) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(s) ? s : null;
}

function validatePhone(val: unknown): string | null {
  const s = validateString(val, 30);
  if (!s) return null;
  // Allow digits, spaces, +, -, (, )
  return /^[\d\s+\-()]+$/.test(s) ? s : null;
}

function validateInt(val: unknown, min: number, max: number, fallback: number): number {
  const n = typeof val === "number" ? val : parseInt(String(val), 10);
  if (isNaN(n) || n < min || n > max) return fallback;
  return Math.floor(n);
}

function validateNumber(val: unknown, min: number, max: number, fallback: number): number {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(n) || n < min || n > max) return fallback;
  return n;
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

    let payload: NotificationPayload;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, data } = payload;

    if (type !== "booking" && type !== "purchase") {
      return new Response(
        JSON.stringify({ error: "Invalid notification type." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data || typeof data !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid data payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
    const OWNER_WHATSAPP_NUMBER = Deno.env.get("OWNER_WHATSAPP_NUMBER");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let emailSubject: string;
    let emailBody: string;
    let whatsappMessage: string;

    if (type === "booking") {
      // Validate booking fields
      const name = validateString(data.name, 100);
      const city = validateString(data.city, 100);
      const email = validateEmail(data.email);
      const phone = validatePhone(data.phone);
      const workshop = validateString(data.workshop, 100);
      const sessionInfo = validateString(data.sessionInfo, 200);
      const participants = validateInt(data.participants, 1, 50, 1);
      const date = validateString(data.date, 50);
      const notes = validateString(data.notes, 500);

      if (!name || !workshop) {
        return new Response(
          JSON.stringify({ error: "Name and workshop are required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabaseAdmin.from("bookings").insert({
        name,
        city: city || null,
        email: email || null,
        phone: phone || null,
        workshop,
        session_info: sessionInfo || null,
        participants,
        booking_date: date || null,
        notes: notes || null,
      });

      emailSubject = `🏺 New Booking: ${workshop} — ${name}`;
      emailBody = `
        <h2>New Booking Request</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">City</td><td style="padding:6px 12px;">${escapeHtml(city)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;">${escapeHtml(email || "")}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${escapeHtml(phone || "")}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Workshop</td><td style="padding:6px 12px;">${escapeHtml(workshop)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Session</td><td style="padding:6px 12px;">${escapeHtml(sessionInfo || "Open Workshop")}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Participants</td><td style="padding:6px 12px;">${participants}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Date</td><td style="padding:6px 12px;">${escapeHtml(date)}</td></tr>
          ${notes ? `<tr><td style="padding:6px 12px;font-weight:bold;">Notes</td><td style="padding:6px 12px;">${escapeHtml(notes)}</td></tr>` : ""}
        </table>
      `;
      whatsappMessage =
        `🏺 *New Booking*\n\n` +
        `👤 ${sanitizeText(name)}\n🏙️ ${sanitizeText(city)}\n📧 ${sanitizeText(email || "")}\n📱 ${sanitizeText(phone || "")}\n\n` +
        `🎨 ${sanitizeText(workshop)} — ${sanitizeText(sessionInfo || "Open Workshop")}\n` +
        `👥 ${participants} participants\n📅 ${sanitizeText(date)}` +
        (notes ? `\n📝 ${sanitizeText(notes)}` : "");
    } else {
      // Purchase - validate fields
      const customerName = validateString(data.customerName, 100);
      const customerPhone = validatePhone(data.customerPhone);
      const customerAddress = validateString(data.customerAddress, 300);
      const region = validateString(data.region, 100);

      if (!customerName) {
        return new Response(
          JSON.stringify({ error: "Customer name is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate items array
      const rawItems = Array.isArray(data.items) ? data.items : [];
      const items = rawItems.slice(0, 50).map((i: Record<string, unknown>) => ({
        name: validateString(i?.name, 100) || "Unknown",
        quantity: validateInt(i?.quantity, 1, 100, 1),
        price: validateNumber(i?.price, 0, 100000, 0),
      }));

      if (items.length === 0) {
        return new Response(
          JSON.stringify({ error: "At least one item is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const deliveryFee = validateNumber(data.deliveryFee, 0, 10000, 0);
      const subtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
      const grandTotal = subtotal + deliveryFee;

      await supabaseAdmin.from("orders").insert({
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_address: customerAddress || null,
        region: region || null,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        grand_total: grandTotal,
      });

      const itemLines = items
        .map((i: { name: string; quantity: number; price: number }) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} DH`)
        .join("\n");

      emailSubject = `🛒 New Order — ${grandTotal} DH — ${escapeHtml(customerName)}`;
      emailBody = `
        <h2>New Store Order</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Customer</td><td style="padding:6px 12px;">${escapeHtml(customerName)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${escapeHtml(customerPhone || "")}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Address</td><td style="padding:6px 12px;">${escapeHtml(customerAddress)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Region</td><td style="padding:6px 12px;">${escapeHtml(region)}</td></tr>
          <tr><td colspan="2" style="padding:8px 12px;"><hr/></td></tr>
          ${items.map((i: { name: string; quantity: number; price: number }) => `<tr><td style="padding:4px 12px;">${escapeHtml(i.name)} × ${i.quantity}</td><td style="padding:4px 12px;text-align:right;">${i.price * i.quantity} DH</td></tr>`).join("")}
          <tr><td style="padding:4px 12px;">Delivery (${escapeHtml(region)})</td><td style="padding:4px 12px;text-align:right;">${deliveryFee} DH</td></tr>
          <tr style="border-top:2px solid #333;"><td style="padding:8px 12px;font-weight:bold;">Total</td><td style="padding:8px 12px;text-align:right;font-weight:bold;">${grandTotal} DH</td></tr>
        </table>
      `;
      whatsappMessage =
        `🛒 *New Order*\n\n` +
        `👤 ${sanitizeText(customerName)}\n📱 ${sanitizeText(customerPhone || "")}\n📍 ${sanitizeText(customerAddress)}\n🚚 ${sanitizeText(region)}\n\n` +
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
      JSON.stringify({ success: true }),
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
