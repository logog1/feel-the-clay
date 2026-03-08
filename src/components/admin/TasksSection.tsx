import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2, Trash2, Circle, CheckCircle, ListTodo } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task { id: string; text: string; done: boolean; priority: string; created_at: string; }

export function TasksSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [filter, setFilter] = useState("all");

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("key", "admin_tasks").maybeSingle();
    if (data?.value) {
      try { setTasks(JSON.parse(data.value)); } catch { setTasks([]); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const saveTasks = async (updated: Task[]) => {
    setTasks(updated);
    await supabase.from("site_settings").upsert({
      key: "admin_tasks", value: JSON.stringify(updated), updated_at: new Date().toISOString(),
    });
  };

  const addTask = () => {
    if (!newText.trim()) return;
    const task: Task = { id: crypto.randomUUID(), text: newText.trim(), done: false, priority: newPriority, created_at: new Date().toISOString() };
    saveTasks([task, ...tasks]);
    setNewText("");
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  const filtered = filter === "all" ? tasks : filter === "done" ? tasks.filter((t) => t.done) : tasks.filter((t) => !t.done);

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Add task */}
      <div className="flex gap-2">
        <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Add a task..." className="rounded-xl h-10 text-sm flex-1"
          onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
        />
        <Select value={newPriority} onValueChange={setNewPriority}>
          <SelectTrigger className="rounded-xl h-10 text-sm w-[110px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="high">🔴 High</SelectItem>
            <SelectItem value="medium">🟡 Medium</SelectItem>
            <SelectItem value="low">🟢 Low</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="rounded-xl h-10 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={addTask}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "pending", "done"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all capitalize ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-muted-foreground hover:bg-muted/50"}`}>
            {f} ({f === "all" ? tasks.length : f === "done" ? tasks.filter((t) => t.done).length : tasks.filter((t) => !t.done).length})
          </button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${task.done ? "bg-muted/30 border-border/20" : "bg-card border-border/40"}`}>
            <Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} />
            <span className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.text}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
              {task.priority}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => deleteTask(task.id)}>
              <Trash2 size={13} />
            </Button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No tasks</p>}
      </div>
    </div>
  );
}
