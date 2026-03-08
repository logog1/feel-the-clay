import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ["hsl(24, 90%, 50%)", "hsl(12, 60%, 35%)", "hsl(142, 71%, 45%)", "hsl(217, 91%, 60%)", "hsl(280, 67%, 54%)"];

export function FinanceSection() {
  const [entries, setEntries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [e, o] = await Promise.all([
        supabase.from("accounting_entries").select("*").order("date", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      setEntries(e.data || []);
      setOrders(o.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Calculate totals
  const totalIncome = entries.filter((e) => e.type === "income").reduce((s, e) => s + Number(e.amount), 0)
    + orders.reduce((s, o) => s + (o.grand_total || 0), 0);
  const totalExpenses = entries.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
  const profit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : "0";

  // Monthly P&L data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    const monthIncome = entries.filter((e) => e.type === "income" && new Date(e.date) >= start && new Date(e.date) <= end)
      .reduce((s, e) => s + Number(e.amount), 0)
      + orders.filter((o) => new Date(o.created_at) >= start && new Date(o.created_at) <= end)
        .reduce((s, o) => s + (o.grand_total || 0), 0);
    
    const monthExpenses = entries.filter((e) => e.type === "expense" && new Date(e.date) >= start && new Date(e.date) <= end)
      .reduce((s, e) => s + Number(e.amount), 0);

    return {
      month: format(month, "MMM"),
      income: monthIncome,
      expenses: monthExpenses,
      profit: monthIncome - monthExpenses,
    };
  });

  // Expense categories
  const expenseByCategory = Object.entries(
    entries.filter((e) => e.type === "expense").reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `${totalIncome.toLocaleString()} DH`, icon: DollarSign, color: "text-emerald-600" },
          { label: "Total Expenses", value: `${totalExpenses.toLocaleString()} DH`, icon: TrendingDown, color: "text-red-500" },
          { label: "Net Profit", value: `${profit.toLocaleString()} DH`, icon: TrendingUp, color: profit >= 0 ? "text-emerald-600" : "text-red-500" },
          { label: "Margin", value: `${margin}%`, icon: ArrowUpDown, color: "text-primary" },
        ].map((k) => (
          <div key={k.label} className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                <k.icon size={18} className={k.color} />
              </div>
              <span className="text-xl font-bold text-foreground">{k.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly P&L */}
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <h3 className="font-bold text-foreground mb-4">Monthly P&L</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }} />
              <Legend />
              <Bar dataKey="income" fill="hsl(142, 71%, 45%)" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(0, 84%, 60%)" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="p-5 rounded-2xl bg-card border border-border/40">
          <h3 className="font-bold text-foreground mb-4">Expense Breakdown</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              No expense entries yet. Add entries in the Accounting tab.
            </div>
          )}
        </div>
      </div>

      {/* Profit Trend */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h3 className="font-bold text-foreground mb-4">Profit Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "13px" }} />
            <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
