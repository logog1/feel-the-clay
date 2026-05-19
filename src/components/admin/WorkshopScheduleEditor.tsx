import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Save, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { WorkshopId } from "@/hooks/use-workshop-config";

export interface ScheduleSlot {
  date: string; // YYYY-MM-DD
  time_slots: string[];
}

interface Props {
  workshopId: WorkshopId;
}

export function WorkshopScheduleEditor({ workshopId }: Props) {
  const settingKey = `workshop_schedule_${workshopId}`;
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", settingKey)
        .maybeSingle();
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed)) setSlots(parsed);
        } catch {}
      }
      setLoading(false);
    })();
  }, [settingKey]);

  const sortedSlots = [...slots].sort((a, b) => a.date.localeCompare(b.date));

  const addDate = () => {
    if (!newDate) return;
    const dateStr = format(newDate, "yyyy-MM-dd");
    if (slots.find((s) => s.date === dateStr)) {
      toast.error("Date already added");
      return;
    }
    setSlots([...slots, { date: dateStr, time_slots: [] }]);
    setNewDate(undefined);
  };

  const removeDate = (date: string) => {
    setSlots(slots.filter((s) => s.date !== date));
  };

  const addTimeSlot = (date: string, time: string) => {
    const t = time.trim();
    if (!t) return;
    setSlots(
      slots.map((s) =>
        s.date === date && !s.time_slots.includes(t)
          ? { ...s, time_slots: [...s.time_slots, t].sort() }
          : s
      )
    );
  };

  const removeTimeSlot = (date: string, time: string) => {
    setSlots(
      slots.map((s) =>
        s.date === date ? { ...s, time_slots: s.time_slots.filter((x) => x !== time) } : s
      )
    );
  };

  const save = async () => {
    setSaving(true);
    const clean = slots.filter((s) => s.time_slots.length > 0);
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: settingKey, value: JSON.stringify(clean), updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    if (error) toast.error("Failed to save schedule");
    else {
      toast.success("Schedule saved");
      setSlots(clean);
    }
    setSaving(false);
  };

  if (loading) return <p className="text-xs text-muted-foreground">Loading schedule…</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Add specific dates and time slots when this workshop is offered. The booking form will only
        let guests pick from these dates and times.
      </p>

      {/* Add date */}
      <div className="flex gap-2 items-center p-3 rounded-xl bg-muted/20 border border-border/40">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("rounded-xl gap-2 flex-1 justify-start", !newDate && "text-muted-foreground")}
            >
              <CalendarIcon size={14} />
              {newDate ? format(newDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={newDate}
              onSelect={setNewDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <Button size="sm" onClick={addDate} disabled={!newDate} className="rounded-xl gap-1">
          <Plus size={14} /> Add
        </Button>
      </div>

      {/* Slot list */}
      {sortedSlots.length === 0 ? (
        <p className="text-xs text-muted-foreground italic text-center py-4">No dates yet.</p>
      ) : (
        <div className="space-y-3">
          {sortedSlots.map((slot) => (
            <DateRow
              key={slot.date}
              slot={slot}
              onRemove={() => removeDate(slot.date)}
              onAddTime={(t) => addTimeSlot(slot.date, t)}
              onRemoveTime={(t) => removeTimeSlot(slot.date, t)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-border/30">
        <Button
          onClick={save}
          disabled={saving}
          className="rounded-xl gap-2 bg-cta hover:bg-cta/90 text-primary-foreground"
        >
          <Save size={14} /> {saving ? "Saving…" : "Save Schedule"}
        </Button>
      </div>
    </div>
  );
}

function DateRow({
  slot,
  onRemove,
  onAddTime,
  onRemoveTime,
}: {
  slot: ScheduleSlot;
  onRemove: () => void;
  onAddTime: (t: string) => void;
  onRemoveTime: (t: string) => void;
}) {
  const [time, setTime] = useState("");

  const submit = () => {
    if (!time) return;
    onAddTime(time);
    setTime("");
  };

  return (
    <div className="p-3 rounded-xl bg-card border-2 border-border/40 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CalendarIcon size={14} className="text-cta" />
          {format(new Date(slot.date + "T00:00:00"), "EEE, MMM d, yyyy")}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
          title="Remove date"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {slot.time_slots.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-cta/10 border border-cta/30 text-foreground"
          >
            <Clock size={11} />
            {t}
            <button
              type="button"
              onClick={() => onRemoveTime(t)}
              className="text-muted-foreground hover:text-destructive ml-1"
            >
              <Trash2 size={11} />
            </button>
          </span>
        ))}
        {slot.time_slots.length === 0 && (
          <span className="text-xs italic text-muted-foreground">No times yet</span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
          className="rounded-xl text-sm h-9 flex-1"
        />
        <Button size="sm" onClick={submit} className="rounded-xl gap-1" disabled={!time}>
          <Plus size={14} /> Time
        </Button>
      </div>
    </div>
  );
}
