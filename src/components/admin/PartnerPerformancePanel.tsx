import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, DollarSign, Receipt, CheckCircle2, XCircle, Loader2, Download, Wallet } from "lucide-react";

type Partner = { id: string; name: string; brand_color: string; commission_rate: number | null };
type Booking = {
  id: string; partner_id: string; status: string;
  gross_amount: number | null; commission_amount: number | null; commission_status: string | null;
  completed_at: string | null; cancelled_at: string | null; created_at: string;
};
type Payout = { id: string; partner_id: string; amount: number; currency: string; period_start: string; period_end: string; paid_at: string | null; method: string | null; reference: string | null; notes: string | null };

export function PartnerPerformancePanel({ partners }: { partners: Partner[] }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutFor, setPayoutFor] = useState<Partner | null>(null);

  const load = async () => {
    setLoading(true);
    const [b, p] = await Promise.all([
      (supabase as any).from("sofitel_bookings").select("id, partner_id, status, gross_amount, commission_amount, commission_status, completed_at, cancelled_at, created_at").not("partner_id", "is", null),
      (supabase as any).from("partner_payouts").select("*").order("paid_at", { ascending: false, nullsFirst: false }),
    ]);
    setBookings((b.data || []) as Booking[]);
    setPayouts((p.data || []) as Payout[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const perPartner = useMemo(() => {
    return partners.map((p) => {
      const bks = bookings.filter((b) => b.partner_id === p.id);
      const completed = bks.filter((b) => b.status === "completed");
      const cancelled = bks.filter((b) => b.status === "cancelled");
      const gross = completed.reduce((s, b) => s + Number(b.gross_amount || 0), 0);
      const commissionDue = completed.filter((b) => b.commission_status === "due").reduce((s, b) => s + Number(b.commission_amount || 0), 0);
      const commissionPaid = completed.filter((b) => b.commission_status === "paid").reduce((s, b) => s + Number(b.commission_amount || 0), 0);
      return { partner: p, total: bks.length, completed: completed.length, cancelled: cancelled.length, gross, commissionDue, commissionPaid };
    });
  }, [partners, bookings]);

  const totals = useMemo(() => perPartner.reduce(
    (acc, r) => ({
      bookings: acc.bookings + r.total,
      completed: acc.completed + r.completed,
      gross: acc.gross + r.gross,
      due: acc.due + r.commissionDue,
      paid: acc.paid + r.commissionPaid,
    }),
    { bookings: 0, completed: 0, gross: 0, due: 0, paid: 0 }
  ), [perPartner]);

  const exportAll = () => {
    const headers = ["Partner", "Bookings", "Completed", "Cancelled", "Gross", "Commission due", "Commission paid"];
    const rows = perPartner.map((r) => [r.partner.name, r.total, r.completed, r.cancelled, r.gross, r.commissionDue, r.commissionPaid]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `partner-performance-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><TrendingUp size={16} /> Partner performance</h3>
          <p className="text-xs text-muted-foreground">Bookings, commissions due and paid across all hotels & riads.</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-xl" onClick={exportAll}>
          <Download size={14} className="mr-1.5" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Total bookings" value={totals.bookings} icon={<Receipt size={14} />} />
        <Kpi label="Completed" value={totals.completed} icon={<CheckCircle2 size={14} />} accent="text-emerald-600" />
        <Kpi label="Gross" value={`${totals.gross.toLocaleString()} MAD`} icon={<DollarSign size={14} />} />
        <Kpi label="Commission due" value={`${totals.due.toLocaleString()} MAD`} icon={<Wallet size={14} />} accent="text-amber-600" />
        <Kpi label="Commission paid" value={`${totals.paid.toLocaleString()} MAD`} icon={<CheckCircle2 size={14} />} accent="text-emerald-600" />
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b">
                <th className="py-2 pr-2">Partner</th>
                <th className="py-2 pr-2 text-right">Bookings</th>
                <th className="py-2 pr-2 text-right">Done</th>
                <th className="py-2 pr-2 text-right">Cancel</th>
                <th className="py-2 pr-2 text-right">Gross</th>
                <th className="py-2 pr-2 text-right">Due</th>
                <th className="py-2 pr-2 text-right">Paid</th>
                <th className="py-2 pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {perPartner.map((r) => (
                <tr key={r.partner.id} className="border-b last:border-0">
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: r.partner.brand_color }} />
                      <span className="font-medium">{r.partner.name}</span>
                      {r.partner.commission_rate && <Badge variant="outline" className="text-[10px]">{r.partner.commission_rate}%</Badge>}
                    </div>
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">{r.total}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-emerald-700">{r.completed}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-muted-foreground">{r.cancelled}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{r.gross.toLocaleString()}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-amber-700">{r.commissionDue.toLocaleString()}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-emerald-700">{r.commissionPaid.toLocaleString()}</td>
                  <td className="py-2 pr-2 text-right">
                    <Button size="sm" variant="ghost" disabled={r.commissionDue <= 0} onClick={() => setPayoutFor(r.partner)}>
                      Pay out
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payouts history */}
      {payouts.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-xs uppercase tracking-wider text-muted-foreground font-semibold py-1">Recent payouts ({payouts.length})</summary>
          <div className="mt-2 space-y-1">
            {payouts.slice(0, 10).map((po) => {
              const partner = partners.find((p) => p.id === po.partner_id);
              return (
                <div key={po.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30 text-xs">
                  <span><strong>{partner?.name || "—"}</strong> · {po.period_start} → {po.period_end}</span>
                  <span className="font-medium">{Number(po.amount).toLocaleString()} {po.currency}</span>
                  <span className="text-muted-foreground">{po.paid_at ? new Date(po.paid_at).toLocaleDateString() : "Pending"}</span>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {payoutFor && (
        <PayoutDialog
          partner={payoutFor}
          dueAmount={perPartner.find((r) => r.partner.id === payoutFor.id)?.commissionDue || 0}
          bookings={bookings.filter((b) => b.partner_id === payoutFor.id && b.status === "completed" && b.commission_status === "due")}
          onClose={() => setPayoutFor(null)}
          onSaved={() => { setPayoutFor(null); load(); }}
        />
      )}
    </Card>
  );
}

function Kpi({ label, value, icon, accent }: { label: string; value: any; icon: React.ReactNode; accent?: string }) {
  return (
    <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground ${accent || ""}`}>{icon}{label}</div>
      <p className={`text-lg font-semibold mt-0.5 ${accent || ""}`}>{value}</p>
    </div>
  );
}

function PayoutDialog({ partner, dueAmount, bookings, onClose, onSaved }: {
  partner: Partner; dueAmount: number; bookings: Booking[];
  onClose: () => void; onSaved: () => void;
}) {
  const [amount, setAmount] = useState(String(dueAmount));
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const periodStart = bookings.reduce<string | null>((min, b) => {
    const d = (b.completed_at || b.created_at || "").slice(0, 10);
    return !min || d < min ? d : min;
  }, null) || new Date().toISOString().slice(0, 10);
  const periodEnd = new Date().toISOString().slice(0, 10);

  const submit = async () => {
    setSaving(true);
    const ids = bookings.map((b) => b.id);
    const { error: insErr } = await (supabase as any).from("partner_payouts").insert({
      partner_id: partner.id,
      amount: Number(amount) || 0,
      currency: "MAD",
      period_start: periodStart,
      period_end: periodEnd,
      paid_at: new Date().toISOString(),
      method,
      reference: reference || null,
      notes: notes || null,
      booking_ids: ids,
    });
    if (insErr) { setSaving(false); toast.error(insErr.message); return; }
    if (ids.length > 0) {
      const { error: updErr } = await (supabase as any).from("sofitel_bookings")
        .update({ commission_status: "paid" })
        .in("id", ids);
      if (updErr) { setSaving(false); toast.error(updErr.message); return; }
    }
    setSaving(false);
    toast.success(`Payout recorded for ${partner.name}`);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record payout · {partner.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            This marks <strong>{bookings.length}</strong> commission lines as paid for the period {periodStart} → {periodEnd}.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Amount (MAD)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div>
              <Label>Method</Label>
              <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div><Label>Reference</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction ID, check #..." /></div>
          <div><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <DollarSign size={14} className="mr-1" />}Record payout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
