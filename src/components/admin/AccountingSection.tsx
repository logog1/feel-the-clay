import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, RefreshCw, Trash2, Pencil, CheckCircle2, X, Paperclip, FileText, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Entry {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  expense_type: string | null;
  amount: number;
  attachment_url: string | null;
  created_at: string;
}

const CATEGORIES = [
  "workshop", "materials", "rent", "clay", "cleaning", "paints",
  "marketing", "prints", "transportation", "other",
];

// Color-coded category pills matching the reference spreadsheet
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  materials:      { bg: "bg-emerald-700",  text: "text-white",       border: "border-emerald-800" },
  rent:           { bg: "bg-yellow-400",   text: "text-yellow-900",  border: "border-yellow-500" },
  clay:           { bg: "bg-red-600",      text: "text-white",       border: "border-red-700" },
  cleaning:       { bg: "bg-blue-200",     text: "text-blue-900",    border: "border-blue-300" },
  paints:         { bg: "bg-purple-700",   text: "text-white",       border: "border-purple-800" },
  marketing:      { bg: "bg-gray-700",     text: "text-white",       border: "border-gray-800" },
  prints:         { bg: "bg-gray-500",     text: "text-white",       border: "border-gray-600" },
  other:          { bg: "bg-orange-200",   text: "text-orange-900",  border: "border-orange-300" },
  workshop:       { bg: "bg-orange-400",   text: "text-white",       border: "border-orange-500" },
  transportation: { bg: "bg-amber-100",    text: "text-amber-900",   border: "border-amber-200" },
};

