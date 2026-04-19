import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Mail, RefreshCw, ChevronLeft, ChevronRight, Send, Search,
  CheckCircle2, XCircle, Clock, Ban, Filter, Paperclip, X, Upload, AtSign,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

type LogRow = {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  source: string;
};

type Booking = {
  id: string;
  name: string;
  email: string | null;
  workshop: string;
  booking_date: string | null;
  status: string;
  city: string | null;
  session_info: string | null;
};

const STATUS_META: Record<string, { color: string; icon: any; label: string }> = {
  sent: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Sent" },
  pending: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
  failed: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Failed" },
  dlq: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Failed" },
  bounced: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Bounced" },
  complained: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Complained" },
  suppressed: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Ban, label: "Suppressed" },
};

const PAGE_SIZE = 25;

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { color: "bg-muted text-muted-foreground border-border", icon: Mail, label: status };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}>
      <Icon size={11} /> {meta.label}
    </span>
  );
}

function dedupeByMessageId(rows: LogRow[]): LogRow[] {
  const map = new Map<string, LogRow>();
  for (const r of rows) {
    const key = r.message_id || r.id;
    const existing = map.get(key);
    if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
      map.set(key, r);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function EmailsSection() {
  const [tab, setTab] = useState<"dashboard" | "compose">("dashboard");

  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<"24h" | "7d" | "30d">("7d");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const loadLogs = async () => {
    setLoading(true);
    const days = range === "24h" ? 1 : range === "7d" ? 7 : 30;
    const since = subDays(new Date(), days).toISOString();
    const { data, error } = await supabase
      .from("email_send_log")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) {
      toast.error("Couldn't load email logs");
      setLoading(false);
      return;
    }
    setLogs((data as LogRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [range]);

  const deduped = useMemo(() => dedupeByMessageId(logs), [logs]);

  const templates = useMemo(() => {
    const set = new Set<string>();
    deduped.forEach((r) => set.add(r.template_name));
    return Array.from(set).sort();
  }, [deduped]);

  const filtered = useMemo(() => {
    return deduped.filter((r) => {
      if (templateFilter !== "all" && r.template_name !== templateFilter) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "failed") {
          if (!["failed", "dlq", "bounced", "complained"].includes(r.status)) return false;
        } else if (r.status !== statusFilter) return false;
      }
      return true;
    });
  }, [deduped, templateFilter, statusFilter]);

  const stats = useMemo(() => {
    let sent = 0, failed = 0, suppressed = 0, pending = 0;
    for (const r of filtered) {
      if (r.status === "sent") sent++;
      else if (["failed", "dlq", "bounced", "complained"].includes(r.status)) failed++;
      else if (r.status === "suppressed") suppressed++;
      else if (r.status === "pending") pending++;
    }
    return { total: filtered.length, sent, failed, suppressed, pending };
  }, [filtered]);

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [templateFilter, statusFilter, range]);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-4">
      <TabsList>
        <TabsTrigger value="dashboard" className="gap-2"><Mail size={14} /> Dashboard</TabsTrigger>
        <TabsTrigger value="compose" className="gap-2"><Send size={14} /> Compose update</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-4">
        <Card className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 mr-2 text-muted-foreground"><Filter size={14} /><span className="text-sm font-medium">Filters</span></div>
          <div className="flex gap-1">
            {(["24h", "7d", "30d"] as const).map((r) => (
              <Button key={r} size="sm" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)} className="rounded-xl">
                {r === "24h" ? "Last 24h" : r === "7d" ? "Last 7 days" : "Last 30 days"}
              </Button>
            ))}
          </div>
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-[220px] rounded-xl"><SelectValue placeholder="Template" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {templates.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="suppressed">Suppressed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="rounded-xl gap-1 ml-auto" onClick={loadLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Sent" value={stats.sent} tone="success" />
          <StatCard label="Pending" value={stats.pending} tone="warning" />
          <StatCard label="Failed" value={stats.failed} tone="danger" />
          <StatCard label="Suppressed" value={stats.suppressed} tone="warning" />
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr className="text-left">
                  <th className="px-4 py-2.5 font-medium">Template</th>
                  <th className="px-4 py-2.5 font-medium">Recipient</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">When</th>
                  <th className="px-4 py-2.5 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    {loading ? "Loading…" : "No emails found for this filter."}
                  </td></tr>
                )}
                {pageRows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{r.template_name}</td>
                    <td className="px-4 py-2.5">{r.recipient_email}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(r.created_at), "MMM d, HH:mm")}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-red-600 max-w-[300px] truncate" title={r.error_message || ""}>
                      {r.error_message || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between p-3 border-t bg-muted/20">
              <div className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages} • {filtered.length} emails
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="rounded-xl" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  <ChevronLeft size={14} />
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="compose">
        <ComposeUpdate onSent={loadLogs} />
      </TabsContent>
    </Tabs>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" | "danger" }) {
  const toneColor =
    tone === "success" ? "text-emerald-600" :
    tone === "warning" ? "text-amber-600" :
    tone === "danger" ? "text-red-600" : "text-foreground";
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${toneColor}`}>{value}</div>
    </Card>
  );
}

type AttachmentRef = { url: string; name: string; kind: "image" | "file" };

function ComposeUpdate({ onSent }: { onSent: () => void }) {
  const [source, setSource] = useState<"customers" | "bookings" | "manual">("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");
  const [bookingDateFilter, setBookingDateFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [singleEmail, setSingleEmail] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");

  const [subject, setSubject] = useState("");
  const [intro, setIntro] = useState("");
  const [body, setBody] = useState("");
  const [signoff, setSignoff] = useState("");
  const [attachments, setAttachments] = useState<AttachmentRef[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [c, b] = await Promise.all([
        supabase.from("customers").select("id, name, email, phone, city, source").order("created_at", { ascending: false }),
        supabase.from("bookings").select("id, name, email, workshop, booking_date, status, city, session_info").order("created_at", { ascending: false }).limit(500),
      ]);
      setCustomers(((c.data as Customer[]) || []).filter((x) => x.email));
      setBookings(((b.data as Booking[]) || []).filter((x) => x.email));
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => { setSelected(new Set()); }, [source]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    (source === "customers" ? customers : bookings).forEach((r) => r.city && set.add(r.city));
    return Array.from(set).sort();
  }, [customers, bookings, source]);

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return customers.filter((c) => {
      if (cityFilter !== "all" && c.city !== cityFilter) return false;
      if (!q) return true;
      return (c.name?.toLowerCase().includes(q)) ||
             (c.email?.toLowerCase().includes(q)) ||
             (c.phone?.toLowerCase().includes(q));
    });
  }, [customers, search, cityFilter]);

  const filteredBookings = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bookings.filter((b) => {
      if (cityFilter !== "all" && b.city !== cityFilter) return false;
      if (bookingStatusFilter !== "all" && b.status !== bookingStatusFilter) return false;
      if (bookingDateFilter && b.booking_date !== bookingDateFilter) return false;
      if (!q) return true;
      return (b.name?.toLowerCase().includes(q)) ||
             (b.email?.toLowerCase().includes(q)) ||
             (b.workshop?.toLowerCase().includes(q));
    });
  }, [bookings, search, cityFilter, bookingStatusFilter, bookingDateFilter]);

  const visibleRows = source === "customers" ? filteredCustomers : source === "bookings" ? filteredBookings : [];

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const manualEmails = useMemo(() => {
    const all = new Map<string, string>();
    if (singleEmail.trim() && isValidEmail(singleEmail)) {
      const e = singleEmail.trim().toLowerCase();
      all.set(e, e.split("@")[0]);
    }
    bulkEmails
      .split(/[\s,;\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s && isValidEmail(s))
      .forEach((e) => { if (!all.has(e)) all.set(e, e.split("@")[0]); });
    return all;
  }, [singleEmail, bulkEmails]);

  const recipientsByEmail = useMemo(() => {
    const map = new Map<string, string>();
    if (source === "customers") {
      filteredCustomers.forEach((c) => {
        if (selected.has(c.id) && c.email && !map.has(c.email)) map.set(c.email, c.name);
      });
    } else if (source === "bookings") {
      filteredBookings.forEach((b) => {
        if (selected.has(b.id) && b.email && !map.has(b.email)) map.set(b.email, b.name);
      });
    } else {
      manualEmails.forEach((name, email) => map.set(email, name));
    }
    return map;
  }, [source, selected, filteredCustomers, filteredBookings, manualEmails]);

  const recipientCount = recipientsByEmail.size;

  const toggleAll = () => {
    if (selected.size === visibleRows.length) setSelected(new Set());
    else setSelected(new Set(visibleRows.map((r) => r.id)));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const newAttachments: AttachmentRef[] = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is over 10MB — skipped`);
        continue;
      }
      const ext = file.name.split(".").pop() || "bin";
      const path = `email-attachments/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("site-images").upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) {
        toast.error(`Upload failed: ${file.name}`);
        continue;
      }
      const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
      newAttachments.push({
        url: urlData.publicUrl,
        name: file.name,
        kind: file.type.startsWith("image/") ? "image" : "file",
      });
    }
    setAttachments((a) => [...a, ...newAttachments]);
    setUploading(false);
    e.target.value = "";
  };

  const handleSend = async () => {
    if (recipientCount === 0) { toast.error("Pick at least one recipient"); return; }
    if (!subject.trim()) { toast.error("Add a subject"); return; }
    if (!body.trim()) { toast.error("Add a message body"); return; }

    setSending(true);
    const batchId = crypto.randomUUID().slice(0, 8);
    let ok = 0, fail = 0;

    for (const [email, name] of recipientsByEmail) {
      try {
        const { error } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "customer-update",
            recipientEmail: email,
            idempotencyKey: `customer-update-${batchId}-${email}`,
            templateData: {
              name,
              subject: subject.trim(),
              intro: intro.trim() || undefined,
              body: body.trim(),
              signoff: signoff.trim() || undefined,
              attachments: attachments.length ? attachments : undefined,
            },
          },
        });
        if (error) throw error;
        ok++;
      } catch (e) {
        console.error("Failed to send to", email, e);
        fail++;
      }
    }

    setSending(false);
    if (fail === 0) {
      toast.success(`Queued ${ok} email${ok === 1 ? "" : "s"} ✓`);
      setSubject(""); setIntro(""); setBody(""); setSignoff("");
      setSelected(new Set()); setSingleEmail(""); setBulkEmails("");
      setAttachments([]);
    } else {
      toast.warning(`Queued ${ok}, failed ${fail}`);
    }
    onSent();
  };

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">Recipients</h3>
            <p className="text-xs text-muted-foreground">From your data, or type emails manually</p>
          </div>
          <Badge variant="secondary" className="rounded-full">{recipientCount} selected</Badge>
        </div>

        <Tabs value={source} onValueChange={(v) => setSource(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="customers" className="flex-1 text-xs">Customers ({customers.length})</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 text-xs">Bookings ({bookings.length})</TabsTrigger>
            <TabsTrigger value="manual" className="flex-1 text-xs gap-1"><AtSign size={12} /> Manual</TabsTrigger>
          </TabsList>
        </Tabs>

        {source !== "manual" ? (
          <>
            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" className="pl-9 rounded-xl" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-[160px] rounded-xl"><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cities</SelectItem>
                    {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {source === "bookings" && (
                  <>
                    <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                      <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="date" value={bookingDateFilter} onChange={(e) => setBookingDateFilter(e.target.value)} className="w-[160px] rounded-xl" />
                  </>
                )}
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-muted/40 border-b flex items-center gap-2 text-xs">
                <Checkbox checked={visibleRows.length > 0 && selected.size === visibleRows.length} onCheckedChange={toggleAll} />
                <span className="font-medium">Select all visible ({visibleRows.length})</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto divide-y">
                {loading && <div className="p-4 text-center text-sm text-muted-foreground">Loading…</div>}
                {!loading && visibleRows.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">No matches</div>
                )}
                {!loading && source === "customers" && filteredCustomers.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 cursor-pointer">
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => {
                        setSelected((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; });
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.email} {c.city && `• ${c.city}`}</div>
                    </div>
                  </label>
                ))}
                {!loading && source === "bookings" && filteredBookings.map((b) => (
                  <label key={b.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 cursor-pointer">
                    <Checkbox
                      checked={selected.has(b.id)}
                      onCheckedChange={() => {
                        setSelected((s) => { const n = new Set(s); n.has(b.id) ? n.delete(b.id) : n.add(b.id); return n; });
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{b.name} <span className="text-muted-foreground font-normal">• {b.workshop}</span></div>
                      <div className="text-xs text-muted-foreground truncate">{b.email} • {b.booking_date || "no date"} • {b.status}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="single-email" className="text-xs">Quick send (one email)</Label>
              <Input id="single-email" type="email" value={singleEmail} onChange={(e) => setSingleEmail(e.target.value)} placeholder="someone@example.com" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-emails" className="text-xs">Multiple emails (comma, space, or newline separated)</Label>
              <Textarea
                id="bulk-emails"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                placeholder={"alice@example.com\nbob@example.com, carol@example.com"}
                rows={8}
                className="rounded-xl font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                {manualEmails.size} valid email{manualEmails.size === 1 ? "" : "s"} detected
              </p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
              Each person gets their own email — no one sees the other recipients.
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-3 h-fit lg:sticky lg:top-4">
        <div>
          <h3 className="font-semibold text-base">Message</h3>
          <p className="text-xs text-muted-foreground">Operational updates only — not promotional content</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subj">Subject</Label>
          <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Small change to Saturday's workshop" className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="intro">Intro line (optional)</Label>
          <Input id="intro" value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="A quick heads-up about your workshop." className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"Write your update here.\n\nUse blank lines for paragraphs. Paste links and they'll be clickable, or use [text](https://link.com) for custom labels (great for Canva designs)."}
            rows={8}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Tip: paste a Canva share link as <code className="text-[10px] bg-muted px-1 rounded">[View design](https://canva.com/...)</code>
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signoff">Sign-off (optional)</Label>
          <Input id="signoff" value={signoff} onChange={(e) => setSignoff(e.target.value)} placeholder="Thanks for your flexibility." className="rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Paperclip size={12} /> Attachments</Label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 cursor-pointer hover:bg-muted/30 text-xs text-muted-foreground">
            <Upload size={14} />
            {uploading ? "Uploading…" : "Click to upload images or files (max 10MB each)"}
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-muted/40 rounded-lg px-2 py-1.5">
                  {a.kind === "image" ? (
                    <img src={a.url} alt={a.name} className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <Paperclip size={14} className="text-muted-foreground shrink-0" />
                  )}
                  <span className="flex-1 truncate">{a.name}</span>
                  <button
                    onClick={() => setAttachments((arr) => arr.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-destructive"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Images appear inline in the email. Other files become download links.
          </p>
        </div>

        <div className="rounded-xl border bg-amber-50 text-amber-900 p-3 text-xs">
          <strong>Note:</strong> use this only for real updates (schedule change, venue change, important info). Promotional broadcasts aren't supported.
        </div>

        <Button onClick={handleSend} disabled={sending || recipientCount === 0} className="w-full rounded-xl gap-2">
          <Send size={16} />
          {sending ? "Sending…" : `Send to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}`}
        </Button>
      </Card>
    </div>
  );
}
