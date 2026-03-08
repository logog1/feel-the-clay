import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ReferenceLine } from "recharts";
import { TrendingUp, Target, Users, DollarSign, Award, Save, AlertTriangle, UserPlus, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SEASONALITY = [0.6, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type ScenarioSettings = {
  pricePerPerson: number;
  utilization: number;
  variableCost: number;
  fixedCosts: number;
  // Capacity
  daysPerWeek: number;
  sessionsPerDay: number;
  minGroupSize: number;
  maxGroupSize: number;
  // Hiring
  instructorCapacitySessions: number; // max sessions 1 instructor can handle per day
  instructorCost: number; // monthly cost per instructor
};

const DEFAULT_SETTINGS: Record<string, ScenarioSettings> = {
  conservative: {
    pricePerPerson: 150, utilization: 40, variableCost: 50, fixedCosts: 300,
    daysPerWeek: 3, sessionsPerDay: 1, minGroupSize: 4, maxGroupSize: 8,
    instructorCapacitySessions: 2, instructorCost: 3000,
  },
  base: {
    pricePerPerson: 200, utilization: 65, variableCost: 40, fixedCosts: 500,
    daysPerWeek: 5, sessionsPerDay: 2, minGroupSize: 4, maxGroupSize: 10,
    instructorCapacitySessions: 2, instructorCost: 4000,
  },
  aggressive: {
    pricePerPerson: 250, utilization: 85, variableCost: 35, fixedCosts: 800,
    daysPerWeek: 5, sessionsPerDay: 2, minGroupSize: 6, maxGroupSize: 10,
    instructorCapacitySessions: 2, instructorCost: 5000,
  },
};

const SCENARIO_MULTIPLIERS: Record<string, number> = {
  conservative: 0.75,
  base: 1.0,
  aggressive: 1.35,
};

function CapacityBar({ label, current, max, unit, warning }: { label: string; current: number; max: number; unit: string; warning?: boolean }) {
  const pct = Math.min((current / max) * 100, 100);
  const isOver = current > max;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", isOver ? "text-red-500" : pct > 80 ? "text-amber-500" : "text-foreground")}>
          {current} / {max} {unit} {isOver && <AlertTriangle className="inline w-3 h-3 ml-0.5" />}
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-primary")}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

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

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "projection_settings").maybeSingle();
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          // Merge with defaults to ensure new fields exist
          const merged: Record<string, ScenarioSettings> = {};
          for (const key of Object.keys(DEFAULT_SETTINGS)) {
            merged[key] = { ...DEFAULT_SETTINGS[key], ...(parsed[key] || {}) };
          }
          setAllSettings(merged);
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

  // ─── Capacity calculations ───
  const weeksPerMonth = 4.33;
  const workDaysPerMonth = Math.round(current.daysPerWeek * weeksPerMonth);
  const maxSessionsPerMonth = workDaysPerMonth * current.sessionsPerDay;
  const avgGroupSize = (current.minGroupSize + current.maxGroupSize) / 2;
  const maxParticipantsPerMonth = Math.round(maxSessionsPerMonth * avgGroupSize);

  const mult = SCENARIO_MULTIPLIERS[scenario] || 1;
  const baseMonthlyDemand = 30; // base monthly demand participants

  // ─── 36-month projection ───
  const projectionData = Array.from({ length: 36 }, (_, i) => {
    const monthIndex = i % 12;
    const yearFactor = 1 + Math.floor(i / 12) * 0.15;
    const seasonal = SEASONALITY[monthIndex];
    const rawDemand = Math.round(baseMonthlyDemand * (current.utilization / 100) * seasonal * mult * yearFactor);
    const participants = Math.min(rawDemand, maxParticipantsPerMonth); // capped by capacity
    const unmetDemand = Math.max(0, rawDemand - maxParticipantsPerMonth);
    const sessionsNeeded = Math.ceil(participants / avgGroupSize);
    const revenue = participants * current.pricePerPerson;
    const costs = current.fixedCosts + participants * current.variableCost;
    const profit = revenue - costs;
    const capacityPct = Math.round((participants / maxParticipantsPerMonth) * 100);
    // Hiring: how many instructors needed
    const maxSessionsPerInstructor = current.instructorCapacitySessions * workDaysPerMonth;
    const instructorsNeeded = Math.ceil(sessionsNeeded / maxSessionsPerInstructor);

    return {
      month: `M${i + 1}`,
      label: MONTH_LABELS[monthIndex],
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      profit: Math.round(profit),
      participants,
      rawDemand,
      unmetDemand,
      sessionsNeeded,
      capacityPct,
      instructorsNeeded,
    };
  });

  // Current month (first month)
  const currentMonth = projectionData[0];

  const breakEvenMonth = projectionData.findIndex((d) => d.profit > 0);
  const totalProjectedRevenue = projectionData.reduce((s, d) => s + d.revenue, 0);
  const totalProjectedProfit = projectionData.reduce((s, d) => s + d.profit, 0);
  const totalUnmetDemand = projectionData.reduce((s, d) => s + d.unmetDemand, 0);

  // Hiring milestones
  const firstNeed2 = projectionData.findIndex((d) => d.instructorsNeeded >= 2);
  const firstNeed3 = projectionData.findIndex((d) => d.instructorsNeeded >= 3);
  const firstCapacityHit = projectionData.findIndex((d) => d.capacityPct >= 90);

  const milestones = [
    { label: "Break Even", month: breakEvenMonth >= 0 ? `Month ${breakEvenMonth + 1}` : "Not reached", icon: Target },
    { label: "90% Capacity", month: firstCapacityHit >= 0 ? `Month ${firstCapacityHit + 1}` : "—", icon: AlertTriangle },
    { label: "2nd Instructor Needed", month: firstNeed2 >= 0 ? `Month ${firstNeed2 + 1}` : "—", icon: UserPlus },
    { label: "3rd Instructor Needed", month: firstNeed3 >= 0 ? `Month ${firstNeed3 + 1}` : "—", icon: Users },
  ];

  // Capacity chart data (12 months)
  const capacityChartData = projectionData.slice(0, 12).map((d) => ({
    month: d.label,
    demand: d.rawDemand,
    served: d.participants,
    capacity: maxParticipantsPerMonth,
  }));

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* ─── Scenario & Save ─── */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Projections</h3>
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

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── CAPACITY SECTION ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="p-5 rounded-2xl bg-card border-2 border-primary/20 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" /> Your Maximum Capacity
        </h4>
        <p className="text-xs text-muted-foreground">Define how much you can handle. This caps all projections — demand above capacity = lost customers.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Working days / week</span>
              <span className="font-semibold text-foreground">{current.daysPerWeek} days</span>
            </div>
            <Slider value={[current.daysPerWeek]} onValueChange={([v]) => setCurrent({ daysPerWeek: v })} min={1} max={7} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Workshops / day</span>
              <span className="font-semibold text-foreground">{current.sessionsPerDay}</span>
            </div>
            <Slider value={[current.sessionsPerDay]} onValueChange={([v]) => setCurrent({ sessionsPerDay: v })} min={1} max={4} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Min group size</span>
              <span className="font-semibold text-foreground">{current.minGroupSize} people</span>
            </div>
            <Slider value={[current.minGroupSize]} onValueChange={([v]) => setCurrent({ minGroupSize: Math.min(v, current.maxGroupSize) })} min={1} max={15} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Max group size</span>
              <span className="font-semibold text-foreground">{current.maxGroupSize} people</span>
            </div>
            <Slider value={[current.maxGroupSize]} onValueChange={([v]) => setCurrent({ maxGroupSize: Math.max(v, current.minGroupSize) })} min={1} max={20} step={1} />
          </div>
        </div>

        {/* Capacity summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/30">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-xs text-muted-foreground">Work days / month</p>
            <p className="text-xl font-bold text-foreground">{workDaysPerMonth}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-xs text-muted-foreground">Max workshops / month</p>
            <p className="text-xl font-bold text-foreground">{maxSessionsPerMonth}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-xs text-muted-foreground">Avg group size</p>
            <p className="text-xl font-bold text-foreground">{avgGroupSize}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground font-medium">MAX people / month</p>
            <p className="text-xl font-bold text-primary">{maxParticipantsPerMonth}</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── HIRING SECTION ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="p-5 rounded-2xl bg-card border-2 border-amber-500/20 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <UserPlus size={16} className="text-amber-500" /> Hiring & Staffing Plan
        </h4>
        <p className="text-xs text-muted-foreground">
          Based on how many sessions one instructor can run per day. When demand exceeds one instructor's capacity, you'll need to hire.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Sessions 1 instructor can do / day</span>
              <span className="font-semibold text-foreground">{current.instructorCapacitySessions}</span>
            </div>
            <Slider value={[current.instructorCapacitySessions]} onValueChange={([v]) => setCurrent({ instructorCapacitySessions: v })} min={1} max={4} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Monthly cost / instructor</span>
              <span className="font-semibold text-foreground">{current.instructorCost.toLocaleString()} DH</span>
            </div>
            <Slider value={[current.instructorCost]} onValueChange={([v]) => setCurrent({ instructorCost: v })} min={1000} max={15000} step={500} />
          </div>
        </div>

        {/* Hiring timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border/30">
          {[
            {
              label: "You alone",
              maxSessions: current.instructorCapacitySessions * workDaysPerMonth,
              color: "text-primary",
              bg: "bg-primary/5 border-primary/10",
            },
            {
              label: "Need 2nd instructor",
              month: firstNeed2 >= 0 ? `Month ${firstNeed2 + 1}` : "Not in 3 years",
              addedCost: current.instructorCost,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/30",
            },
            {
              label: "Need 3rd instructor",
              month: firstNeed3 >= 0 ? `Month ${firstNeed3 + 1}` : "Not in 3 years",
              addedCost: current.instructorCost * 2,
              color: "text-red-600",
              bg: "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/30",
            },
          ].map((tier) => (
            <div key={tier.label} className={cn("p-4 rounded-xl border space-y-1", tier.bg)}>
              <p className={cn("text-sm font-semibold", tier.color)}>{tier.label}</p>
              {"maxSessions" in tier && (
                <p className="text-xs text-muted-foreground">Up to {tier.maxSessions} sessions/month ({tier.maxSessions * avgGroupSize} people)</p>
              )}
              {"month" in tier && (
                <>
                  <p className="text-lg font-bold text-foreground">{tier.month}</p>
                  <p className="text-xs text-muted-foreground">+{tier.addedCost?.toLocaleString()} DH/month staffing</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Capacity vs Demand Chart ─── */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h4 className="font-bold text-foreground mb-1">Capacity vs Demand (Year 1)</h4>
        <p className="text-xs text-muted-foreground mb-4">Green = served, red line = your max capacity. Demand above the line = lost customers.</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={capacityChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
            <Legend />
            <Bar dataKey="demand" fill="hsl(var(--muted-foreground) / 0.3)" name="Total Demand" radius={[4, 4, 0, 0]} />
            <Bar dataKey="served" fill="hsl(142, 71%, 45%)" name="Served" radius={[4, 4, 0, 0]} />
            <ReferenceLine y={maxParticipantsPerMonth} stroke="hsl(0, 84%, 60%)" strokeDasharray="6 4" strokeWidth={2} label={{ value: `Max: ${maxParticipantsPerMonth}`, fill: "hsl(0, 84%, 60%)", fontSize: 11, position: "right" }} />
          </BarChart>
        </ResponsiveContainer>
        {totalUnmetDemand > 0 && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Estimated {totalUnmetDemand} people turned away over 3 years due to capacity limits.
          </p>
        )}
      </div>

      {/* ─── Financial Controls ─── */}
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2"><DollarSign size={16} className="text-primary" /> Financial Parameters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Price per person</span><span className="font-medium text-foreground">{current.pricePerPerson} DH</span></div>
            <Slider value={[current.pricePerPerson]} onValueChange={([v]) => setCurrent({ pricePerPerson: v })} min={50} max={500} step={10} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Utilization (demand level)</span><span className="font-medium text-foreground">{current.utilization}%</span></div>
            <Slider value={[current.utilization]} onValueChange={([v]) => setCurrent({ utilization: v })} min={5} max={100} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Variable cost / person</span><span className="font-medium text-foreground">{current.variableCost} DH</span></div>
            <Slider value={[current.variableCost]} onValueChange={([v]) => setCurrent({ variableCost: v })} min={5} max={200} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Fixed costs / month</span><span className="font-medium text-foreground">{current.fixedCosts.toLocaleString()} DH</span></div>
            <Slider value={[current.fixedCosts]} onValueChange={([v]) => setCurrent({ fixedCosts: v })} min={0} max={30000} step={100} />
          </div>
        </div>
      </div>

      {/* ─── Milestones ─── */}
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

      {/* ─── 36-Month Chart ─── */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h4 className="font-bold text-foreground mb-4">36-Month Revenue & Profit Forecast ({scenario})</h4>
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

      {/* ─── Summary ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <p className="text-sm text-muted-foreground mb-1">Avg Monthly Revenue</p>
          <p className="text-2xl font-bold text-foreground">{Math.round(totalProjectedRevenue / 36).toLocaleString()} DH</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <p className="text-sm text-muted-foreground mb-1">Total Revenue (3yr)</p>
          <p className="text-2xl font-bold text-foreground">{totalProjectedRevenue.toLocaleString()} DH</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <p className="text-sm text-muted-foreground mb-1">Total Profit (3yr)</p>
          <p className={cn("text-2xl font-bold", totalProjectedProfit >= 0 ? "text-emerald-700" : "text-red-600")}>{totalProjectedProfit.toLocaleString()} DH</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <p className="text-sm text-muted-foreground mb-1">Lost Customers (3yr)</p>
          <p className={cn("text-2xl font-bold", totalUnmetDemand > 0 ? "text-amber-600" : "text-foreground")}>{totalUnmetDemand.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
