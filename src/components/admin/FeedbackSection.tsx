import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { format, startOfMonth } from "date-fns";
import { Download, Trash2, Search, RefreshCw, TrendingUp, Heart, Sparkles, Star } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

interface Feedback {
  id: string;
  name: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  satisfaction: string | null;
  recommendation: string | null;
  length_appropriate: string | null;
  expectations: string | null;
  facilitators: string | null;
  materials: string | null;
  source: string | null;
  liked_most: string | null;
  suggestions: string | null;
  effectiveness: string | null;
  created_at: string;
}

const FILTERS: { key: keyof Feedback; label: string }[] = [
  { key: "satisfaction", label: "Satisfaction" },
  { key: "recommendation", label: "Recommendation" },
  { key: "length_appropriate", label: "Length" },
  { key: "expectations", label: "Expectations" },
  { key: "facilitators", label: "Facilitators" },
  { key: "materials", label: "Materials" },
  { key: "source", label: "Source" },
];

export function FeedbackSection() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Feedback | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data || []) as Feedback[]);
  };

  const options = useMemo(() => {
    const o: Record<string, string[]> = {};
    FILTERS.forEach((f) => {
      o[f.key] = Array.from(new Set(rows.map((r) => r[f.key]).filter(Boolean) as string[])).sort();
    });
    return o;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      for (const [k, v] of Object.entries(filters)) {
        if (v && v !== "__all__" && r[k as keyof Feedback] !== v) return false;
      }
      if (!q) return true;
      return [r.name, r.liked_most, r.suggestions, r.effectiveness]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q));
    });
  }, [rows, filters, search]);

  const SAT_SCORE: Record<string, number> = {
    "Very satisfied": 5, "Somewhat satisfied": 4, "Neutral": 3,
    "Somewhat dissatisfied": 2, "Very dissatisfied": 1,
  };
  const REC_SCORE: Record<string, number> = {
    "Very likely": 5, "Somewhat likely": 4, "Neutral": 3,
    "Somewhat unlikely": 2, "Very unlikely": 1,
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const sat = rows.filter((r) => r.satisfaction?.includes("satisfied") && !r.satisfaction?.includes("dis")).length;
    const promoters = rows.filter((r) => r.recommendation === "Very likely" || r.recommendation === "Somewhat likely").length;
    const detractors = rows.filter((r) => r.recommendation === "Very unlikely" || r.recommendation === "Somewhat unlikely").length;
    const satScores = rows.map((r) => SAT_SCORE[r.satisfaction || ""]).filter(Boolean);
    const avgSat = satScores.length ? satScores.reduce((a, b) => a + b, 0) / satScores.length : 0;
    const recScores = rows.map((r) => REC_SCORE[r.recommendation || ""]).filter(Boolean);
    const avgRec = recScores.length ? recScores.reduce((a, b) => a + b, 0) / recScores.length : 0;
    const nps = total ? Math.round(((promoters - detractors) / total) * 100) : 0;
    return { total, sat, promoters, detractors, avgSat, avgRec, nps };
  }, [rows]);

  // Chart data
  const chartData = useMemo(() => {
    const dist = (key: keyof Feedback, order: string[]) => {
      const counts: Record<string, number> = {};
      order.forEach((o) => (counts[o] = 0));
      rows.forEach((r) => {
        const v = r[key] as string | null;
        if (v && counts[v] !== undefined) counts[v]++;
      });
      return order.map((name) => ({ name, value: counts[name] }));
    };
    const satisfaction = dist("satisfaction", [
      "Very satisfied", "Somewhat satisfied", "Neutral", "Somewhat dissatisfied", "Very dissatisfied",
    ]);
    const recommendation = dist("recommendation", [
      "Very likely", "Somewhat likely", "Neutral", "Somewhat unlikely", "Very unlikely",
    ]);
    const expectations = dist("expectations", [
      "Exceeded expectations", "Met expectations", "Did not meet expectations",
    ]);
    const facilitators = dist("facilitators", [
      "Extremely engaging", "Very engaging", "Somewhat engaging", "Not very engaging", "Not at all engaging",
    ]);
    const materials = dist("materials", [
      "Extremely helpful", "Very helpful", "Somewhat helpful", "Not very helpful", "Not at all helpful",
    ]);
    const length = dist("length_appropriate", ["Too short", "Just right", "Too long"]);
    const source = dist("source", [
      "Instagram", "TikTok", "Facebook", "Google Search",
      "Friend or family recommendation", "Event / collaboration", "Walk-in / saw the place", "Other",
    ]).filter((s) => s.value > 0);

    // Trend by month
    const byMonth: Record<string, { count: number; satSum: number; satN: number }> = {};
    rows.forEach((r) => {
      const k = format(startOfMonth(new Date(r.created_at)), "yyyy-MM");
      byMonth[k] = byMonth[k] || { count: 0, satSum: 0, satN: 0 };
      byMonth[k].count++;
      const s = SAT_SCORE[r.satisfaction || ""];
      if (s) { byMonth[k].satSum += s; byMonth[k].satN++; }
    });
    const trend = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({
        month: format(new Date(k + "-01"), "MMM yy"),
        responses: v.count,
        avgSat: v.satN ? +(v.satSum / v.satN).toFixed(2) : 0,
      }));

    return { satisfaction, recommendation, expectations, facilitators, materials, length, source, trend };
  }, [rows]);

  const exportCsv = () => {
    const headers = [
      "created_at", "name", "email", "phone", "satisfaction", "recommendation",
      "length_appropriate", "expectations", "facilitators", "materials", "source",
      "liked_most", "suggestions", "effectiveness",
    ];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...filtered.map((r) => headers.map((h) => esc((r as any)[h])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this feedback entry?")) return;
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
    setSelected(null);
    toast({ title: "Deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Workshop Feedback</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} of {rows.length} entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="w-4 h-4 mr-1.5" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={<Sparkles className="w-4 h-4" />} label="Total responses" value={stats.total} />
        <StatCard icon={<Heart className="w-4 h-4 text-rose-500" />} label="Satisfied" value={stats.sat} sub={stats.total ? `${Math.round((stats.sat / stats.total) * 100)}%` : "0%"} />
        <StatCard icon={<Star className="w-4 h-4 text-amber-500" />} label="Avg satisfaction" value={stats.avgSat.toFixed(2)} sub="/ 5" />
        <StatCard icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} label="Avg recommend" value={stats.avgRec.toFixed(2)} sub="/ 5" />
        <StatCard icon={<TrendingUp className="w-4 h-4 text-primary" />} label="NPS score" value={stats.nps} sub={`${stats.promoters} promoters · ${stats.detractors} detractors`} />
      </div>

      {rows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="Satisfaction">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.satisfaction} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Recommendation likelihood">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.recommendation} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Expectations">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData.expectations.filter((d) => d.value > 0)} dataKey="value" nameKey="name" outerRadius={75} label={(e: any) => `${e.value}`}>
                  {chartData.expectations.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Workshop length">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData.length.filter((d) => d.value > 0)} dataKey="value" nameKey="name" outerRadius={75} label={(e: any) => `${e.value}`}>
                  {chartData.length.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Facilitator engagement">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.facilitators} layout="vertical" margin={{ left: 30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Materials helpfulness">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData.materials} layout="vertical" margin={{ left: 30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {chartData.source.length > 0 && (
            <ChartCard title="How they heard about us">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.source} layout="vertical" margin={{ left: 30, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {chartData.trend.length > 1 && (
            <ChartCard title="Responses & avg satisfaction over time">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData.trend} margin={{ left: -10, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="l" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="r" orientation="right" domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="l" type="monotone" dataKey="responses" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line yAxisId="r" type="monotone" dataKey="avgSat" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {FILTERS.map((f) => (
            <Select
              key={f.key as string}
              value={filters[f.key as string] || "__all__"}
              onValueChange={(v) => setFilters((p) => ({ ...p, [f.key]: v }))}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All {f.label}</SelectItem>
                {(options[f.key as string] || []).map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
        {Object.values(filters).some((v) => v && v !== "__all__") && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="text-xs">
            Clear filters
          </Button>
        )}
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No feedback matches your filters.</Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <Card
              key={r.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(r)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold">{r.name || "Anonymous"}</span>
                  
                  <span className="text-xs text-muted-foreground ml-auto">
                    {format(new Date(r.created_at), "PP")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {r.satisfaction && <Pill>{r.satisfaction}</Pill>}
                  {r.recommendation && <Pill>{r.recommendation}</Pill>}
                  {r.source && <Pill variant="muted">{r.source}</Pill>}
                </div>
                {r.liked_most && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.liked_most}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">{selected.name || "Anonymous"}</h2>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selected.created_at), "PPpp")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => deleteRow(selected.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {(selected.email || selected.phone) && (
                <div className="grid sm:grid-cols-2 gap-3 bg-muted/40 rounded-lg p-3">
                  {selected.email && (
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Email</div>
                      <a href={`mailto:${selected.email}`} className="text-sm font-medium text-primary hover:underline break-all">{selected.email}</a>
                    </div>
                  )}
                  {selected.phone && (
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Phone</div>
                      <a href={`tel:${selected.phone}`} className="text-sm font-medium text-primary hover:underline">{selected.phone}</a>
                    </div>
                  )}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Satisfaction" value={selected.satisfaction} />
                <Field label="Recommendation" value={selected.recommendation} />
                <Field label="Length" value={selected.length_appropriate} />
                <Field label="Expectations" value={selected.expectations} />
                <Field label="Facilitators" value={selected.facilitators} />
                <Field label="Materials" value={selected.materials} />
                <Field label="Heard via" value={selected.source} />
              </div>
              <LongField label="Liked most" value={selected.liked_most} />
              <LongField label="Suggestions" value={selected.suggestions} />
              <LongField label="Effectiveness" value={selected.effectiveness} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ children, variant }: { children: React.ReactNode; variant?: "muted" }) {
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full border ${
        variant === "muted"
          ? "bg-muted text-muted-foreground border-border"
          : "bg-primary/10 text-primary border-primary/20"
      }`}
    >
      {children}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function LongField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#84cc16",
];

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </Card>
  );
}
