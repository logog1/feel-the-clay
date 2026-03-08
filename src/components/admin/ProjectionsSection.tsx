import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Target, Users, DollarSign, Award, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SEASONALITY = [0.6, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6];

type ScenarioSettings = {
  pricePerPerson: number;
  utilization: number;
  variableCost: number;
  fixedCosts: number;
};

const DEFAULT_SETTINGS: Record<string, ScenarioSettings> = {
  conservative: { pricePerPerson: 150, utilization: 40, variableCost: 50, fixedCosts: 300 },
  base: { pricePerPerson: 200, utilization: 65, variableCost: 40, fixedCosts: 500 },
  aggressive: { pricePerPerson: 250, utilization: 85, variableCost: 35, fixedCosts: 800 },
};

const SCENARIO_MULTIPLIERS: Record<string, number> = {
  conservative: 0.75,
  base: 1.0,
  aggressive: 1.35,
};

export function ProjectionsSection() {
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState("base");
  const [allSettings, setAllSettings] = useState<Record<string, ScenarioSettings>>({ ...DEFAULT_SETTINGS });

  const current = allSettings[scenario] || DEFAULT_SETTINGS[scenario];
  const setCurrent = (patch: Partial<ScenarioSettings>) => {
    setAllSettings((prev) => ({
      ...prev,
      [scenario]: { ...(prev[scenario] || DEFAULT_SETTINGS[scenario]), ...patch },
    }));
  };

  // Load saved settings
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "projection_settings")
        .maybeSingle();
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          setAllSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch {}
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveSettings = useCallback(async () => {
    await supabase.from("site_settings").upsert({
      key: "projection_settings",
      value: JSON.stringify(allSettings),
      updated_at: new Date().toISOString(),
    });
    toast.success("Settings saved");
  }, [allSettings]);

  const mult = SCENARIO_MULTIPLIERS[scenario] || 1;
  const avgMonthlyParticipants = 30;

  const projectionData = Array.from({ length: 36 }, (_, i) => {
    const monthIndex = i % 12;
    const yearFactor = 1 + Math.floor(i / 12) * 0.15;
    const seasonal = SEASONALITY[monthIndex];
    const participants = Math.round(avgMonthlyParticipants * (current.utilization / 100) * seasonal * mult * yearFactor);
    const revenue = participants * current.pricePerPerson;
    const costs = current.fixedCosts + participants * current.variableCost;
    const profit = revenue - costs;
    return { month: `M${i + 1}`, revenue: Math.round(revenue), costs: Math.round(costs), profit: Math.round(profit), participants };
  });

  const breakEvenMonth = projectionData.findIndex((d) => d.profit > 0);
  const totalProjectedRevenue = projectionData.reduce((s, d) => s + d.revenue, 0);
  const totalProjectedProfit = projectionData.reduce((s, d) => s + d.profit, 0);

  const milestones = [
    { label: "Break Even", month: breakEvenMonth >= 0 ? `Month ${breakEvenMonth + 1}` : "Not reached", icon: Target },
    { label: "100K Revenue", month: (() => { let cum = 0; const m = projectionData.findIndex((d) => { cum += d.revenue; return cum >= 100000; }); return m >= 0 ? `Month ${m + 1}` : "—"; })(), icon: DollarSign },
    { label: "Second Hire", month: "Month 12", icon: Users },
    { label: "Expansion", month: "Month 24", icon: Award },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">Projection Parameters</h3>
          <div className="flex items-center gap-2">
            <Select value={scenario} onValueChange={setScenario}>
              <SelectTrigger className="rounded-xl h-9 text-sm w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="base">Base Case</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={saveSettings}>
              <Save size={14} /> Save
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground -mt-3">Each scenario saves its own settings independently.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Price per person</span><span className="font-medium text-foreground">{current.pricePerPerson} DH</span></div>
            <Slider value={[current.pricePerPerson]} onValueChange={([v]) => setCurrent({ pricePerPerson: v })} min={50} max={500} step={10} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Utilization</span><span className="font-medium text-foreground">{current.utilization}%</span></div>
            <Slider value={[current.utilization]} onValueChange={([v]) => setCurrent({ utilization: v })} min={5} max={100} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Variable cost/person</span><span className="font-medium text-foreground">{current.variableCost} DH</span></div>
            <Slider value={[current.variableCost]} onValueChange={([v]) => setCurrent({ variableCost: v })} min={5} max={200} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Fixed costs/month</span><span className="font-medium text-foreground">{current.fixedCosts.toLocaleString()} DH</span></div>
            <Slider value={[current.fixedCosts]} onValueChange={([v]) => setCurrent({ fixedCosts: v })} min={0} max={30000} step={100} />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {milestones.map((m) => (
          <div key={m.label} className="p-4 rounded-2xl bg-card border border-border/40 space-y-1">
            <div className="flex items-center gap-2">
              <m.icon size={16} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{m.month}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h3 className="font-bold text-foreground mb-4">36-Month Revenue & Profit Forecast ({scenario})</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={2} />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="hsl(142, 71%, 45%)" name="Revenue" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="costs" stroke="hsl(0, 84%, 60%)" name="Costs" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" name="Profit" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <p className="text-sm text-muted-foreground mb-1">Total Projected Revenue (3yr)</p>
          <p className="text-2xl font-bold text-foreground">{totalProjectedRevenue.toLocaleString()} DH</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <p className="text-sm text-muted-foreground mb-1">Total Projected Profit (3yr)</p>
          <p className={`text-2xl font-bold ${totalProjectedProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>{totalProjectedProfit.toLocaleString()} DH</p>
        </div>
      </div>

      {/* Operational Breakdown */}
      {(() => {
        const totalParticipants3yr = projectionData.reduce((s, d) => s + d.participants, 0);
        const avgMonthlyPart = Math.round(totalParticipants3yr / 36);
        const sessionsPerDay = 2;
        const avgGroupSize = 6;
        const monthlyWorkshops = Math.ceil(avgMonthlyPart / avgGroupSize);
        const monthlyWorkDays = Math.ceil(monthlyWorkshops / sessionsPerDay);
        const yearlyWorkshops = monthlyWorkshops * 12;
        const yearlyWorkDays = monthlyWorkDays * 12;
        const avgRevenuePerWorkshop = avgMonthlyPart > 0 ? Math.round((current.pricePerPerson * avgMonthlyPart) / monthlyWorkshops) : 0;
        const avgCostPerWorkshop = monthlyWorkshops > 0 ? Math.round(((current.fixedCosts + current.variableCost * avgMonthlyPart) / monthlyWorkshops)) : 0;
        const avgProfitPerWorkshop = avgRevenuePerWorkshop - avgCostPerWorkshop;

        return (
          <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-4">
            <h3 className="font-bold text-foreground">Operational Breakdown <span className="text-xs font-normal text-muted-foreground ml-2">({scenario} scenario — avg/month)</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Customers / month", value: avgMonthlyPart, suffix: "" },
                { label: "Workshops / month", value: monthlyWorkshops, suffix: "" },
                { label: "Work days / month", value: monthlyWorkDays, suffix: " days" },
                { label: "Customers (3yr total)", value: totalParticipants3yr.toLocaleString(), suffix: "" },
                { label: "Workshops / year", value: yearlyWorkshops, suffix: "" },
                { label: "Work days / year", value: yearlyWorkDays, suffix: "" },
                { label: "Revenue / workshop", value: `${avgRevenuePerWorkshop.toLocaleString()} DH`, suffix: "" },
                { label: "Profit / workshop", value: `${avgProfitPerWorkshop.toLocaleString()} DH`, suffix: "", color: avgProfitPerWorkshop >= 0 },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-muted/30 border border-border/20">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color === false ? "text-red-600" : item.color === true ? "text-emerald-700" : "text-foreground"}`}>
                    {item.value}{item.suffix}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Based on ~{avgGroupSize} participants/session, {sessionsPerDay} sessions/day</p>
          </div>
        );
      })()}
    </div>
  );
}
