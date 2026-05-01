import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, RefreshCw, Mail, MessageCircle, CheckCircle2, XCircle,
  Clock, AlertTriangle, ChevronDown, ChevronRight, Search,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Booking {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  workshop: string;
  city: string | null;
  participants: number | null;
  booking_date: string | null;
  created_at: string;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  template_name: string;
  status: string;
  error_message: string | null;
  message_id: string | null;
  metadata: any;
  created_at: string;
}

interface NotificationLog {
  id: string;
  channel: string;
  recipient: string;
  status: string;
  error_message: string | null;
  booking_id: string | null;
  idempotency_key: string | null;
  payload: any;
  created_at: string;
}

type Aggregate = {
  customerEmail: EmailLog | null;
  adminEmails: EmailLog[];
  whatsapps: NotificationLog[];
};

const StatusPill = ({
  status,
  icon: Icon,
  label,
}: {
  status: "ok" | "fail" | "pending" | "missing";
  icon: any;
  label: string;
}) => {
  const styles: Record<string, string> = {
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    fail: "bg-red-50 text-red-700 border-red-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    missing: "bg-muted text-muted-foreground border-border",
  };
  const Dot =
    status === "ok"
      ? CheckCircle2
      : status === "fail"
      ? XCircle
      : status === "pending"
      ? Clock
      : AlertTriangle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[status],
      )}
    >
      <Icon size={12} />
      <Dot size={12} />
      <span>{label}</span>
    </span>
  );
};

