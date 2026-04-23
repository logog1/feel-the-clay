import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  MessageCircle,
  Phone,
  CheckCircle2,
  XCircle,
  MinusCircle,
  RefreshCw,
  PlayCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type LogRow = {
  id: string;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
  message_id: string | null;
  metadata: any;
};

type Booking = {
  id: string;
  name: string;
  workshop: string;
  booking_date: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  session_info: string | null;
};

type Channel = "email" | "whatsapp" | "sms";
type ChannelEntry = { row: LogRow; status: string; channel: Channel };

const REMINDER_TEMPLATES = [
  "booking-reminder",
  "booking-reminder-whatsapp",
  "booking-reminder-sms",
  "booking-admin-reminder",
];

function channelOf(template: string): Channel {
  if (template.endsWith("-whatsapp")) return "whatsapp";
  if (template.endsWith("-sms")) return "sms";
  return "email";
}

function ChannelIcon({ channel }: { channel: Channel }) {
  const cls = "h-3.5 w-3.5";
  if (channel === "email") return <Mail className={cls} />;
  if (channel === "whatsapp") return <MessageCircle className={cls} />;
  return <Phone className={cls} />;
}

function statusTone(status: string): { bg: string; icon: JSX.Element; label: string } {
  const s = status.toLowerCase();
  if (s === "sent") {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Sent",
    };
  }
  if (s === "failed" || s === "dlq" || s === "bounced" || s === "complained") {
    return {
      bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
      icon: <XCircle className="h-3 w-3" />,
      label: s === "dlq" ? "Failed" : s.charAt(0).toUpperCase() + s.slice(1),
    };
  }
  if (s === "skipped" || s === "suppressed") {
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
      icon: <MinusCircle className="h-3 w-3" />,
      label: s.charAt(0).toUpperCase() + s.slice(1),
    };
  }
  return {
    bg: "bg-muted text-muted-foreground border-border",
    icon: <RefreshCw className="h-3 w-3" />,
    label: status,
  };
}

