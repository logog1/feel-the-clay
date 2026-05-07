import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin, Plus, Trash2, Save, CheckCircle2, Clock, DollarSign,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Calendar, Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WorkshopCity {
  id: string;
  city_name: string;
  workshop: string;
  is_active: boolean;
  schedule: DaySchedule[];
  created_at: string;
}

interface DaySchedule {
  day: string;
  time_slots: string[];
}

interface CityPricing {
  id: string;
  city_id: string;
  session_type: string;
  price: number;
  currency: string;
}

const WORKSHOPS = [
  { value: "all", label: "All Workshops" },
  { value: "pottery", label: "Pottery Experience" },
  { value: "handbuilding", label: "Handbuilding" },
  { value: "embroidery", label: "Embroidery" },
  { value: "zellij", label: "Zellij" },
  { value: "carpets", label: "Carpets" },
  { value: "gardening", label: "Gardening" },
];

const SESSION_TYPES = [
  { value: "open", label: "Open Session" },
  { value: "private", label: "Private Session" },
  { value: "group_small", label: "Small Group (1-3)" },
  { value: "group_large", label: "Large Group (4+)" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_TIME_SLOTS = ["10:00", "14:00", "16:00"];

export function CitiesPricingSection() {
  const [cities, setCities] = useState<WorkshopCity[]>([]);
  const [pricing, setPricing] = useState<CityPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // New city form
  const [newCityName, setNewCityName] = useState("");
  const [newCityWorkshops, setNewCityWorkshops] = useState<string[]>(["all"]);

  const fetchData = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      supabase.from("workshop_cities").select("*").order("created_at"),
      supabase.from("workshop_city_pricing").select("*"),
    ]);
    setCities(
      (c.data || []).map((city: any) => ({
        ...city,
        schedule: Array.isArray(city.schedule) ? city.schedule : JSON.parse(city.schedule || "[]"),
      }))
    );
    setPricing((p.data as CityPricing[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addCity = async () => {
    if (!newCityName.trim() || newCityWorkshops.length === 0) return;
    setSaving(true);
    const defaultSchedule: DaySchedule[] = DAYS.filter(d => d === "Saturday" || d === "Sunday").map(d => ({
      day: d,
      time_slots: [...DEFAULT_TIME_SLOTS],
    }));

    let lastId: string | null = null;
    for (const workshop of newCityWorkshops) {
      const { data, error } = await supabase.from("workshop_cities").insert({
        city_name: newCityName.trim(),
        workshop,
        schedule: defaultSchedule as any,
      }).select().single();

      if (error) { toast.error(`Failed to add ${workshop}`); continue; }
      lastId = data.id;

      const pricingInserts = SESSION_TYPES.map(st => ({
        city_id: data.id,
        session_type: st.value,
        price: st.value === "open" ? 200 : st.value === "private" ? 350 : st.value === "group_small" ? 250 : 200,
        currency: "MAD",
      }));
      await supabase.from("workshop_city_pricing").insert(pricingInserts);
    }

    setNewCityName("");
    setNewCityWorkshops(["all"]);
    toast.success(`${newCityName} added!`);
    await fetchData();
    setSaving(false);
    if (lastId) setExpandedCity(lastId);
  };

  const toggleActive = async (city: WorkshopCity) => {
    await supabase.from("workshop_cities").update({ is_active: !city.is_active }).eq("id", city.id);
    setCities(prev => prev.map(c => c.id === city.id ? { ...c, is_active: !c.is_active } : c));
  };

  const deleteCity = async (id: string) => {
    if (!confirm("Delete this city and all its pricing?")) return;
    await supabase.from("workshop_cities").delete().eq("id", id);
    toast.success("City deleted");
    await fetchData();
  };

  const updateSchedule = async (cityId: string, schedule: DaySchedule[]) => {
    setCities(prev => prev.map(c => c.id === cityId ? { ...c, schedule } : c));
  };

  const saveSchedule = async (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    setSaving(true);
    await supabase.from("workshop_cities").update({ schedule: city.schedule as any, updated_at: new Date().toISOString() }).eq("id", cityId);
    toast.success("Schedule saved");
    setSaving(false);
  };

  const updatePricing = (cityId: string, sessionType: string, price: number) => {
    setPricing(prev => prev.map(p =>
      p.city_id === cityId && p.session_type === sessionType ? { ...p, price } : p
    ));
  };

  const savePricing = async (cityId: string) => {
    setSaving(true);
    const cityPricing = pricing.filter(p => p.city_id === cityId);
    for (const p of cityPricing) {
      await supabase.from("workshop_city_pricing").update({ price: p.price, updated_at: new Date().toISOString() }).eq("id", p.id);
    }
    toast.success("Pricing saved");
    setSaving(false);
  };

  const toggleDay = (cityId: string, day: string) => {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    const existing = city.schedule.find(s => s.day === day);
    let newSchedule: DaySchedule[];
    if (existing) {
      newSchedule = city.schedule.filter(s => s.day !== day);
    } else {
      newSchedule = [...city.schedule, { day, time_slots: [...DEFAULT_TIME_SLOTS] }];
    }
    updateSchedule(cityId, newSchedule);
  };

  const updateTimeSlots = (cityId: string, day: string, slots: string[]) => {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    const newSchedule = city.schedule.map(s =>
      s.day === day ? { ...s, time_slots: slots } : s
    );
    updateSchedule(cityId, newSchedule);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading cities…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <MapPin size={18} className="text-cta" /> Workshop Cities & Pricing
        </h3>
        <p className="text-sm text-muted-foreground">
          Add cities where workshops are available. Each city has its own schedule and session-based pricing.
        </p>
      </div>

      {/* Add City */}
      <div className="p-5 rounded-2xl bg-card border border-border/40">
        <h4 className="text-sm font-semibold text-foreground mb-3">Add New City</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="City name (e.g. Casablanca)"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            className="rounded-xl flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-xl w-full sm:w-56 justify-between font-normal">
                <span className="truncate">
                  {newCityWorkshops.length === 0
                    ? "Select workshops"
                    : newCityWorkshops.length === 1
                      ? WORKSHOPS.find(w => w.value === newCityWorkshops[0])?.label
                      : `${newCityWorkshops.length} workshops selected`}
                </span>
                <ChevronDown size={14} className="opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 rounded-xl" align="start">
              {WORKSHOPS.map(w => {
                const checked = newCityWorkshops.includes(w.value);
                return (
                  <label key={w.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-muted/50">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        setNewCityWorkshops(prev => {
                          if (c) {
                            if (w.value === "all") return ["all"];
                            return [...prev.filter(v => v !== "all"), w.value];
                          }
                          return prev.filter(v => v !== w.value);
                        });
                      }}
                    />
                    <span className="text-sm">{w.label}</span>
                  </label>
                );
              })}
            </PopoverContent>
          </Popover>
          <Button onClick={addCity} disabled={saving || !newCityName.trim()} className="rounded-xl gap-2 bg-cta hover:bg-cta/90 text-primary-foreground">
            <Plus size={14} /> Add City
          </Button>
        </div>
      </div>

      {/* Cities List */}
      {cities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin size={32} className="mx-auto mb-3 opacity-40" />
          <p>No cities added yet. Add your first city above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cities.map((city) => {
            const isExpanded = expandedCity === city.id;
            const cityPricing = pricing.filter(p => p.city_id === city.id);
            const workshopLabel = WORKSHOPS.find(w => w.value === city.workshop)?.label || city.workshop;

            return (
              <div key={city.id} className="rounded-2xl bg-card border border-border/40 overflow-hidden">
                {/* City Header */}
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedCity(isExpanded ? null : city.id)}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    city.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                  )}>
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">{city.city_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {workshopLabel} · {city.schedule.length} days · {cityPricing.length} pricing tiers
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleActive(city); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={city.is_active ? "Deactivate" : "Activate"}
                  >
                    {city.is_active ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} />}
                  </button>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border/30 p-5 space-y-6">
                    {/* Schedule */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Calendar size={14} className="text-cta" /> Schedule
                      </h5>
                      <div className="grid grid-cols-7 gap-2">
                        {DAYS.map(day => {
                          const isActive = city.schedule.some(s => s.day === day);
                          return (
                            <button
                              key={day}
                              onClick={() => toggleDay(city.id, day)}
                              className={cn(
                                "py-2 px-1 rounded-xl text-xs font-medium transition-all border-2",
                                isActive
                                  ? "bg-cta/10 border-cta/40 text-cta"
                                  : "border-border/40 text-muted-foreground hover:border-cta/20"
                              )}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>

                      {/* Time slots per active day */}
                      {city.schedule.map(daySchedule => (
                        <div key={daySchedule.day} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20">
                          <span className="text-xs font-semibold text-foreground w-16 pt-1.5">{daySchedule.day.slice(0, 3)}</span>
                          <div className="flex flex-wrap gap-2 flex-1">
                            {daySchedule.time_slots.map((slot, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <Input
                                  type="time"
                                  value={slot}
                                  onChange={(e) => {
                                    const newSlots = [...daySchedule.time_slots];
                                    newSlots[idx] = e.target.value;
                                    updateTimeSlots(city.id, daySchedule.day, newSlots);
                                  }}
                                  className="w-28 h-8 rounded-lg text-xs"
                                />
                                <button
                                  onClick={() => {
                                    const newSlots = daySchedule.time_slots.filter((_, i) => i !== idx);
                                    updateTimeSlots(city.id, daySchedule.day, newSlots);
                                  }}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => updateTimeSlots(city.id, daySchedule.day, [...daySchedule.time_slots, "10:00"])}
                              className="h-8 px-3 rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-cta/40 transition-colors"
                            >
                              + Slot
                            </button>
                          </div>
                        </div>
                      ))}

                      <Button size="sm" onClick={() => saveSchedule(city.id)} disabled={saving} className="rounded-xl gap-2 bg-cta hover:bg-cta/90 text-primary-foreground">
                        <Save size={12} /> Save Schedule
                      </Button>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <DollarSign size={14} className="text-cta" /> Session Pricing
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SESSION_TYPES.map(st => {
                          const p = cityPricing.find(cp => cp.session_type === st.value);
                          return (
                            <div key={st.value} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-medium text-foreground">{st.label}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Input
                                  type="number"
                                  value={p?.price || 0}
                                  onChange={(e) => updatePricing(city.id, st.value, Number(e.target.value))}
                                  className="w-24 h-8 rounded-lg text-xs text-right"
                                  min={0}
                                />
                                <span className="text-xs text-muted-foreground font-medium">MAD</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Button size="sm" onClick={() => savePricing(city.id)} disabled={saving} className="rounded-xl gap-2 bg-cta hover:bg-cta/90 text-primary-foreground">
                        <Save size={12} /> Save Pricing
                      </Button>
                    </div>

                    {/* Delete */}
                    <div className="pt-3 border-t border-border/30">
                      <Button size="sm" variant="destructive" onClick={() => deleteCity(city.id)} className="rounded-xl gap-2">
                        <Trash2 size={12} /> Delete City
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