const BookingsDelivery = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [notifLogs, setNotifLogs] = useState<NotificationLog[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Auth check
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/admin/login");
        return;
      }
      const { data: claims } = await supabase.auth.getClaims();
      const role = (claims?.claims as any)?.user_metadata?.role;
      // Soft check; RLS will block non-admins anyway
      if (active) setAuthed(true);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [bRes, eRes, nRes] = await Promise.all([
        supabase
          .from("bookings")
          .select(
            "id,name,email,phone,workshop,city,participants,booking_date,created_at",
          )
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("email_send_log" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("notification_log" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);

      if (bRes.data) setBookings(bRes.data as Booking[]);
      if (eRes.data) setEmailLogs(eRes.data as unknown as EmailLog[]);
      if (nRes.data) setNotifLogs(nRes.data as unknown as NotificationLog[]);
    } catch (err) {
      console.error("loadData failed", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const aggregateFor = (booking: Booking): Aggregate => {
    const customerKey = `booking-confirm-${booking.id}`;
    const adminPrefix = `booking-admin-${booking.id}-`;

    // Email logs are keyed via metadata.idempotency_key OR by recipient + recent time
    // We try idempotency_key first if present in metadata, then fall back to a
    // recipient + time-window heuristic.
    const customerEmail =
      emailLogs.find(
        (l) =>
          (l.metadata?.idempotency_key === customerKey ||
            l.metadata?.idempotencyKey === customerKey) &&
          (booking.email ? l.recipient_email === booking.email : true),
      ) ||
      (booking.email
        ? emailLogs.find(
            (l) =>
              l.template_name === "booking-confirmation" &&
              l.recipient_email === booking.email &&
              Math.abs(
                new Date(l.created_at).getTime() -
                  new Date(booking.created_at).getTime(),
              ) <
                10 * 60 * 1000,
          ) || null
        : null);

    const adminEmails = emailLogs.filter((l) => {
      const idem =
        l.metadata?.idempotency_key || l.metadata?.idempotencyKey || "";
      if (typeof idem === "string" && idem.startsWith(adminPrefix)) return true;
      // Fallback time-window match
      return (
        l.template_name === "booking-admin-notification" &&
        Math.abs(
          new Date(l.created_at).getTime() -
            new Date(booking.created_at).getTime(),
        ) <
          10 * 60 * 1000
      );
    });

    const whatsapps = notifLogs.filter(
      (l) =>
        l.booking_id === booking.id ||
        l.idempotency_key === `booking-notify-${booking.id}`,
    );

    return { customerEmail, adminEmails, whatsapps };
  };

  const overallStatus = (a: Aggregate, hasEmail: boolean) => {
    const items: ("ok" | "fail" | "pending" | "missing")[] = [];
    if (hasEmail) {
      if (!a.customerEmail) items.push("missing");
      else if (a.customerEmail.status === "sent") items.push("ok");
      else if (a.customerEmail.status === "pending") items.push("pending");
      else items.push("fail");
    }
    if (a.adminEmails.length === 0) items.push("missing");
    else {
      const anyFail = a.adminEmails.some(
        (l) => l.status !== "sent" && l.status !== "pending",
      );
      const anyPending = a.adminEmails.some((l) => l.status === "pending");
      if (anyFail) items.push("fail");
      else if (anyPending) items.push("pending");
      else items.push("ok");
    }
    if (a.whatsapps.length === 0) items.push("missing");
    else {
      const anyFail = a.whatsapps.some((l) => l.status !== "sent");
      items.push(anyFail ? "fail" : "ok");
    }
    if (items.includes("fail")) return "fail";
    if (items.includes("pending")) return "pending";
    if (items.includes("missing")) return "missing";
    return "ok";
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredBookings = bookings.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.workshop?.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  });

  const summary = (() => {
    let ok = 0,
      fail = 0,
      pending = 0,
      missing = 0;
    for (const b of bookings) {
      const a = aggregateFor(b);
      const s = overallStatus(a, !!b.email);
      if (s === "ok") ok++;
      else if (s === "fail") fail++;
      else if (s === "pending") pending++;
      else missing++;
    }
    return { ok, fail, pending, missing };
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading delivery status...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bookings Delivery Status | Terraria Admin"
        description="Track email and WhatsApp delivery for bookings"
        path="/admin/delivery"
      />

      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft size={16} /> Dashboard
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Bookings Delivery</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw
              size={14}
              className={cn(refreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground mb-1">All delivered</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {summary.ok}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground mb-1">Failed</div>
            <div className="text-2xl font-semibold text-red-600">
              {summary.fail}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl font-semibold text-amber-600">
              {summary.pending}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground mb-1">No log found</div>
            <div className="text-2xl font-semibold text-muted-foreground">
              {summary.missing}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name, email, phone, workshop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* List */}
        <div className="space-y-2">
          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No bookings found.
            </div>
          )}

          {filteredBookings.map((booking) => {
            const agg = aggregateFor(booking);
            const isExpanded = expanded.has(booking.id);
            const status = overallStatus(agg, !!booking.email);
            const overallLabel =
              status === "ok"
                ? "All delivered"
                : status === "fail"
                ? "Has failures"
                : status === "pending"
                ? "In progress"
                : "Missing logs";

            return (
              <div
                key={booking.id}
                className="rounded-xl border bg-card overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(booking.id)}
                  className="w-full text-left p-4 hover:bg-accent/40 transition-colors flex items-start gap-3"
                >
                  <div className="pt-1 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {booking.name}{" "}
                          <span className="text-muted-foreground font-normal">
                            · {booking.workshop}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {booking.email || "no email"} ·{" "}
                          {booking.phone || "no phone"} ·{" "}
                          {format(
                            new Date(booking.created_at),
                            "MMM d, HH:mm",
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <StatusPill
                          status={
                            !booking.email
                              ? "missing"
                              : agg.customerEmail?.status === "sent"
                              ? "ok"
                              : agg.customerEmail?.status === "pending"
                              ? "pending"
                              : agg.customerEmail
                              ? "fail"
                              : "missing"
                          }
                          icon={Mail}
                          label="Customer"
                        />
                        <StatusPill
                          status={
                            agg.adminEmails.length === 0
                              ? "missing"
                              : agg.adminEmails.some(
                                  (l) =>
                                    l.status !== "sent" &&
                                    l.status !== "pending",
                                )
                              ? "fail"
                              : agg.adminEmails.some(
                                  (l) => l.status === "pending",
                                )
                              ? "pending"
                              : "ok"
                          }
                          icon={Mail}
                          label={`Admin (${agg.adminEmails.length})`}
                        />
                        <StatusPill
                          status={
                            agg.whatsapps.length === 0
                              ? "missing"
                              : agg.whatsapps.some((l) => l.status !== "sent")
                              ? "fail"
                              : "ok"
                          }
                          icon={MessageCircle}
                          label={`WhatsApp (${agg.whatsapps.length})`}
                        />
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-xs mt-2 font-medium",
                        status === "ok" && "text-emerald-600",
                        status === "fail" && "text-red-600",
                        status === "pending" && "text-amber-600",
                        status === "missing" && "text-muted-foreground",
                      )}
                    >
                      {overallLabel}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t bg-muted/30 p-4 space-y-4">
                    {/* Booking details */}
                    <div className="text-xs grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <div className="text-muted-foreground">City</div>
                        <div>{booking.city || "-"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Date</div>
                        <div>{booking.booking_date || "-"}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Participants</div>
                        <div>{booking.participants ?? "-"}</div>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <div className="text-muted-foreground">Booking ID</div>
                        <div className="font-mono text-[10px] break-all">
                          {booking.id}
                        </div>
                      </div>
                    </div>

                    {/* Customer email */}
                    <Section title="Customer confirmation email">
                      {agg.customerEmail ? (
                        <LogRow
                          left={agg.customerEmail.recipient_email}
                          status={agg.customerEmail.status}
                          time={agg.customerEmail.created_at}
                          error={agg.customerEmail.error_message}
                          extra={agg.customerEmail.template_name}
                        />
                      ) : (
                        <Empty
                          msg={
                            booking.email
                              ? "No email log found for this booking yet."
                              : "Customer did not provide an email."
                          }
                        />
                      )}
                    </Section>

                    {/* Admin emails */}
                    <Section
                      title={`Admin notification emails (${agg.adminEmails.length})`}
                    >
                      {agg.adminEmails.length === 0 ? (
                        <Empty msg="No admin email logs found." />
                      ) : (
                        <div className="space-y-1">
                          {agg.adminEmails.map((l) => (
                            <LogRow
                              key={l.id}
                              left={l.recipient_email}
                              status={l.status}
                              time={l.created_at}
                              error={l.error_message}
                              extra={l.template_name}
                            />
                          ))}
                        </div>
                      )}
                    </Section>

                    {/* WhatsApp */}
                    <Section
                      title={`WhatsApp notifications (${agg.whatsapps.length})`}
                    >
                      {agg.whatsapps.length === 0 ? (
                        <Empty msg="No WhatsApp log found. Check that Twilio is configured and the trigger fired." />
                      ) : (
                        <div className="space-y-1">
                          {agg.whatsapps.map((l) => (
                            <LogRow
                              key={l.id}
                              left={l.recipient}
                              status={l.status}
                              time={l.created_at}
                              error={l.error_message}
                              extra={l.channel}
                            />
                          ))}
                        </div>
                      )}
                    </Section>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t">
          Showing the latest 200 bookings. Email matches use the booking ID
          when present in metadata, otherwise a 10-minute window around the
          booking. WhatsApp logs require new bookings created after this page
          was added (older bookings will show as "no log found").
        </div>
      </main>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
      {title}
    </div>
    {children}
  </div>
);

const Empty = ({ msg }: { msg: string }) => (
  <div className="text-xs text-muted-foreground italic px-3 py-2 rounded-md bg-background border border-dashed">
    {msg}
  </div>
);

const LogRow = ({
  left,
  status,
  time,
  error,
  extra,
}: {
  left: string;
  status: string;
  time: string;
  error: string | null;
  extra?: string;
}) => {
  const ok = status === "sent";
  const pending = status === "pending";
  const Icon = ok ? CheckCircle2 : pending ? Clock : XCircle;
  const color = ok
    ? "text-emerald-600"
    : pending
    ? "text-amber-600"
    : "text-red-600";
  return (
    <div className="rounded-md bg-background border px-3 py-2 text-xs flex items-start gap-2">
      <Icon size={14} className={cn("mt-0.5 flex-shrink-0", color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-medium truncate">{left}</span>
          <span className="text-muted-foreground">
            {format(new Date(time), "MMM d, HH:mm:ss")}
          </span>
        </div>
        <div className="text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
          <span className={color}>{status}</span>
          {extra && <span>· {extra}</span>}
        </div>
        {error && (
          <div className="mt-1 text-red-600 break-words bg-red-50 border border-red-200 rounded px-2 py-1">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsDelivery;
