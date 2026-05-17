import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Download, Trash2, MessageSquare, Search, RefreshCw } from "lucide-react";

interface Feedback {
  id: string;
  name: string | null;
  organization: string | null;
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

export default function AdminFeedback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Feedback | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      return [r.name, r.organization, r.liked_most, r.suggestions, r.effectiveness]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q));
    });
  }, [rows, filters, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    const sat = rows.filter((r) => r.satisfaction?.includes("satisfied") && !r.satisfaction?.includes("dis")).length;
    const promoters = rows.filter((r) => r.recommendation?.includes("likely") && !r.recommendation?.includes("un")).length;
    return { total, sat, promoters };
  }, [rows]);

  const exportCsv = () => {
    const headers = [
      "created_at", "name", "organization", "satisfaction", "recommendation",
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
    <div className="min-h-screen bg-background">
      <SEOHead title="Feedback Admin" description="View and filter workshop feedback" path="/admin/feedback" />

      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Feedback
              </h1>
              <p className="text-xs text-muted-foreground">{filtered.length} of {rows.length} entries</p>
            </div>
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Satisfied</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.sat}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">Promoters</div>
            <div className="text-2xl font-bold text-primary">{stats.promoters}</div>
          </Card>
        </div>

        <Card className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, organization, comments..."
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
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{r.name || "Anonymous"}</span>
                      {r.organization && <span className="text-xs text-muted-foreground">· {r.organization}</span>}
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

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
              {selected.organization && <Field label="Organization" value={selected.organization} />}
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
