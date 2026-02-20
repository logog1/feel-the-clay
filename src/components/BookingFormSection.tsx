import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Send, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  city: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(6, "Required").max(20),
  workshop: z.string().min(1, "Select a workshop"),
  participants: z.number().min(1).max(50),
  sessionType: z.string().optional(),
  date: z.date({ required_error: "Select a date" }),
  notes: z.string().max(1000).optional(),
});

const BookingFormSection = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: "", city: "", email: "", phone: "",
    workshop: "", participants: 1, sessionType: "",
    date: undefined as Date | undefined, notes: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data } = await supabase.from("workshop_availability").select("*");
      if (data) {
        setAvailableDates(data.filter((d: any) => d.is_available).map((d: any) => d.date));
        setBlockedDates(data.filter((d: any) => !d.is_available).map((d: any) => d.date));
      }
    };
    fetchAvailability();
  }, []);

  const isLargeGroup = form.participants >= 4;

  const workshops = [
    { value: "pottery", label: t("offers.pottery") },
    { value: "handbuilding", label: t("offers.handbuilding") },
    { value: "embroidery", label: t("offers.embroidery"), unavailable: true },
  ];

  const isPottery = form.workshop === "pottery";

  const participantOptions = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => i + 1), []
  );

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    const dateStr = format(date, "yyyy-MM-dd");
    if (blockedDates.includes(dateStr)) return true;
    // Small groups (< 4) can only book weekends (Sat=6, Sun=0)
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    if (!isLargeGroup && !isWeekend) return true;
    return false;
  };

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // bot detected
    const result = bookingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);

      // Find the first error field and scroll to it
      const firstErrorField = result.error.errors[0]?.path[0];
      if (firstErrorField) {
        const fieldMap: Record<string, string> = {
          name: "name", city: "city", email: "email", phone: "phone",
          workshop: "workshop-section", date: "date-section",
        };
        const targetId = fieldMap[String(firstErrorField)];
        if (targetId) {
          const el = document.getElementById(targetId);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          // Brief shake animation
          el?.classList.add("animate-[shake_0.4s_ease-in-out]");
          setTimeout(() => el?.classList.remove("animate-[shake_0.4s_ease-in-out]"), 500);
        }
      }
      return;
    }
    setErrors({});
    setSending(true);

    const workshopLabel = workshops.find(w => w.value === form.workshop)?.label || form.workshop;
    const sessionInfo = isLargeGroup && form.sessionType ? ` (${form.sessionType === "private" ? "Private Session" : "Open Workshop"})` : " (Open Workshop - Weekend 4PM)";
    const dateStr = form.date ? format(form.date, "PPP") : "";

    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "booking",
          data: {
            name: form.name,
            city: form.city,
            email: form.email,
            phone: form.phone,
            workshop: workshopLabel,
            sessionInfo: sessionInfo.trim(),
            participants: String(form.participants),
            date: dateStr,
            notes: form.notes || "",
          },
        },
      });
    } catch (err) {
      console.error(err);
    }

    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="booking" className="py-20 md:py-28 bg-sand-dark/30">
        <div className="container-narrow text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-cta mx-auto" />
          <h2 className="text-2xl font-bold">{t("booking.success_title")}</h2>
          <p className="text-muted-foreground">{t("booking.success_desc")}</p>
          <Button variant="cta" onClick={() => setSubmitted(false)}>
            {t("booking.another")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-16 md:py-24 bg-sand-dark/30">
      <div className="container-narrow">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold">{t("booking.title")}</h2>
          <p className="text-muted-foreground text-sm">{t("booking.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 rounded-3xl border-2 border-border/40 shadow-sm">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("booking.personal")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="name" className="space-y-1.5">
                <Label htmlFor="name">{t("booking.name")} *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">{t("booking.city")} *</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl" />
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("booking.email")} *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("booking.phone")} *</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212..." className="rounded-xl" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Workshop Selection */}
          <div id="workshop-section" className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("booking.select_workshop")}</h3>
            <RadioGroup value={form.workshop} onValueChange={(v) => setForm({ ...form, workshop: v })}>
              <div className="grid grid-cols-1 gap-2">
                {workshops.map((w) => (
                  <label key={w.value} className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    w.unavailable
                      ? "cursor-not-allowed opacity-50 border-border/40 bg-muted/30"
                      : "cursor-pointer",
                    !w.unavailable && (form.workshop === w.value ? "border-cta bg-cta/5" : "border-border/40 hover:border-cta/30")
                  )}>
                    <RadioGroupItem value={w.value} disabled={w.unavailable} />
                    <span className="text-sm font-medium flex-1">{w.label}</span>
                    {w.unavailable && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-destructive border border-destructive/60 rounded px-1.5 py-0.5">
                        Coming Soon
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </RadioGroup>
            {errors.workshop && <p className="text-xs text-destructive">{errors.workshop}</p>}
          </div>

          {/* Participants */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("booking.participants")}</h3>
            <div className="flex flex-wrap gap-2">
              {participantOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, participants: n, sessionType: "", date: undefined })}
                  className={cn(
                    "w-10 h-10 rounded-xl text-sm font-medium border-2 transition-all",
                    form.participants === n ? "border-cta bg-cta text-primary-foreground" : "border-border/40 hover:border-cta/30"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Session Type (for 4+) */}
          {isLargeGroup && (
            <div className="space-y-3 p-4 rounded-xl bg-cta/5 border-2 border-cta/20">
              <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("booking.session_type")}</h3>
              <p className="text-xs text-muted-foreground">{t("booking.large_group_info")}</p>
              <RadioGroup value={form.sessionType} onValueChange={(v) => setForm({ ...form, sessionType: v, date: undefined })}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    form.sessionType === "open" ? "border-cta bg-cta/10" : "border-border/40 hover:border-cta/30"
                  )}>
                    <RadioGroupItem value="open" />
                    <div>
                      <span className="text-sm font-medium block">{t("booking.open_workshop")}</span>
                      <span className="text-xs text-muted-foreground">{t("booking.open_desc")}</span>
                    </div>
                  </label>
                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    form.sessionType === "private" ? "border-cta bg-cta/10" : "border-border/40 hover:border-cta/30"
                  )}>
                    <RadioGroupItem value="private" />
                    <div>
                      <span className="text-sm font-medium block">{t("booking.private_session")}</span>
                      <span className="text-xs text-muted-foreground">{t("booking.private_desc")}</span>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Small group info */}
          {!isLargeGroup && (
            <div className="p-4 rounded-xl bg-cta/5 border-2 border-cta/20">
              <p className="text-xs text-muted-foreground">{t("booking.small_group_info")}</p>
            </div>
          )}

          {/* Date */}
          <div id="date-section" className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("booking.date")}</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl border-2", !form.date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.date ? format(form.date, "PPP") : t("booking.pick_date")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.date}
                  onSelect={(d) => setForm({ ...form, date: d })}
                  disabled={isDateDisabled}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("booking.notes")}</h3>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("booking.notes_placeholder")}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          {/* Honeypot - hidden from real users */}
          <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" tabIndex={-1} />
          </div>

          {/* Submit */}
          <Button type="submit" variant="cta" size="xl" className="w-full shadow-xl shadow-cta/20" disabled={sending}>
            <Send className="w-4 h-4 mr-2" />
            {sending ? "..." : t("booking.submit")}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default BookingFormSection;
