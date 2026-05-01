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

const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 3;
const WINDOW_MS = 3600000;

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

// Load notification contacts from site_settings
async function getContacts(supabaseAdmin: any): Promise<{ email: string; whatsappNumbers: string[]; zapierWebhookUrl: string }> {
  const defaults = { email: "contact.terraria@gmail.com", whatsappNumbers: ["+212650094668", "+212687323997"], zapierWebhookUrl: "" };
  try {
    const { data } = await supabaseAdmin.from("site_settings").select("key, value").in("key", ["notification_email", "whatsapp_numbers", "zapier_webhook_url"]);
    if (!data || data.length === 0) return defaults;
    const map: Record<string, string> = {};
    data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
    return {
      email: map["notification_email"] || defaults.email,
      whatsappNumbers: (map["whatsapp_numbers"] || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      zapierWebhookUrl: map["zapier_webhook_url"] || "",
    };
  } catch {
    return defaults;
  }
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load contacts from DB
    const contacts = await getContacts(supabaseAdmin);
    console.log("Contacts loaded:", JSON.stringify(contacts));

    let emailSubject: string;
    let emailBody: string;
    let whatsappMessage: string;

    if (type === "booking") {
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

      if (data.skipPersist !== true) {
        await supabaseAdmin.from("bookings").insert({
          name, city: city || null, email: email || null, phone: phone || null,
          workshop, session_info: sessionInfo || null, participants,
          booking_date: date || null, notes: notes || null,
        });
      }

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
      const customerName = validateString(data.customerName, 100);
      const customerEmail = validateEmail(data.customerEmail);
      const customerPhone = validatePhone(data.customerPhone);
      const customerAddress = validateString(data.customerAddress, 300);
      const region = validateString(data.region, 100);

      if (!customerName) {
        return new Response(
          JSON.stringify({ error: "Customer name is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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

      const { error: insertError } = await supabaseAdmin.from("orders").insert({
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_address: customerAddress || null,
        region: region || null,
        items, subtotal, delivery_fee: deliveryFee, grand_total: grandTotal,
      });

      if (insertError) {
        console.error("Order insert error:", JSON.stringify(insertError));
      }

      const itemLines = items
        .map((i: { name: string; quantity: number; price: number }) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} DH`)
        .join("\n");

      emailSubject = `🛒 New Order — ${grandTotal} DH — ${escapeHtml(customerName)}`;
      emailBody = `
        <h2>New Store Order</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Customer</td><td style="padding:6px 12px;">${escapeHtml(customerName)}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;">${escapeHtml(customerEmail || "")}</td></tr>
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
        `👤 ${sanitizeText(customerName)}\n📧 ${sanitizeText(customerEmail || "")}\n📱 ${sanitizeText(customerPhone || "")}\n📍 ${sanitizeText(customerAddress)}\n🚚 ${sanitizeText(region)}\n\n` +
        `${itemLines}\n\n` +
        `🚚 Delivery: ${deliveryFee} DH\n` +
        `*Total: ${grandTotal} DH*`;
    }

    // Send email via Resend
    let emailJson: any = {};
    try {
      const emailResult = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Terraria <onboarding@resend.dev>",
          to: [contacts.email],
          subject: emailSubject,
          html: emailBody,
        }),
      });
      emailJson = await emailResult.json();
      console.log("Email response status:", emailResult.status, "body:", JSON.stringify(emailJson));
      if (!emailResult.ok) {
        console.error("Email send FAILED:", JSON.stringify(emailJson));
      }
    } catch (emailErr) {
      console.error("Email fetch error:", String(emailErr));
    }

    // Send WhatsApp via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioHeaders = {
      Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const fromNumber = `whatsapp:${TWILIO_WHATSAPP_NUMBER?.startsWith('+') ? '' : '+'}${TWILIO_WHATSAPP_NUMBER}`;

    const whatsappResults = await Promise.allSettled(
      contacts.whatsappNumbers.map(async (toNumber) => {
        const body = new URLSearchParams({
          From: fromNumber,
          To: `whatsapp:${toNumber.startsWith('+') ? '' : '+'}${toNumber}`,
          Body: whatsappMessage,
        });
        const res = await fetch(twilioUrl, {
          method: "POST",
          headers: twilioHeaders,
          body: body.toString(),
        });
        const json = await res.json();
        console.log(`WhatsApp to ${toNumber}: status=${res.status}`, JSON.stringify(json));
        return { status: res.status, body: json };
      })
    );

    const whatsappSummary = whatsappResults.map((r, i) => ({
      to: contacts.whatsappNumbers[i],
      result: r.status === "fulfilled" ? r.value : { error: String((r as PromiseRejectedResult).reason) },
    }));

    console.log("WhatsApp summary:", JSON.stringify(whatsappSummary));

    // Send to Zapier webhook if configured
    let zapierResult: any = null;
    if (contacts.zapierWebhookUrl) {
      try {
        // Flatten payload so Zapier sees each field individually
        const flatItems = (data.items || []).map((i: any, idx: number) => `${i.name} × ${i.quantity} — ${i.price * i.quantity} DH`).join(" | ");
        const zapierPayload = type === "booking"
          ? {
              type: "booking",
              name: data.name || "",
              email: data.email || "",
              phone: data.phone || "",
              workshop: data.workshop || "",
              date: data.date || "",
              participants: data.participants || "",
              city: data.city || "",
              notes: data.notes || "",
            }
          : {
              type: "purchase",
              customerName: data.customerName || "",
              customerEmail: data.customerEmail || "",
              customerPhone: data.customerPhone || "",
              customerAddress: data.customerAddress || "",
              region: data.region || "",
              items: flatItems,
              totalItems: data.totalItems || 0,
              subtotal: data.totalPrice || 0,
              deliveryFee: data.deliveryFee || 0,
              grandTotal: data.grandTotal || 0,
            };
        await fetch(contacts.zapierWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...zapierPayload, timestamp: new Date().toISOString() }),
        });
        zapierResult = { sent: true };
        console.log("Zapier webhook sent successfully");
      } catch (zapierErr) {
        zapierResult = { error: String(zapierErr) };
        console.error("Zapier webhook error:", String(zapierErr));
      }
    }

    return new Response(
      JSON.stringify({ success: true, email: emailJson, whatsapp: whatsappSummary, zapier: zapierResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send notification. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
