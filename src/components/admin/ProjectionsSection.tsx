import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Target, Users, DollarSign, Award, Milestone } from "lucide-react";

const SEASONALITY = [0.6, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]; // Jan-Dec

export function ProjectionsSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState("base");
  const [pricePerPerson, setPricePerPerson] = useState(200);
  const [utilization, setUtilization] = useState(65);
  const [variableCost, setVariableCost] = useState(40);
  const [fixedCosts, setFixedCosts] = useState(8000);

  useEffect(() => {
    const fetch = async () => {
      const [o, b] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("bookings").select("*"),
      ]);
      setOrders(o.data || []);
      setBookings(b.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Scenario multipliers
  const scenarioMultipliers: Record<string, number> = {
    conservative: 0.75,
    base: 1.0,
    aggressive: 1.35,
  };
  const mult = scenarioMultipliers[scenario] || 1;

  // Average monthly capacity (sessions per month * avg participants)
  const avgMonthlyParticipants = 30; // baseline
  
  // 36-month projection
  const projectionData = Array.from({ length: 36 }, (_, i) => {
    const monthIndex = i % 12;
    const yearFactor = 1 + (Math.floor(i / 12) * 0.15); // 15% annual growth
    const seasonal = SEASONALITY[monthIndex];
    const participants = Math.round(avgMonthlyParticipants * (utilization / 100) * seasonal * mult * yearFactor);
    const revenue = participants * pricePerPerson;
    const costs = fixedCosts + (participants * variableCost);
    const profit = revenue - costs;
    
    return {
      month: `M${i + 1}`,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      profit: Math.round(profit),
      participants,
    };
  });

  // Break-even
  const breakEvenMonth = projectionData.findIndex((d) => d.profit > 0);
  const totalProjectedRevenue = projectionData.reduce((s, d) => s + d.revenue, 0);
  const totalProjectedProfit = projectionData.reduce((s, d) => s + d.profit, 0);

  // Milestones
  const milestones = [
    { label: "Break Even", month: breakEvenMonth >= 0 ? `Month ${breakEvenMonth + 1}` : "Not reached", icon: Target, reached: breakEvenMonth >= 0 },
    { label: "100K Revenue", month: (() => { let cum = 0; const m = projectionData.findIndex((d) => { cum += d.revenue; return cum >= 100000; }); return m >= 0 ? `Month ${m + 1}` : "—"; })(), icon: DollarSign, reached: true },
    { label: "Second Hire", month: "Month 12", icon: Users, reached: false },
    { label: "Expansion", month: "Month 24", icon: Award, reached: false },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">Projection Parameters</h3>
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger className="rounded-xl h-9 text-sm w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="base">Base Case</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Price per person</span><span className="font-medium text-foreground">{pricePerPerson} DH</span></div>
            <Slider value={[pricePerPerson]} onValueChange={([v]) => setPricePerPerson(v)} min={50} max={500} step={10} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Utilization</span><span className="font-medium text-foreground">{utilization}%</span></div>
            <Slider value={[utilization]} onValueChange={([v]) => setUtilization(v)} min={10} max={100} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Variable cost/person</span><span className="font-medium text-foreground">{variableCost} DH</span></div>
            <Slider value={[variableCost]} onValueChange={([v]) => setVariableCost(v)} min={10} max={200} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Fixed costs/month</span><span className="font-medium text-foreground">{fixedCosts.toLocaleString()} DH</span></div>
            <Slider value={[fixedCosts]} onValueChange={([v]) => setFixedCosts(v)} min={1000} max={30000} step={500} />
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

      {/* Revenue/Profit Chart */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h3 className="font-bold text-foreground mb-4">36-Month Revenue & Profit Forecast</h3>
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
    </div>
  );
}
