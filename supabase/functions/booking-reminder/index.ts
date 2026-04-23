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

    // Bookings happening tomorrow (24h reminder window)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: bookings, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .eq("booking_date", tomorrowStr);

    if (fetchError) {
      console.error("Failed to fetch bookings:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch bookings" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!bookings || bookings.length === 0) {
      console.log(`No confirmed bookings for ${tomorrowStr}`);
      return new Response(JSON.stringify({ success: true, reminders: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${bookings.length} confirmed bookings for ${tomorrowStr}`);

    // 1) Customer reminders — branded, idempotent per booking + date
    const customerResults = await Promise.allSettled(
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
    const customerSent = customerResults.filter((r) => r.status === "fulfilled").length;
    const customerFailed = customerResults.filter((r) => r.status === "rejected").length;

    // 2) Admin recap — one branded email per admin, idempotent per day
    const adminPayload = {
      date: tomorrowStr,
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
            idempotencyKey: `booking-admin-reminder-${tomorrowStr}-${adminEmail}`,
            templateData: adminPayload,
          },
        });
        if (error) throw error;
      })
    );
    const adminSent = adminResults.filter((r) => r.status === "fulfilled").length;

    console.log(
      `Reminders for ${tomorrowStr}: customers ${customerSent}/${bookings.length} (failed ${customerFailed}), admins ${adminSent}/${ADMIN_EMAILS.length}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        date: tomorrowStr,
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