const EXPENSE_TYPES = ["fixed", "variable", "one-time"];
const ACCEPTED_FILE_TYPES = "image/*,.pdf,.doc,.docx,.xls,.xlsx";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function AccountingSection() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Entry>>({});
  const [uploading, setUploading] = useState(false);
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
  const [editAttachmentFile, setEditAttachmentFile] = useState<File | null>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [newEntry, setNewEntry] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    category: "other",
    type: "expense" as "income" | "expense",
    expense_type: "",
    amount: 0,
  });
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase.from("accounting_entries").select("*").order("date", { ascending: false });
    setEntries((data as Entry[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10MB.");
      return null;
    }
    const ext = file.name.split(".").pop();
    const path = `receipts/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from("accounting-receipts").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      return null;
    }
    const { data: urlData } = supabase.storage.from("accounting-receipts").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const deleteAttachment = async (url: string) => {
    try {
      const path = url.split("/accounting-receipts/")[1];
      if (path) await supabase.storage.from("accounting-receipts").remove([path]);
    } catch {
      // non-critical
    }
  };

  const addEntry = async () => {
    if (!newEntry.description || newEntry.amount <= 0) return;
    setUploading(true);
    let attachmentUrl: string | null = null;
    if (newAttachmentFile) {
      attachmentUrl = await uploadFile(newAttachmentFile);
    }
    await supabase.from("accounting_entries").insert({
      date: newEntry.date,
      description: newEntry.description,
      category: newEntry.category,
      type: newEntry.type,
      expense_type: newEntry.type === "expense" ? newEntry.expense_type || null : null,
      amount: newEntry.amount,
      attachment_url: attachmentUrl,
    });
    setNewEntry({ date: format(new Date(), "yyyy-MM-dd"), description: "", category: "other", type: "expense", expense_type: "", amount: 0 });
    setNewAttachmentFile(null);
    setShowAdd(false);
    setUploading(false);
    toast.success("Entry added");
    fetchEntries();
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setUploading(true);
    let attachmentUrl = editDraft.attachment_url || null;

    if (editAttachmentFile) {
      // Delete old attachment if replacing
      if (attachmentUrl) await deleteAttachment(attachmentUrl);
      attachmentUrl = await uploadFile(editAttachmentFile);
    }

    await supabase.from("accounting_entries").update({
      description: editDraft.description,
      category: editDraft.category,
      type: editDraft.type,
      expense_type: editDraft.type === "expense" ? editDraft.expense_type || null : null,
      amount: editDraft.amount,
      date: editDraft.date,
      attachment_url: attachmentUrl,
    }).eq("id", editingId);
    setEditingId(null);
    setEditAttachmentFile(null);
    setUploading(false);
    toast.success("Entry updated");
    fetchEntries();
  };

  const removeAttachment = async (entry: Entry) => {
    if (!entry.attachment_url) return;
    await deleteAttachment(entry.attachment_url);
    await supabase.from("accounting_entries").update({ attachment_url: null }).eq("id", entry.id);
    toast.success("Attachment removed");
    fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry?.attachment_url) await deleteAttachment(entry.attachment_url);
    await supabase.from("accounting_entries").delete().eq("id", id);
    fetchEntries();
  };

  const downloadCSV = () => {
    const headers = ["Date", "Category", "Description", "Income (DH)", "Expenses (DH)", "Balance (DH)"];
    let balance = 0;
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const rows = sorted.map((e) => {
      const inc = e.type === "income" ? Number(e.amount) : 0;
      const exp = e.type === "expense" ? Number(e.amount) : 0;
      balance += inc - exp;
      return [e.date, e.category, `"${e.description}"`, inc || "", exp || "", balance.toFixed(2)];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `accounting-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `accounting-${format(new Date(), "yyyy-MM-dd")}.json`; a.click();
  };

  // Filtering
  const filtered = entries.filter((e) => {
    if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
    if (dateFilter && !e.date.startsWith(dateFilter)) return false;
    return true;
  });

  // Running balance (chronological)
  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = 0;
  const withBalance = sorted.map((e) => {
    runningBalance += e.type === "income" ? Number(e.amount) : -Number(e.amount);
    return { ...e, balance: runningBalance };
  }).reverse();

  // Summary
  const totalIncome = filtered.filter((e) => e.type === "income").reduce((s, e) => s + Number(e.amount), 0);
  const totalExpenses = filtered.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
  const net = totalIncome - totalExpenses;

  // Category breakdown for expenses
  const expenseByCategory = Object.entries(
    filtered.filter((e) => e.type === "expense").reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const CategoryPill = ({ category }: { category: string }) => {
    const colors = CATEGORY_COLORS[category] || { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
        {category}
      </span>
    );
  };

  const AttachmentBadge = ({ url, onRemove }: { url: string; onRemove?: () => void }) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 border border-border/40 text-xs text-muted-foreground">
      <FileText size={12} className="text-primary" />
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-0.5">
        Receipt <ExternalLink size={10} />
      </a>
      {onRemove && (
        <button onClick={onRemove} className="ml-1 hover:text-destructive transition-colors" title="Remove attachment">
          <X size={11} />
        </button>
      )}
    </span>
  );

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-600 font-medium">Total Income</p>
          <p className="text-xl font-bold text-emerald-800">{totalIncome.toLocaleString()} DH</p>
        </div>
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium">Total Expenses</p>
          <p className="text-xl font-bold text-red-800">{totalExpenses.toLocaleString()} DH</p>
        </div>
        <div className={`p-4 rounded-2xl border ${net >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <p className="text-xs text-muted-foreground font-medium">Remaining Balance</p>
          <p className={`text-xl font-bold ${net >= 0 ? "text-emerald-800" : "text-red-800"}`}>{net.toLocaleString()} DH</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/40">
          <p className="text-xs text-muted-foreground font-medium">Entries</p>
          <p className="text-xl font-bold text-foreground">{filtered.length}</p>
        </div>
      </div>

      {/* Category breakdown chips */}
      {expenseByCategory.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {expenseByCategory.map(([cat, amount]) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-sm ${
                categoryFilter === cat ? "ring-2 ring-primary ring-offset-1" : ""
              }`}
            >
              <CategoryPill category={cat} />
              <span className="font-semibold text-foreground">{amount.toLocaleString()} DH</span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <Input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-xl h-9 text-sm w-[160px]"
          placeholder="Filter by month"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="rounded-xl h-9 text-sm w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                <span className="flex items-center gap-2">
                  <CategoryPill category={c} />
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={fetchEntries}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={downloadCSV}>
            <Download size={14} /> CSV
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={downloadJSON}>
            <Download size={14} /> JSON
          </Button>
          <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={14} /> Add Entry
          </Button>
        </div>
      </div>

      {/* Add Entry Form */}
      {showAdd && (
        <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input type="date" value={newEntry.date} onChange={(e) => setNewEntry((n) => ({ ...n, date: e.target.value }))} className="rounded-xl h-9 text-sm" />
            <Input placeholder="Description" value={newEntry.description} onChange={(e) => setNewEntry((n) => ({ ...n, description: e.target.value }))} className="rounded-xl h-9 text-sm col-span-2 md:col-span-1" />
            <Input type="number" placeholder="Amount (DH)" value={newEntry.amount || ""} onChange={(e) => setNewEntry((n) => ({ ...n, amount: Number(e.target.value) }))} className="rounded-xl h-9 text-sm" />
            <Select value={newEntry.type} onValueChange={(v: "income" | "expense") => setNewEntry((n) => ({ ...n, type: v }))}>
              <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newEntry.category} onValueChange={(v) => setNewEntry((n) => ({ ...n, category: v }))}>
              <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2"><CategoryPill category={c} /></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newEntry.type === "expense" && (
              <Select value={newEntry.expense_type} onValueChange={(v) => setNewEntry((n) => ({ ...n, expense_type: v }))}>
                <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue placeholder="Expense type" /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          {/* Attachment upload */}
          <div className="flex items-center gap-3">
            <input
              ref={addFileRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              className="hidden"
              onChange={(e) => setNewAttachmentFile(e.target.files?.[0] || null)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={() => addFileRef.current?.click()}
            >
              <Paperclip size={14} /> {newAttachmentFile ? "Change file" : "Attach receipt"}
            </Button>
            {newAttachmentFile && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileText size={12} className="text-primary" />
                {newAttachmentFile.name}
                <button onClick={() => setNewAttachmentFile(null)} className="hover:text-destructive"><X size={12} /></button>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={addEntry} disabled={uploading}>
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setShowAdd(false); setNewAttachmentFile(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="rounded-2xl border border-border/40 overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-right px-4 py-3 font-medium text-emerald-600">Income</th>
                <th className="text-right px-4 py-3 font-medium text-red-500">Expenses</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Balance</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withBalance.map((e) => {
                const isEditing = editingId === e.id;
                
                if (isEditing) {
                  return (
                    <tr key={e.id} className="border-b border-border/20 bg-muted/10">
                      <td className="px-4 py-2"><Input type="date" value={editDraft.date || ""} onChange={(ev) => setEditDraft((d) => ({ ...d, date: ev.target.value }))} className="rounded-lg h-8 text-xs" /></td>
                      <td className="px-4 py-2">
                        <Select value={editDraft.category || ""} onValueChange={(v) => setEditDraft((d) => ({ ...d, category: v }))}>
                          <SelectTrigger className="rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}><CategoryPill category={c} /></SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2">
                        <Input value={editDraft.description || ""} onChange={(ev) => setEditDraft((d) => ({ ...d, description: ev.target.value }))} className="rounded-lg h-8 text-xs" />
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            ref={editFileRef}
                            type="file"
                            accept={ACCEPTED_FILE_TYPES}
                            className="hidden"
                            onChange={(ev) => setEditAttachmentFile(ev.target.files?.[0] || null)}
                          />
                          <button
                            type="button"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                            onClick={() => editFileRef.current?.click()}
                          >
                            <Paperclip size={11} /> {editAttachmentFile ? editAttachmentFile.name : editDraft.attachment_url ? "Replace receipt" : "Attach receipt"}
                          </button>
                          {editDraft.attachment_url && !editAttachmentFile && (
                            <button
                              className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-0.5"
                              onClick={() => setEditDraft(d => ({ ...d, attachment_url: null }))}
                            >
                              <X size={10} /> Remove
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <Select value={editDraft.type || ""} onValueChange={(v: "income" | "expense") => setEditDraft((d) => ({ ...d, type: v }))}>
                            <SelectTrigger className="rounded-lg h-8 text-xs w-24"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
                          </Select>
                          <Input type="number" value={editDraft.amount || ""} onChange={(ev) => setEditDraft((d) => ({ ...d, amount: Number(ev.target.value) }))} className="rounded-lg h-8 text-xs text-right w-24" />
                        </div>
                      </td>
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-emerald-600" onClick={saveEdit} disabled={uploading}>
                            {uploading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => { setEditingId(null); setEditAttachmentFile(null); }}><X size={13} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={e.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{e.date}</td>
                    <td className="px-4 py-3"><CategoryPill category={e.category} /></td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{e.description}</span>
                      {e.attachment_url && (
                        <span className="ml-2">
                          <AttachmentBadge url={e.attachment_url} onRemove={() => removeAttachment(e)} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-700">
                      {e.type === "income" ? `${Number(e.amount).toLocaleString()} DH` : ""}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">
                      {e.type === "expense" ? `${Number(e.amount).toLocaleString()} DH` : ""}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${e.balance >= 0 ? "text-foreground" : "text-red-600"}`}>
                      {e.balance.toLocaleString()} DH
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => { setEditingId(e.id); setEditDraft({ ...e }); setEditAttachmentFile(null); }}>
                          <Pencil size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteEntry(e.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {withBalance.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No entries yet. Click "Add Entry" to start.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
