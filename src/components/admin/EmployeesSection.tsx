import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CheckCircle2, UserCircle, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Employee {
  id: string; name: string; role: string; email: string | null; phone: string | null;
  avatar_url: string | null; is_active: boolean; notes: string | null; created_at: string;
}

const ROLES = ["instructor", "manager", "support", "sales", "finance", "admin"];

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

  const roleColors: Record<string, string> = {
    instructor: "bg-blue-100 text-blue-800 border-blue-200",
    manager: "bg-purple-100 text-purple-800 border-purple-200",
    support: "bg-emerald-100 text-emerald-800 border-emerald-200",
    sales: "bg-amber-100 text-amber-800 border-amber-200",
    finance: "bg-teal-100 text-teal-800 border-teal-200",
    admin: "bg-red-100 text-red-800 border-red-200",
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1 rounded-xl bg-card border border-border/40">
            <span className="font-bold text-foreground mr-1">{employees.filter((e) => e.is_active).length}</span>
            <span className="text-muted-foreground">Active</span>
          </span>
          <span className="px-3 py-1 rounded-xl bg-card border border-border/40">
            <span className="font-bold text-foreground mr-1">{employees.filter((e) => !e.is_active).length}</span>
            <span className="text-muted-foreground">Inactive</span>
          </span>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Employee
        </Button>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div key={emp.id} className={`p-5 rounded-2xl bg-card border border-border/40 space-y-3 ${!emp.is_active ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-3">
              {emp.avatar_url ? (
                <img src={emp.avatar_url} alt={emp.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <UserCircle size={24} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{emp.name}</p>
                <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium mt-0.5 ${roleColors[emp.role] || roleColors.support}`}>
                  {emp.role}
                </span>
              </div>
            </div>
            {emp.email && <p className="text-xs text-muted-foreground">📧 {emp.email}</p>}
            {emp.phone && <p className="text-xs text-muted-foreground">📞 {emp.phone}</p>}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="rounded-xl text-xs flex-1" onClick={() => toggleActive(emp)}>
                {emp.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => setDeleteId(emp.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        {employees.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">No employees yet</div>
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
