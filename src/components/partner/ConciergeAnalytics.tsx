import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, ScanLine, ClipboardList, Wallet, Download } from "lucide-react";
import { format, subDays, startOfDay, parseISO } from "date-fns";

type Scan = { id: string; scanned_at: string; variant_code: string | null; variant_label: string | null; variant_scope: string | null; session_id: string | null; booking_id: string | null; };
type Booking = { id: string; status: string; created_at: string; completed_at: string | null; cancelled_at: string | null; gross_amount: number | null; commission_rate: number | null; commission_amount: number | null; commission_status: string | null; currency: string | null; qr_variant_code: string | null; qr_variant_scope: string | null; guest_name?: string; room_number?: string; participants?: number; };
type Variant = { id: string; code: string; label: string; scope: string; is_active: boolean; };
type Payout = { id: string; period_start: string; period_end: string; amount: number; currency: string; method: string | null; reference: string | null; paid_at: string | null; notes: string | null; booking_ids: string[] | null; };

export default function ConciergeAnalytics({ partnerId, brand, partnerName }: { partnerId: string; brand: string; partnerName: string }) {
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<Scan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [days, setDays] = useState(30);

  const load = async () => {
    setLoading(true);
    const since = subDays(startOfDay(new Date()), days).toISOString();
    const [sRes, bRes, sfRes, vRes, pRes] = await Promise.all([
      (supabase as any).from("qr_scan_log").select("*").eq("partner_id", partnerId).gte("scanned_at", since).order("scanned_at", { ascending: false }),
      (supabase as any).from("bookings").select("id,status,created_at,completed_at,cancelled_at,gross_amount,commission_rate,commission_amount,commission_status,qr_variant_code,qr_variant_scope,name,city,participants").eq("partner_id", partnerId).gte("created_at", since).order("created_at", { ascending: false }),
      (supabase as any).from("sofitel_bookings").select("id,status,created_at,completed_at,cancelled_at,gross_amount,commission_rate,commission_amount,commission_status,currency,qr_variant_code,qr_variant_scope,guest_name,room_number,participants").eq("partner_id", partnerId).gte("created_at", since).order("created_at", { ascending: false }),
      (supabase as any).from("partner_qr_variants").select("*").eq("partner_id", partnerId),
      (supabase as any).from("partner_payouts").select("*").eq("partner_id", partnerId).order("period_end", { ascending: false }),
    ]);
    setScans((sRes.data || []) as Scan[]);
    const merged = [
      ...((bRes.data || []) as any[]).map((b) => ({ ...b, guest_name: b.name, room_number: b.city })),
      ...((sfRes.data || []) as any[]),
    ];
    setBookings(merged as Booking[]);
    setVariants((vRes.data || []) as Variant[]);
    setPayouts((pRes.data || []) as Payout[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [partnerId, days]);

  // Funnel
  const uniqueSessions = useMemo(() => new Set(scans.map((s) => s.session_id).filter(Boolean)).size, [scans]);
  const totalScans = scans.length;
  const activeBookings = bookings.filter((b) => b.status !== "cancelled").length;
  const completed = bookings.filter((b) => b.status === "completed");
  const conversion = uniqueSessions ? Math.round((bookings.length / uniqueSessions) * 100) : 0;
  const commissionDue = completed.filter((b) => b.commission_status === "due").reduce((s, b) => s + Number(b.commission_amount || 0), 0);
  const commissionPaid = completed.filter((b) => b.commission_status === "paid").reduce((s, b) => s + Number(b.commission_amount || 0), 0);
  const gross = completed.reduce((s, b) => s + Number(b.gross_amount || 0), 0);
  const currency = (completed.find((b) => b.currency)?.currency) || "MAD";

  // Per-day sparkline (scans + bookings)
  const dayBuckets = useMemo(() => {
    const buckets: { date: string; scans: number; bookings: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      buckets.push({ date: d, scans: 0, bookings: 0 });
    }
    const idx = new Map(buckets.map((b, i) => [b.date, i]));
    scans.forEach((s) => { const k = s.scanned_at.slice(0, 10); if (idx.has(k)) buckets[idx.get(k)!].scans++; });
    bookings.forEach((b) => { const k = (b.created_at || "").slice(0, 10); if (idx.has(k)) buckets[idx.get(k)!].bookings++; });
    return buckets;
  }, [scans, bookings, days]);
  const maxBar = Math.max(1, ...dayBuckets.map((d) => Math.max(d.scans, d.bookings)));

  // Per-variant performance
  const variantRows = useMemo(() => {
    const byCode = new Map<string, { code: string; label: string; scope: string; scans: number; bookings: number; completed: number; commission: number; }>();
    const ensure = (code: string, label?: string, scope?: string) => {
      if (!byCode.has(code)) byCode.set(code, { code, label: label || code, scope: scope || "property", scans: 0, bookings: 0, completed: 0, commission: 0 });
      return byCode.get(code)!;
    };
    variants.forEach((v) => ensure(v.code, v.label, v.scope));
    scans.forEach((s) => { if (s.variant_code) ensure(s.variant_code, s.variant_label || undefined, s.variant_scope || undefined).scans++; });
    bookings.forEach((b) => {
      const code = b.qr_variant_code || "(direct)";
      const row = ensure(code, code === "(direct)" ? "Direct visits" : code, b.qr_variant_scope || "property");
      row.bookings++;
      if (b.status === "completed") {
        row.completed++;
        row.commission += Number(b.commission_amount || 0);
      }
    });
    return Array.from(byCode.values()).sort((a, b) => (b.completed - a.completed) || (b.bookings - a.bookings) || (b.scans - a.scans));
  }, [variants, scans, bookings]);

  const exportDetailedCSV = () => {
    const headers = ["Date", "Guest", "Room", "Pax", "Status", "Gross", "Rate %", "Commission", "Commission status", "QR variant", "Scope"];
    const rows = bookings.map((b) => [
      (b.completed_at || b.created_at || "").slice(0, 10),
      b.guest_name || "",
      b.room_number || "",
      b.participants ?? "",
      b.status,
      b.gross_amount ?? "",
      b.commission_rate ?? "",
      b.commission_amount ?? "",
      b.commission_status ?? "",
      b.qr_variant_code ?? "",
      b.qr_variant_scope ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `commissions-${partnerName.replace(/\s+/g, "-").toLowerCase()}-${days}d.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="py-6 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-5">
      {/* Funnel */}
      <section className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold inline-flex items-center gap-1"><BarChart3 size={12} />Scan funnel</h3>
          <div className="flex items-center gap-1">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`text-[11px] px-2 py-0.5 rounded-full border ${days === d ? "text-white" : "bg-white"}`}
                style={days === d ? { background: brand, borderColor: brand } : {}}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Funnel label="QR scans" value={totalScans} icon={<ScanLine size={12} />} />
          <Funnel label="Unique visitors" value={uniqueSessions} />
          <Funnel label="Bookings" value={bookings.length} accent={brand} />
          <Funnel label="Completed" value={completed.length} accent="#059669" />
          <Funnel label="Conversion" value={`${conversion}%`} />
        </div>

        <Card className="p-3">
          <div className="flex items-end gap-[2px] h-20">
            {dayBuckets.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-[1px]" title={`${d.date} · ${d.scans} scans · ${d.bookings} bookings`}>
                <div className="w-full rounded-t" style={{ height: `${(d.bookings / maxBar) * 70}%`, background: brand, opacity: d.bookings ? 1 : 0.15 }} />
                <div className="w-full rounded-t" style={{ height: `${(d.scans / maxBar) * 30}%`, background: "#94a3b8", opacity: d.scans ? 0.7 : 0.1 }} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
            <span>{dayBuckets[0]?.date}</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: brand }} /> bookings</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-400" /> scans</span>
            </div>
            <span>{dayBuckets[dayBuckets.length - 1]?.date}</span>
          </div>
        </Card>
      </section>

      {/* Per-variant performance */}
      <section className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">QR performance by variant</h3>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">Code</th>
                <th className="text-left px-3 py-2">Label</th>
                <th className="text-left px-3 py-2">Scope</th>
                <th className="text-right px-3 py-2">Scans</th>
                <th className="text-right px-3 py-2">Bookings</th>
                <th className="text-right px-3 py-2">Completed</th>
                <th className="text-right px-3 py-2">Commission</th>
              </tr>
            </thead>
            <tbody>
              {variantRows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-xs text-muted-foreground">No scans or bookings yet.</td></tr>
              ) : variantRows.map((r) => (
                <tr key={r.code} className="border-t">
                  <td className="px-3 py-2 font-mono text-[11px]">{r.code}</td>
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] capitalize">{r.scope}</Badge></td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.scans}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.bookings}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.completed}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{r.commission ? `${r.commission.toLocaleString()} ${currency}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Detailed commissions */}
      <section className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold inline-flex items-center gap-1"><ClipboardList size={12} />Commission detail · last {days}d</h3>
          <div className="text-[11px] text-muted-foreground">
            Gross <b className="text-foreground">{gross.toLocaleString()} {currency}</b> · Due <b style={{ color: brand }}>{commissionDue.toLocaleString()} {currency}</b> · Paid <b className="text-emerald-700">{commissionPaid.toLocaleString()} {currency}</b>
          </div>
          <Button size="sm" variant="outline" onClick={exportDetailedCSV} className="h-7 text-[11px]"><Download size={12} className="mr-1" />Export CSV</Button>
        </div>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Guest</th>
                <th className="text-left px-3 py-2">Room</th>
                <th className="text-right px-3 py-2">Pax</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-right px-3 py-2">Gross</th>
                <th className="text-right px-3 py-2">Rate</th>
                <th className="text-right px-3 py-2">Commission</th>
                <th className="text-left px-3 py-2">Payout</th>
                <th className="text-left px-3 py-2">QR</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-6 text-xs text-muted-foreground">No bookings in this window.</td></tr>
              ) : bookings.slice(0, 60).map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-3 py-2 text-[11px]">{(b.completed_at || b.created_at || "").slice(0, 10)}</td>
                  <td className="px-3 py-2 truncate max-w-[160px]">{b.guest_name || "—"}</td>
                  <td className="px-3 py-2 text-[11px]">{b.room_number || "—"}</td>
                  <td className="px-3 py-2 text-right">{b.participants ?? "—"}</td>
                  <td className="px-3 py-2"><Badge className={`text-[10px] capitalize ${b.status === "completed" ? "bg-emerald-600" : b.status === "cancelled" ? "bg-zinc-400" : "bg-amber-500"}`}>{b.status}</Badge></td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.gross_amount ? `${Number(b.gross_amount).toLocaleString()}` : "—"}</td>
                  <td className="px-3 py-2 text-right text-[11px]">{b.commission_rate ? `${b.commission_rate}%` : "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{b.commission_amount ? `${Number(b.commission_amount).toLocaleString()}` : "—"}</td>
                  <td className="px-3 py-2"><Badge variant="outline" className={`text-[10px] capitalize ${b.commission_status === "paid" ? "border-emerald-500 text-emerald-700" : b.commission_status === "due" ? "border-amber-500 text-amber-700" : ""}`}>{b.commission_status || "—"}</Badge></td>
                  <td className="px-3 py-2 text-[11px] font-mono">{b.qr_variant_code || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Payouts history */}
      <section className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold inline-flex items-center gap-1"><Wallet size={12} />Payout history</h3>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2">Period</th>
                <th className="text-left px-3 py-2">Paid on</th>
                <th className="text-right px-3 py-2">Amount</th>
                <th className="text-left px-3 py-2">Method</th>
                <th className="text-left px-3 py-2">Reference</th>
                <th className="text-right px-3 py-2">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-xs text-muted-foreground">No payouts recorded yet.</td></tr>
              ) : payouts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 text-[11px]">{p.period_start} → {p.period_end}</td>
                  <td className="px-3 py-2 text-[11px]">{p.paid_at ? format(parseISO(p.paid_at), "MMM d, yyyy") : <span className="text-amber-600">Pending</span>}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{Number(p.amount).toLocaleString()} {p.currency}</td>
                  <td className="px-3 py-2 text-[11px] capitalize">{p.method || "—"}</td>
                  <td className="px-3 py-2 text-[11px] font-mono truncate max-w-[160px]">{p.reference || "—"}</td>
                  <td className="px-3 py-2 text-right">{p.booking_ids?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

function Funnel({ label, value, accent, icon }: { label: string; value: number | string; accent?: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">{icon}{label}</p>
      <p className="text-2xl font-semibold mt-0.5" style={accent ? { color: accent } : {}}>{value}</p>
    </Card>
  );
}
