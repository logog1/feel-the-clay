import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ShieldCheck, ShieldX, UserCheck, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManagedUser {
  user_id: string; email: string; created_at: string; role: string; last_sign_in_at: string | null;
}

export function AccessSection() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase.rpc("list_users_with_roles");
    setUsers((data as ManagedUser[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSetRole = async (userId: string, role: string) => {
    setSavingRole(userId);
    if (role === "pending") {
      await supabase.rpc("remove_user_role", { _target_user_id: userId });
    } else {
      await supabase.rpc("set_user_role", { _target_user_id: userId, _role: role as "admin" | "user" });
    }
    await fetchUsers();
    setSavingRole(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Shield size={18} className="text-primary" /> Access Management</h3>
        <p className="text-sm text-muted-foreground">Grant or revoke roles. Users without a role cannot access the dashboard.</p>
      </div>

      <div className="space-y-3">
        {users.map((u) => {
          const isPending = u.role === "pending";
          const isAdmin = u.role === "admin";
          const roleColors = isPending ? "bg-amber-100 text-amber-800 border-amber-200" : isAdmin ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-blue-100 text-blue-800 border-blue-200";

          return (
            <div key={u.user_id} className="p-5 rounded-2xl bg-card border border-border/40 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{u.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(u.created_at).toLocaleDateString()}
                  {u.last_sign_in_at && ` · Last login ${new Date(u.last_sign_in_at).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors}`}>
                  {isPending && <Clock size={12} />}
                  {isAdmin && <ShieldCheck size={12} />}
                  {u.role === "user" && <UserCheck size={12} />}
                  {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                </span>
                <Select value={u.role} onValueChange={(val) => handleSetRole(u.user_id, val)} disabled={savingRole === u.user_id}>
                  <SelectTrigger className="w-[130px] rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending"><span className="flex items-center gap-1.5"><ShieldX size={12} /> Pending</span></SelectItem>
                    <SelectItem value="user"><span className="flex items-center gap-1.5"><UserCheck size={12} /> User</span></SelectItem>
                    <SelectItem value="admin"><span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Admin</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
        {users.length === 0 && <p className="text-center text-muted-foreground py-12">No users found</p>}
      </div>
    </div>
  );
}
