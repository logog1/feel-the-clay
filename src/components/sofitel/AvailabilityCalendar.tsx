import { useEffect, useMemo, useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isBefore, startOfDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, X, Check, Users, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

type DayStatus = {
  day: string;
  status: "open" | "limited" | "full" | "blocked";
  bookings_count: number;
  sofitel_sessions: number;
  is_blocked: boolean;
};

const STATUS_COLOR: Record<DayStatus["status"], { bg: string; fg: string; dot: string; label: string }> = {
  open: { bg: "#E8F4EA", fg: "#1F6F3A", dot: "#1F6F3A", label: "Open" },
  limited: { bg: "#F1E2BE", fg: "#7A5A12", dot: "#C99B2A", label: "Limited" },
  full: { bg: "#FCE6E6", fg: "#9B2222", dot: "#9B2222", label: "Full" },
  blocked: { bg: "#E8E2D2", fg: "#555", dot: "#888", label: "Closed" },
};

interface Props {
  /** "concierge" shows public-friendly labels + request CTA. "admin" shows full counts + manage requests link. */
  variant?: "concierge" | "admin";
  /** Pre-fill contact when invoked from the staff console */
  defaultContactName?: string;
  /** Compact mode (single month, no padding) for embedding */
  compact?: boolean;
}

export function AvailabilityCalendar({ variant = "concierge", defaultContactName, compact }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [data, setData] = useState<Record<string, DayStatus>>({});
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<DayStatus | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase.rpc("get_terraria_availability", { _days: 90 });
    if (error) toast.error(error.message);
    const map: Record<string, DayStatus> = {};
    (rows || []).forEach((r: any) => {
      map[r.day] = r;
    });
    setData(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const today = startOfDay(new Date());

  return (
    <div className={compact ? "" : "rounded-2xl bg-white p-5 sm:p-6"} style={compact ? {} : { border: "1px solid #E8E2D2" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#2E5168" }}>
            {variant === "admin" ? "Terraria availability" : "Terraria · Group availability"}
          </p>
          <h3 className="mt-1 text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {format(cursor, "MMMM yyyy")}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(addMonths(cursor, -1))} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center" aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCursor(startOfMonth(new Date()))} className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-black/5">
            Today
          </button>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center" aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-[10px] uppercase tracking-[0.18em] opacity-60">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const ds = data[key];
            const past = isBefore(d, today);
            const inMonth = isSameMonth(d, cursor);
            const status = ds?.status || "open";
            const c = STATUS_COLOR[status];
            const disabled = past || ds?.status === "blocked" || ds?.status === "full";

            return (
              <button
                key={key}
                disabled={past || !ds}
                onClick={() => ds && setPicked(ds)}
                className="aspect-square rounded-xl p-1.5 text-left flex flex-col justify-between transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: !inMonth ? "transparent" : ds ? c.bg : "#FAFAF7",
                  border: `1px solid ${!inMonth ? "transparent" : "#0E141810"}`,
                  color: ds ? c.fg : "#999",
                  opacity: !inMonth ? 0.35 : 1,
                }}
              >
                <span className="text-sm font-medium">{format(d, "d")}</span>
                {ds && inMonth && (
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider">
                    <span className="truncate">{c.label}</span>
                    {variant === "admin" && (ds.bookings_count + ds.sofitel_sessions) > 0 && (
                      <span className="opacity-70">{ds.bookings_count + ds.sofitel_sessions}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em]">
        {(["open","limited","full","blocked"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[s].dot }} />
            {STATUS_COLOR[s].label}
          </span>
        ))}
      </div>

      {picked && (
        <DayDetailSheet
          dayStatus={picked}
          variant={variant}
          defaultContactName={defaultContactName}
          onClose={() => setPicked(null)}
          onSubmitted={() => { setPicked(null); load(); }}
        />
      )}
    </div>
  );
}

function DayDetailSheet({
  dayStatus, variant, defaultContactName, onClose, onSubmitted,
}: {
  dayStatus: DayStatus;
  variant: "concierge" | "admin";
  defaultContactName?: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [name, setName] = useState(defaultContactName || "");
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState(4);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const c = STATUS_COLOR[dayStatus.status];
  const blocked = dayStatus.status === "blocked" || dayStatus.status === "full";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Contact name required"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("sofitel_group_requests").insert({
      preferred_date: dayStatus.day,
      preferred_time: time || null,
      group_size: size,
      contact_name: name.trim(),
      contact_phone: phone || null,
      room_number: room || null,
      notes: notes || null,
      status: "new",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Group request sent to Terraria team");
    onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5" style={{ background: "#0E1418CC" }}>
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-7 relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#E8E2D2" }}>
          <X size={16} />
        </button>
        <span className="text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.fg }}>
          {c.label}
        </span>
        <h2 className="mt-3 text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {format(parseISO(dayStatus.day), "EEEE d MMMM yyyy")}
        </h2>
        <p className="mt-1 text-xs opacity-70">
          {dayStatus.bookings_count + dayStatus.sofitel_sessions} session(s) booked across all programs
        </p>

        {blocked ? (
          <div className="mt-6 rounded-2xl p-5 text-sm" style={{ background: "#FAF7F0" }}>
            {dayStatus.status === "blocked"
              ? "Terraria is closed this day. Pick another date for the group."
              : "This day is fully booked. Please suggest the guest an alternative date."}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <p className="text-xs opacity-70">
              {variant === "concierge"
                ? "Send a custom group enquiry to the Terraria team. They will confirm by phone within a few hours."
                : "Log a group enquiry from this day."}
            </p>
            <Field label="Guest / contact name" value={name} onChange={setName} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Room number" value={room} onChange={setRoom} optional />
              <Field label="Phone" value={phone} onChange={setPhone} optional />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] opacity-60">Group size</label>
                <input type="number" min={1} max={50} value={size}
                  onChange={(e) => setSize(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full bg-transparent border-b py-2 outline-none" style={{ borderColor: "#E8E2D2" }} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] opacity-60">Preferred time</label>
                <input type="text" placeholder="e.g. 16:00" value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 w-full bg-transparent border-b py-2 outline-none" style={{ borderColor: "#E8E2D2" }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] opacity-60">Notes / experience type</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3} placeholder="e.g. private pottery for a family of 6, anniversary dinner add-on…"
                className="mt-1 w-full bg-transparent border-b py-2 outline-none resize-none" style={{ borderColor: "#E8E2D2" }} />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-full text-xs font-medium uppercase tracking-[0.2em] disabled:opacity-50 inline-flex items-center justify-center gap-2"
              style={{ background: "#0E1418", color: "#FBFAF6" }}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Send group request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, optional }: { label: string; value: string; onChange: (v: string) => void; optional?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] opacity-60">
        {label}{optional && <span className="ml-1 opacity-50 normal-case tracking-normal">(optional)</span>}
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border-b py-2 outline-none" style={{ borderColor: "#E8E2D2" }} />
    </label>
  );
}

/* ==================== Group requests list (admin) ==================== */

export function GroupRequestsList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("sofitel_group_requests").select("*").order("created_at", { ascending: false }).limit(50);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("sofitel_group_requests").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    load();
  };

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

  if (items.length === 0) return (
    <div className="py-16 text-center opacity-60 text-sm rounded-2xl" style={{ background: "#FAF7F0" }}>
      No group requests yet.
    </div>
  );

  return (
    <div className="space-y-2">
      {items.map((r) => (
        <div key={r.id} className="rounded-2xl bg-white p-4 flex items-center gap-3 flex-wrap" style={{ border: "1px solid #E8E2D2" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{r.contact_name}</span>
              {r.room_number && <span className="text-xs opacity-60">Room {r.room_number}</span>}
              <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
                style={{ background: r.status === "confirmed" ? "#E8F4EA" : r.status === "declined" ? "#FCE6E6" : "#F1E2BE",
                         color: r.status === "confirmed" ? "#1F6F3A" : r.status === "declined" ? "#9B2222" : "#7A5A12" }}>
                {r.status}
              </span>
            </div>
            <div className="mt-1 text-xs opacity-70 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1"><CalendarIcon size={11} /> {format(parseISO(r.preferred_date), "EEE d MMM")} {r.preferred_time && `· ${r.preferred_time}`}</span>
              <span className="inline-flex items-center gap-1"><Users size={11} /> {r.group_size} guests</span>
              {r.contact_phone && <span>{r.contact_phone}</span>}
            </div>
            {r.notes && <p className="mt-2 text-xs opacity-80">{r.notes}</p>}
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setStatus(r.id, "confirmed")} className="text-xs px-3 py-1.5 rounded-full" style={{ background: "#0E1418", color: "#FBFAF6" }}>Confirm</button>
            <button onClick={() => setStatus(r.id, "declined")} className="text-xs px-3 py-1.5 rounded-full" style={{ background: "#E8E2D2" }}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
}
