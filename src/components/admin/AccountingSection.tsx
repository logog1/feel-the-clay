import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, RefreshCw, Trash2, Pencil, CheckCircle2, X, Upload } from "lucide-react";
import { format } from "date-fns";

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

const CATEGORIES = ["materials", "utilities", "rent", "salary", "marketing", "equipment", "transport", "food", "workshop-revenue", "store-revenue", "donation", "other"];
const EXPENSE_TYPES = ["fixed", "variable", "one-time"];

export function AccountingSection() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Entry>>({});
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

  const addEntry = async () => {
    if (!newEntry.description || newEntry.amount <= 0) return;
    await supabase.from("accounting_entries").insert({
      date: newEntry.date,
      description: newEntry.description,
      category: newEntry.category,
      type: newEntry.type,
      expense_type: newEntry.type === "expense" ? newEntry.expense_type || null : null,
      amount: newEntry.amount,
    });
    setNewEntry({ date: format(new Date(), "yyyy-MM-dd"), description: "", category: "other", type: "expense", expense_type: "", amount: 0 });
    setShowAdd(false);
    fetchEntries();
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from("accounting_entries").update({
      description: editDraft.description,
      category: editDraft.category,
      type: editDraft.type,
      expense_type: editDraft.type === "expense" ? editDraft.expense_type || null : null,
      amount: editDraft.amount,
      date: editDraft.date,
    }).eq("id", editingId);
    setEditingId(null);
    fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("accounting_entries").delete().eq("id", id);
    fetchEntries();
  };

  const downloadCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Expense Type", "Amount", "Running Balance"];
    let balance = 0;
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const rows = sorted.map((e) => {
      balance += e.type === "income" ? Number(e.amount) : -Number(e.amount);
      return [e.date, e.description, e.category, e.type, e.expense_type || "", e.amount, balance.toFixed(2)];
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

  // Running balance
  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = 0;
  const withBalance = sorted.map((e) => {
    runningBalance += e.type === "income" ? Number(e.amount) : -Number(e.amount);
    return { ...e, balance: runningBalance };
  }).reverse();

  // Summary
  const totalIncome = filtered.filter((e) => e.type === "income").reduce((s, e) => s + Number(e.amount), 0);
  const totalExpenses = filtered.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="flex flex-wrap gap-3">
        <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
          <span className="font-bold text-emerald-800 mr-1">{totalIncome.toLocaleString()} DH</span>
          <span className="text-emerald-600">Income</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-sm">
          <span className="font-bold text-red-800 mr-1">{totalExpenses.toLocaleString()} DH</span>
          <span className="text-red-600">Expenses</span>
        </div>
        <div className="px-4 py-2 rounded-xl bg-card border border-border/40 text-sm">
          <span className={`font-bold mr-1 ${(totalIncome - totalExpenses) >= 0 ? "text-emerald-800" : "text-red-800"}`}>
            {(totalIncome - totalExpenses).toLocaleString()} DH
          </span>
          <span className="text-muted-foreground">Net</span>
        </div>
      </div>

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
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
            <Input type="number" placeholder="Amount" value={newEntry.amount || ""} onChange={(e) => setNewEntry((n) => ({ ...n, amount: Number(e.target.value) }))} className="rounded-xl h-9 text-sm" />
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
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={addEntry}>
              <CheckCircle2 size={14} /> Save
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowAdd(false)}>Cancel</Button>
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Type</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Balance</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withBalance.map((e) => {
                const isEditing = editingId === e.id;
                
                if (isEditing) {
                  return (
                    <tr key={e.id} className="border-b border-border/20 bg-muted/10">
                      <td className="px-4 py-2"><Input type="date" value={editDraft.date || ""} onChange={(ev) => setEditDraft((d) => ({ ...d, date: ev.target.value }))} className="rounded-lg h-8 text-xs" /></td>
                      <td className="px-4 py-2"><Input value={editDraft.description || ""} onChange={(ev) => setEditDraft((d) => ({ ...d, description: ev.target.value }))} className="rounded-lg h-8 text-xs" /></td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        <Select value={editDraft.category || ""} onValueChange={(v) => setEditDraft((d) => ({ ...d, category: v }))}>
                          <SelectTrigger className="rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2 hidden lg:table-cell">
                        <Select value={editDraft.type || ""} onValueChange={(v: "income" | "expense") => setEditDraft((d) => ({ ...d, type: v }))}>
                          <SelectTrigger className="rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2 text-right"><Input type="number" value={editDraft.amount || ""} onChange={(ev) => setEditDraft((d) => ({ ...d, amount: Number(ev.target.value) }))} className="rounded-lg h-8 text-xs text-right w-24 ml-auto" /></td>
                      <td className="px-4 py-2 hidden sm:table-cell" />
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-emerald-600" onClick={saveEdit}><CheckCircle2 size={13} /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setEditingId(null)}><X size={13} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={e.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{e.date}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{e.description}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-muted/50 text-muted-foreground">{e.category}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${e.type === "income" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${e.type === "income" ? "text-emerald-700" : "text-red-600"}`}>
                      {e.type === "income" ? "+" : "-"}{Number(e.amount).toLocaleString()} DH
                    </td>
                    <td className={`px-4 py-3 text-right font-medium hidden sm:table-cell ${e.balance >= 0 ? "text-foreground" : "text-red-600"}`}>
                      {e.balance.toLocaleString()} DH
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => { setEditingId(e.id); setEditDraft({ ...e }); }}>
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
