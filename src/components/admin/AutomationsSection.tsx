import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Bell, Mail, Clock, Package, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Automation {
  id: string; name: string; description: string | null; enabled: boolean; trigger_type: string;
}

const triggerIcons: Record<string, React.ElementType> = {
  on_status_change: Bell,
  on_insert: Mail,
  scheduled: Clock,
  on_update: Package,
  manual: Zap,
};

const triggerLabels: Record<string, string> = {
  on_status_change: "Status Change",
  on_insert: "On Insert",
  scheduled: "Scheduled",
  on_update: "On Update",
  manual: "Manual",
};

export function AutomationsSection() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAutomations = useCallback(async () => {
    const { data } = await supabase.from("automations").select("*").order("created_at");
    setAutomations((data as Automation[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const toggleAutomation = async (id: string, enabled: boolean) => {
    await supabase.from("automations").update({ enabled }).eq("id", id);
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, enabled } : a));
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
        <h3 className="font-bold text-foreground flex items-center gap-2"><Zap size={18} className="text-primary" /> Automations</h3>
        <p className="text-sm text-muted-foreground">Toggle automation rules for your workshop operations. Active automations run automatically based on their trigger type.</p>
      </div>

      <div className="space-y-3">
        {automations.map((auto) => {
          const Icon = triggerIcons[auto.trigger_type] || Zap;
          return (
            <div key={auto.id} className={`p-5 rounded-2xl bg-card border transition-all ${auto.enabled ? "border-primary/30" : "border-border/40"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${auto.enabled ? "bg-primary/10" : "bg-muted"}`}>
                  <Icon size={18} className={auto.enabled ? "text-primary" : "text-muted-foreground"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${auto.enabled ? "text-foreground" : "text-muted-foreground"}`}>{auto.name}</p>
                  {auto.description && <p className="text-xs text-muted-foreground mt-0.5">{auto.description}</p>}
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground mt-1 inline-block">
                    {triggerLabels[auto.trigger_type] || auto.trigger_type}
                  </span>
                </div>
                <Switch
                  checked={auto.enabled}
                  onCheckedChange={(checked) => toggleAutomation(auto.id, checked)}
                />
              </div>
            </div>
          );
        })}
        {automations.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No automations configured</p>
        )}
      </div>
    </div>
  );
}
