import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CheckCircle2, UserCircle, Upload, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Employee {
  id: string; name: string; role: string; email: string | null; phone: string | null;
  avatar_url: string | null; is_active: boolean; notes: string | null; created_at: string;
}

const ROLES = ["instructor", "manager", "support", "sales", "finance", "admin"];

const ROLE_STYLES: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  instructor: { bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/20", gradient: "from-blue-500/20 to-blue-600/5" },
  manager: { bg: "bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/20", gradient: "from-purple-500/20 to-purple-600/5" },
  support: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-600/5" },
  sales: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/20", gradient: "from-amber-500/20 to-amber-600/5" },
  finance: { bg: "bg-teal-500/10", text: "text-teal-700 dark:text-teal-400", border: "border-teal-500/20", gradient: "from-teal-500/20 to-teal-600/5" },
  admin: { bg: "bg-red-500/10", text: "text-red-700 dark:text-red-400", border: "border-red-500/20", gradient: "from-red-500/20 to-red-600/5" },
};

export function EmployeesSection() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", role: "instructor", email: "", phone: "", notes: "" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const fetchEmployees = useCallback(async () => {
    const { data } = await supabase.from("employees").select("*").order("name");
    setEmployees((data as Employee[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const fileName = `avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      setAvatarUrl(urlData.publicUrl);
    }
    setUploadingAvatar(false);
  };

  const addEmployee = async () => {
    if (!draft.name) return;
    await supabase.from("employees").insert({
      name: draft.name, role: draft.role, email: draft.email || null,
      phone: draft.phone || null, avatar_url: avatarUrl || null, notes: draft.notes || null,
    });
    setDraft({ name: "", role: "instructor", email: "", phone: "", notes: "" });
    setAvatarUrl("");
    setShowAdd(false);
    fetchEmployees();
  };

  const toggleActive = async (emp: Employee) => {
    await supabase.from("employees").update({ is_active: !emp.is_active }).eq("id", emp.id);
    fetchEmployees();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("employees").delete().eq("id", deleteId);
    setDeleteId(null);
    fetchEmployees();
  };

  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-xl bg-card border border-border/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-foreground">{employees.filter((e) => e.is_active).length}</span>
            <span className="text-muted-foreground">Active</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-card border border-border/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
            <span className="font-bold text-foreground">{employees.filter((e) => !e.is_active).length}</span>
            <span className="text-muted-foreground">Inactive</span>
          </span>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Employee
        </Button>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const style = ROLE_STYLES[emp.role] || ROLE_STYLES.support;
          return (
            <div
              key={emp.id}
              className={`group relative rounded-2xl bg-card border border-border/40 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${!emp.is_active ? "opacity-50 grayscale" : ""}`}
            >
              {/* Top gradient accent */}
              <div className={`h-20 bg-gradient-to-br ${style.gradient} relative`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
                {/* Status dot */}
                <div className="absolute top-3 right-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${emp.is_active ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/40"}`} />
                </div>
              </div>

              {/* Avatar - overlapping */}
              <div className="px-5 -mt-8 relative z-10">
                {emp.avatar_url ? (
                  <img
                    src={emp.avatar_url}
                    alt={emp.name}
                    className="w-16 h-16 rounded-2xl object-cover border-[3px] border-card shadow-md"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-2xl ${style.bg} border-[3px] border-card shadow-md flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${style.text}`}>{getInitials(emp.name)}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-5 pt-3 pb-5 space-y-3">
                <div>
                  <h3 className="font-bold text-foreground text-base">{emp.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Briefcase size={11} className={style.text} />
                    <span className={`text-xs font-semibold capitalize ${style.text}`}>{emp.role}</span>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5">
                  {emp.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  )}
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone size={12} className="shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>

                {emp.notes && (
                  <p className="text-xs text-muted-foreground/70 italic line-clamp-2">"{emp.notes}"</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-xl text-xs flex-1 ${emp.is_active ? "" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"}`}
                    onClick={() => toggleActive(emp)}
                  >
                    {emp.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(emp.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {employees.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-16">
            <UserCircle size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No employees yet</p>
            <p className="text-sm mt-1">Add your first team member to get started</p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center"><UserCircle size={28} className="text-muted-foreground" /></div>
              )}
              <div>
                <Label htmlFor="avatar-upload" className="text-xs cursor-pointer flex items-center gap-1 text-primary hover:underline">
                  <Upload size={12} /> {uploadingAvatar ? "Uploading..." : "Upload avatar"}
                </Label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
            </div>
            <div><Label className="text-xs">Name</Label><Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            <div><Label className="text-xs">Role</Label>
              <Select value={draft.role} onValueChange={(v) => setDraft((d) => ({ ...d, role: v }))}><SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
              <div><Label className="text-xs">Phone</Label><Input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Input value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} className="rounded-xl h-9 text-sm" /></div>
            <Button onClick={addEmployee} className="w-full rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <CheckCircle2 size={14} /> Add Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-destructive/30 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-foreground mb-2">Delete Employee?</h3>
            <p className="text-sm text-muted-foreground mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5" onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
