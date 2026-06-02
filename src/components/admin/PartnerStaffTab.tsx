import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Plus, Trash2, UserPlus } from "lucide-react";

type StaffRow = { id: string; user_id: string; email: string | null; created_at: string };

export function PartnerStaffTab({ partnerId, brandColor }: { partnerId: string; brandColor: string }) {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("partner_staff")
      .select("id,user_id,email,created_at")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Load failed", description: error.message, variant: "destructive" });
    setRows((data || []) as StaffRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [partnerId]);

  const invite = async () => {
    const e = email.trim().toLowerCase();
    if (!e) return;
    setInviting(true);
    const { data, error } = await supabase.functions.invoke("assign-partner-staff", {
      body: {
        action: "invite",
        partner_id: partnerId,
        email: e,
        redirect_to: `${window.location.origin}/partners`,
      },
    });
    setInviting(false);
    if (error || (data as any)?.error) {
      toast({ title: "Invite failed", description: error?.message || (data as any)?.error, variant: "destructive" });
      return;
    }
    toast({ title: (data as any)?.invited ? "Invitation sent" : "Staff added", description: e });
    setEmail("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this staff member from this property?")) return;
    const { error } = await supabase.functions.invoke("assign-partner-staff", {
      body: { action: "remove", partner_id: partnerId, staff_id: id },
    });
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Removed" });
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Staff access</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Invite hotel/riad staff by email. They'll get access to the concierge page for this property only.
        </p>
      </div>

      <Card className="p-3">
        <Label className="text-xs">Add staff member</Label>
        <div className="flex gap-2 mt-1.5">
          <Input
            type="email"
            placeholder="manager@riad.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), invite())}
          />
          <Button onClick={invite} disabled={inviting || !email.trim()} style={{ background: brandColor }}>
            {inviting ? <Loader2 size={14} className="animate-spin mr-1" /> : <UserPlus size={14} className="mr-1" />}
            Invite
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          New emails receive an invite link; existing users are added immediately.
        </p>
      </Card>

      {loading ? (
        <div className="py-6 text-center"><Loader2 className="animate-spin inline text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-6 text-center border-dashed">
          <Mail className="w-7 h-7 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No staff invited yet.</p>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/40">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.email || r.user_id.slice(0, 8)}</p>
                <p className="text-[11px] text-muted-foreground">Added {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px]">hotel_staff</Badge>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(r.id)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
