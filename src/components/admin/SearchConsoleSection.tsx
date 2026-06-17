import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, Search, TrendingUp, MousePointerClick, Eye, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";

type QueryRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

const PRESETS = ["tetouan", "tétouan", "pottery tetouan", "workshop tetouan", "things to do tetouan", "zellige"];

export function SearchConsoleSection() {
  const [filter, setFilter] = useState("tetouan");
  const [days, setDays] = useState("28");
  const [siteUrl, setSiteUrl] = useState("https://www.terrariaworkshops.com/");
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [series, setSeries] = useState<QueryRow[]>([]);
  const [sites, setSites] = useState<string[]>([]);

  const totals = useMemo(() => {
    const clicks = queries.reduce((s, r) => s + (r.clicks || 0), 0);
    const impressions = queries.reduce((s, r) => s + (r.impressions || 0), 0);
    const ctr = impressions ? (clicks / impressions) * 100 : 0;
    const avgPos = queries.length
      ? queries.reduce((s, r) => s + (r.position || 0), 0) / queries.length
      : 0;
    return { clicks, impressions, ctr, avgPos };
  }, [queries]);

  const loadSites = async () => {
    const { data, error } = await supabase.functions.invoke("search-console-analytics", {
      body: { action: "sites" },
    });
    if (error) return;
    const list: string[] = (data?.siteEntry || []).map((s: any) => s.siteUrl);
    setSites(list);
    if (list.length && !list.includes(siteUrl)) setSiteUrl(list[0]);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [q, t] = await Promise.all([
        supabase.functions.invoke("search-console-analytics", {
          body: { action: "queries", days: Number(days), siteUrl, filter },
        }),
        supabase.functions.invoke("search-console-analytics", {
          body: { action: "timeseries", days: Number(days), siteUrl, filter },
        }),
      ]);
      if (q.error) throw new Error(q.error.message);
      if (t.error) throw new Error(t.error.message);
      setQueries(q.data?.rows || []);
      setSeries(t.data?.rows || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load Search Console data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
    load();
  }, []);

  const chartData = series.map((r) => ({
    date: r.keys?.[0],
    clicks: r.clicks,
    impressions: r.impressions,
  }));

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-[hsl(20,15%,18%)] border-[hsl(20,15%,25%)]">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="text-xs text-[hsl(30,15%,60%)] block mb-1">Property</label>
            <Select value={siteUrl} onValueChange={setSiteUrl}>
              <SelectTrigger className="bg-[hsl(20,15%,14%)] border-[hsl(20,15%,25%)] text-[hsl(30,20%,90%)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sites.length === 0 && <SelectItem value={siteUrl}>{siteUrl}</SelectItem>}
                {sites.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-[hsl(30,15%,60%)] block mb-1">Range</label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-32 bg-[hsl(20,15%,14%)] border-[hsl(20,15%,25%)] text-[hsl(30,20%,90%)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="28">Last 28 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-[hsl(30,15%,60%)] block mb-1">Keyword filter (contains)</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[hsl(30,15%,55%)]" />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8 bg-[hsl(20,15%,14%)] border-[hsl(20,15%,25%)] text-[hsl(30,20%,90%)]"
                placeholder="tetouan"
              />
            </div>
          </div>
          <Button onClick={load} disabled={loading} className="bg-[hsl(24,90%,50%)] hover:bg-[hsl(24,90%,45%)]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setFilter(p); }}
              className={`text-xs px-2 py-1 rounded-full border transition ${
                filter === p
                  ? "bg-[hsl(24,90%,50%)] text-white border-[hsl(24,90%,50%)]"
                  : "bg-transparent text-[hsl(30,15%,70%)] border-[hsl(20,15%,28%)] hover:border-[hsl(24,90%,50%)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<MousePointerClick className="h-4 w-4" />} label="Clicks" value={totals.clicks.toLocaleString()} />
        <StatCard icon={<Eye className="h-4 w-4" />} label="Impressions" value={totals.impressions.toLocaleString()} />
        <StatCard icon={<Target className="h-4 w-4" />} label="CTR" value={`${totals.ctr.toFixed(2)}%`} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Avg position" value={totals.avgPos ? totals.avgPos.toFixed(1) : "—"} />
      </div>

      <Card className="p-4 bg-[hsl(20,15%,18%)] border-[hsl(20,15%,25%)]">
        <h3 className="text-sm font-semibold text-[hsl(30,20%,90%)] mb-3">Daily clicks & impressions</h3>
        <div className="h-64">
          {chartData.length === 0 ? (
            <EmptyHint loading={loading} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(20,15%,25%)" />
                <XAxis dataKey="date" stroke="hsl(30,15%,60%)" fontSize={11} />
                <YAxis stroke="hsl(30,15%,60%)" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(20,15%,14%)", border: "1px solid hsl(20,15%,28%)", color: "hsl(30,20%,90%)" }} />
                <Line type="monotone" dataKey="impressions" stroke="hsl(24,90%,50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clicks" stroke="hsl(160,70%,55%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-[hsl(20,15%,18%)] border-[hsl(20,15%,25%)]">
        <h3 className="text-sm font-semibold text-[hsl(30,20%,90%)] mb-3">
          Top queries containing "{filter}" ({queries.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[hsl(30,15%,60%)] border-b border-[hsl(20,15%,25%)]">
                <th className="py-2 pr-2">Query</th>
                <th className="py-2 px-2 text-right">Clicks</th>
                <th className="py-2 px-2 text-right">Impr.</th>
                <th className="py-2 px-2 text-right">CTR</th>
                <th className="py-2 pl-2 text-right">Position</th>
              </tr>
            </thead>
            <tbody>
              {queries.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-[hsl(30,15%,55%)]">
                  {loading ? "Loading…" : "No data yet. Verify the property in Search Console, then wait a few days for impressions to accrue."}
                </td></tr>
              )}
              {queries.map((r, i) => (
                <tr key={i} className="border-b border-[hsl(20,15%,22%)] text-[hsl(30,20%,88%)]">
                  <td className="py-2 pr-2">{r.keys?.[0]}</td>
                  <td className="py-2 px-2 text-right">{r.clicks.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{r.impressions.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{(r.ctr * 100).toFixed(2)}%</td>
                  <td className="py-2 pl-2 text-right">{r.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4 bg-[hsl(20,15%,18%)] border-[hsl(20,15%,25%)]">
      <div className="flex items-center gap-2 text-[hsl(30,15%,60%)] text-xs">{icon}{label}</div>
      <div className="mt-1 text-xl font-bold text-[hsl(30,20%,92%)]">{value}</div>
    </Card>
  );
}

function EmptyHint({ loading }: { loading: boolean }) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-[hsl(30,15%,55%)]">
      {loading ? "Loading…" : "No impressions yet for this filter."}
    </div>
  );
}