function StatusBadge({ status }: { status: string }) {
  const t = statusTone(status);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${t.bg}`}>
      {t.icon}
      {t.label}
    </span>
  );
}

function dedupe(rows: LogRow[]): LogRow[] {
  const map = new Map<string, LogRow>();
  for (const r of rows) {
    const key = r.message_id ?? r.id;
    const existing = map.get(key);
    if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
      map.set(key, r);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function ReminderLogSection() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<"1" | "7" | "30" | "90">("30");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState<null | "morning_of" | "evening_before">(null);

  const loadAll = async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));

    const [{ data: logRows, error: logErr }, { data: bookingRows, error: bErr }] = await Promise.all([
      supabase
        .from("email_send_log")
        .select("*")
        .in("template_name", REMINDER_TEMPLATES)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase
        .from("bookings")
        .select("id, name, workshop, booking_date, city, email, phone, status, session_info")
        .order("booking_date", { ascending: false })
        .limit(500),
    ]);

    if (logErr) toast.error("Failed to load reminder logs");
    if (bErr) toast.error("Failed to load bookings");

    setLogs(dedupe((logRows ?? []) as LogRow[]));
    setBookings((bookingRows ?? []) as Booking[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [days]);

  const grouped = useMemo(() => {
    const byBooking = new Map<string, ChannelEntry[]>();
    const adminRows: LogRow[] = [];

    for (const r of logs) {
      if (r.template_name === "booking-admin-reminder") {
        adminRows.push(r);
        continue;
      }
      const bookingId =
        (r.metadata && (r.metadata.booking_id || r.metadata.bookingId)) ||
        (r.message_id ? r.message_id.split("-").slice(2, -3).join("-") || null : null);
      if (!bookingId) continue;
      const arr = byBooking.get(bookingId) ?? [];
      arr.push({ row: r, status: r.status, channel: channelOf(r.template_name) });
      byBooking.set(bookingId, arr);
    }
    return { byBooking, adminRows };
  }, [logs]);

  const bookingRows = useMemo(() => {
    const ids = new Set<string>([...grouped.byBooking.keys()]);
    const rows = bookings
      .filter((b) => ids.has(b.id))
      .map((b) => {
        const entries = grouped.byBooking.get(b.id) ?? [];
        const byChannel: Record<Channel, ChannelEntry | undefined> = {
          email: undefined,
          whatsapp: undefined,
          sms: undefined,
        };
        for (const e of entries) {
          const cur = byChannel[e.channel];
          if (!cur || new Date(e.row.created_at) > new Date(cur.row.created_at)) {
            byChannel[e.channel] = e;
          }
        }
        const lastAt = entries.reduce(
          (acc, e) => Math.max(acc, new Date(e.row.created_at).getTime()),
          0,
        );
        return { booking: b, byChannel, lastAt, allEntries: entries };
      })
      .sort((a, b) => b.lastAt - a.lastAt);

    return rows.filter((r) => {
      if (channelFilter !== "all" && !r.byChannel[channelFilter as Channel]) return false;
      if (statusFilter !== "all") {
        const has = Object.values(r.byChannel).some(
          (e) => e && e.status.toLowerCase() === statusFilter,
        );
        if (!has) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${r.booking.name} ${r.booking.email ?? ""} ${r.booking.phone ?? ""} ${r.booking.workshop} ${r.booking.city ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [grouped, bookings, channelFilter, statusFilter, search]);

  const stats = useMemo(() => {
    let sent = 0,
      failed = 0,
      skipped = 0;
    for (const r of logs) {
      if (r.template_name === "booking-admin-reminder") continue;
      const s = r.status.toLowerCase();
      if (s === "sent") sent++;
      else if (s === "failed" || s === "dlq" || s === "bounced") failed++;
      else if (s === "skipped" || s === "suppressed") skipped++;
    }
    return { total: logs.length, sent, failed, skipped, admin: grouped.adminRows.length };
  }, [logs, grouped]);

  const triggerReminder = async (mode: "morning_of" | "evening_before") => {
    setRunning(mode);
    try {
      const { data, error } = await supabase.functions.invoke("booking-reminder", {
        body: { mode, force: true },
      });
      if (error) throw error;
      toast.success(`Reminder run completed (${mode.replace("_", " ")})`, {
        description: `Bookings: ${data?.bookings ?? 0} • Emails sent: ${data?.customer_emails_sent ?? 0} • SMS/WA sent: ${data?.sms_sent ?? 0}`,
      });
      await loadAll();
    } catch (e: any) {
      toast.error("Reminder run failed", { description: e?.message ?? String(e) });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Reminder Log</h2>
            <p className="text-xs text-muted-foreground">
              Track every booking reminder attempt across email, WhatsApp, and SMS.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={days} onValueChange={(v) => setDays(v as any)}>
              <SelectTrigger className="h-9 w-[130px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24h</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="h-9 w-[140px] rounded-xl">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[130px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              className="h-9 w-[220px] rounded-xl"
            />
            <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={loadAll}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
          <Stat label="Total events" value={stats.total} />
          <Stat label="Sent" value={stats.sent} tone="success" />
          <Stat label="Failed" value={stats.failed} tone="danger" />
          <Stat label="Skipped" value={stats.skipped} tone="warning" />
          <Stat label="Admin recaps" value={stats.admin} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            className="rounded-xl gap-1"
            disabled={running !== null}
            onClick={() => triggerReminder("morning_of")}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {running === "morning_of" ? "Running…" : "Run morning reminders now"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1"
            disabled={running !== null}
            onClick={() => triggerReminder("evening_before")}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {running === "evening_before" ? "Running…" : "Run evening-before reminders now"}
          </Button>
        </div>
      </Card>

      <Card className="p-0 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">By booking</h3>
          <Badge variant="secondary" className="rounded-full">{bookingRows.length}</Badge>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading reminders…</div>
        ) : bookingRows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No reminder activity yet for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Workshop</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>SMS</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingRows.map((r) => (
                  <TableRow key={r.booking.id}>
                    <TableCell>
                      <div className="font-medium text-foreground text-sm">{r.booking.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.booking.email ?? "—"} · {r.booking.phone ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{r.booking.workshop}</div>
                      {r.booking.city && (
                        <div className="text-[11px] text-muted-foreground">{r.booking.city}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{r.booking.booking_date ?? "—"}</TableCell>
                    <ChannelCell entry={r.byChannel.email} />
                    <ChannelCell entry={r.byChannel.whatsapp} />
                    <ChannelCell entry={r.byChannel.sms} />
                    <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {r.lastAt ? format(new Date(r.lastAt), "MMM d, HH:mm") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="p-0 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">All reminder events</h3>
          <Badge variant="secondary" className="rounded-full">{logs.length}</Badge>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No events.</div>
        ) : (
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 200).map((r) => {
                  const ch = channelOf(r.template_name);
                  const isAdmin = r.template_name === "booking-admin-reminder";
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-[11px] whitespace-nowrap">
                        {format(new Date(r.created_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <ChannelIcon channel={ch} />
                          {isAdmin ? "Email (admin)" : ch === "email" ? "Email" : ch === "whatsapp" ? "WhatsApp" : "SMS"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{r.recipient_email}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">
                        {r.metadata?.mode ?? "—"}
                      </TableCell>
                      <TableCell className="text-[11px] text-red-600 dark:text-red-400 max-w-[280px] truncate" title={r.error_message ?? ""}>
                        {r.error_message ?? ""}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

function ChannelCell({ entry }: { entry: ChannelEntry | undefined }) {
  if (!entry) {
    return (
      <TableCell>
        <span className="text-[11px] text-muted-foreground">—</span>
      </TableCell>
    );
  }
  return (
    <TableCell>
      <div className="flex flex-col gap-0.5">
        <StatusBadge status={entry.status} />
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(entry.row.created_at), "MMM d, HH:mm")}
        </span>
        {entry.row.error_message && (
          <span
            className="text-[10px] text-red-600 dark:text-red-400 max-w-[180px] truncate"
            title={entry.row.error_message}
          >
            {entry.row.error_message}
          </span>
        )}
      </div>
    </TableCell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "danger" | "warning";
}) {
  const toneCls =
    tone === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "danger"
      ? "text-red-600 dark:text-red-400"
      : tone === "warning"
      ? "text-amber-600 dark:text-amber-400"
      : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card/50 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}
