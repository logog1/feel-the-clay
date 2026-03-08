import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CheckCircle2, ExternalLink, BookOpen, Briefcase, Megaphone, Package, Users, Wrench, ChevronDown, ChevronRight, GripVertical, Link2, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface WorkflowLink {
  label: string;
  url: string;
  type: "doc" | "tool" | "link";
}

interface WorkflowStep {
  title: string;
  description: string;
  links: WorkflowLink[];
}

interface WorkflowGuide {
  id: string;
  sector: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
  created_at: string;
}

const SECTORS = [
  { id: "operations", label: "Operations", icon: Wrench },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "sales", label: "Sales", icon: Package },
  { id: "management", label: "Management", icon: Briefcase },
  { id: "hr", label: "HR / People", icon: Users },
  { id: "general", label: "General", icon: BookOpen },
];

const SECTOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  operations:  { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-200" },
  marketing:   { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  sales:       { bg: "bg-emerald-100",text: "text-emerald-800",border: "border-emerald-200" },
  management:  { bg: "bg-amber-100",  text: "text-amber-800",  border: "border-amber-200" },
  hr:          { bg: "bg-pink-100",   text: "text-pink-800",   border: "border-pink-200" },
  general:     { bg: "bg-gray-100",   text: "text-gray-800",   border: "border-gray-200" },
};

const LINK_TYPE_ICONS: Record<string, typeof FileText> = {
  doc: FileText,
  tool: Wrench,
  link: Link2,
};

export function WorkflowSection() {
  const [guides, setGuides] = useState<WorkflowGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [sectorFilter, setSectorFilter] = useState("all");
  const [expandedGuides, setExpandedGuides] = useState<Set<string>>(new Set());

  // Draft state for new guide
  const [draft, setDraft] = useState({
    title: "", sector: "general", description: "",
  });
  const [draftSteps, setDraftSteps] = useState<WorkflowStep[]>([
    { title: "", description: "", links: [] },
  ]);

  const fetchGuides = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("key", "workflow_guides").maybeSingle();
    if (data?.value) {
      try { setGuides(JSON.parse(data.value)); } catch { setGuides([]); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchGuides(); }, [fetchGuides]);

  const saveGuides = async (updated: WorkflowGuide[]) => {
    setGuides(updated);
    await supabase.from("site_settings").upsert({
      key: "workflow_guides", value: JSON.stringify(updated), updated_at: new Date().toISOString(),
    });
  };

  const addGuide = () => {
    if (!draft.title) return;
    const steps = draftSteps.filter((s) => s.title.trim());
    const newGuide: WorkflowGuide = {
      id: crypto.randomUUID(),
      sector: draft.sector,
      title: draft.title,
      description: draft.description,
      steps,
      created_at: new Date().toISOString(),
    };
    saveGuides([newGuide, ...guides]);
    setDraft({ title: "", sector: "general", description: "" });
    setDraftSteps([{ title: "", description: "", links: [] }]);
    setShowAdd(false);
    toast.success("Workflow guide created");
  };

  const deleteGuide = (id: string) => {
    saveGuides(guides.filter((g) => g.id !== id));
    toast.success("Guide deleted");
  };

  const toggleExpand = (id: string) => {
    setExpandedGuides((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addStepLink = (stepIdx: number) => {
    const updated = [...draftSteps];
    updated[stepIdx].links.push({ label: "", url: "", type: "link" });
    setDraftSteps(updated);
  };

  const updateStepLink = (stepIdx: number, linkIdx: number, field: keyof WorkflowLink, value: string) => {
    const updated = [...draftSteps];
    (updated[stepIdx].links[linkIdx] as any)[field] = value;
    setDraftSteps(updated);
  };

  const removeStepLink = (stepIdx: number, linkIdx: number) => {
    const updated = [...draftSteps];
    updated[stepIdx].links.splice(linkIdx, 1);
    setDraftSteps(updated);
  };

  const filtered = sectorFilter === "all" ? guides : guides.filter((g) => g.sector === sectorFilter);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Sector filter + add button */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSectorFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
              sectorFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {SECTORS.map((s) => {
            const colors = SECTOR_COLORS[s.id];
            const active = sectorFilter === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSectorFilter(active ? "all" : s.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border flex items-center gap-1.5 ${
                  active ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-primary/30` : "bg-card border-border/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <s.icon size={13} />
                {s.label}
              </button>
            );
          })}
        </div>
        <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground ml-auto" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> New Guide
        </Button>
      </div>

      {/* Guide cards */}
      {filtered.map((guide) => {
        const sector = SECTORS.find((s) => s.id === guide.sector);
        const colors = SECTOR_COLORS[guide.sector] || SECTOR_COLORS.general;
        const SectorIcon = sector?.icon || BookOpen;
        const isExpanded = expandedGuides.has(guide.id);

        return (
          <div key={guide.id} className="rounded-2xl bg-card border border-border/40 overflow-hidden">
            {/* Guide header */}
            <button
              onClick={() => toggleExpand(guide.id)}
              className="w-full flex items-center gap-3 p-5 text-left hover:bg-muted/20 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.border} border`}>
                <SectorIcon size={18} className={colors.text} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground truncate">{guide.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                    {sector?.label || guide.sector}
                  </span>
                </div>
                {guide.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{guide.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{guide.steps.length} step{guide.steps.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-destructive"
                  onClick={(ev) => { ev.stopPropagation(); deleteGuide(guide.id); }}
                >
                  <Trash2 size={13} />
                </Button>
                {isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
              </div>
            </button>

            {/* Expanded steps */}
            {isExpanded && (
              <div className="border-t border-border/40 px-5 pb-5">
                {guide.steps.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No steps defined yet.</p>
                ) : (
                  <div className="relative mt-4">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border/60" />
                    <div className="space-y-4">
                      {guide.steps.map((step, i) => (
                        <div key={i} className="relative flex gap-4 pl-1">
                          {/* Step number */}
                          <div className="w-[30px] h-[30px] rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0 z-10">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h5 className="font-semibold text-foreground text-sm">{step.title}</h5>
                            {step.description && (
                              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                            )}
                            {step.links.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {step.links.map((link, li) => {
                                  const LinkIcon = LINK_TYPE_ICONS[link.type] || Link2;
                                  return (
                                    <a
                                      key={li}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/40 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                                    >
                                      <LinkIcon size={11} />
                                      {link.label || link.url}
                                      <ExternalLink size={9} />
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No workflow guides yet. Create one to organize processes by role.</p>
        </div>
      )}

      {/* Add Guide Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Workflow Guide</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="e.g. Workshop Instructor Onboarding" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Sector</Label>
                <Select value={draft.sector} onValueChange={(v) => setDraft((d) => ({ ...d, sector: v }))}>
                  <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2"><s.icon size={13} /> {s.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="Brief overview" />
              </div>
            </div>

            {/* Steps */}
            <div>
              <Label className="text-xs mb-2 block">Steps</Label>
              <div className="space-y-3">
                {draftSteps.map((step, si) => (
                  <div key={si} className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary w-5">{si + 1}.</span>
                      <Input
                        value={step.title}
                        onChange={(e) => {
                          const u = [...draftSteps]; u[si].title = e.target.value; setDraftSteps(u);
                        }}
                        className="rounded-lg h-8 text-xs flex-1"
                        placeholder="Step title"
                      />
                      {draftSteps.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive shrink-0" onClick={() => setDraftSteps(draftSteps.filter((_, i) => i !== si))}>
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={step.description}
                      onChange={(e) => {
                        const u = [...draftSteps]; u[si].description = e.target.value; setDraftSteps(u);
                      }}
                      className="rounded-lg text-xs min-h-[50px]"
                      placeholder="Instructions or details..."
                    />
                    {/* Links for this step */}
                    {step.links.map((link, li) => (
                      <div key={li} className="flex gap-2 items-center">
                        <Select value={link.type} onValueChange={(v) => updateStepLink(si, li, "type", v)}>
                          <SelectTrigger className="rounded-lg h-7 text-xs w-[80px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="doc">Doc</SelectItem>
                            <SelectItem value="tool">Tool</SelectItem>
                            <SelectItem value="link">Link</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input value={link.label} onChange={(e) => updateStepLink(si, li, "label", e.target.value)} className="rounded-lg h-7 text-xs" placeholder="Label" />
                        <Input value={link.url} onChange={(e) => updateStepLink(si, li, "url", e.target.value)} className="rounded-lg h-7 text-xs" placeholder="URL" />
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-destructive shrink-0" onClick={() => removeStepLink(si, li)}>
                          <Trash2 size={10} />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg gap-1 text-muted-foreground" onClick={() => addStepLink(si)}>
                      <Link2 size={10} /> Add link
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 mt-2 w-full" onClick={() => setDraftSteps([...draftSteps, { title: "", description: "", links: [] }])}>
                <Plus size={14} /> Add Step
              </Button>
            </div>

            <Button onClick={addGuide} className="w-full rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <CheckCircle2 size={14} /> Create Guide
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
