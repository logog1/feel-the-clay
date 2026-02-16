import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Send, CheckCircle } from "lucide-react";
import { format, isWeekend, isSaturday, isSunday } from "date-fns";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isLargeGroup = form.participants >= 4;

  const workshops = [
    { value: "pottery", label: t("offers.pottery") },
    { value: "handbuilding", label: t("offers.handbuilding") },
    { value: "embroidery", label: t("offers.embroidery") },
  ];

  const participantOptions = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => i + 1), []
  );

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (!isLargeGroup) {
      // Less than 4: only weekends
      return !isWeekend(date);
    }
    // 4+ with open workshop: weekends only
    if (form.sessionType === "open") {
      return !isWeekend(date);
    }
    // 4+ with private: any day
    return false;
  };

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = bookingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
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
              <div className="space-y-1.5">
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
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-cta">{t("booking.select_workshop")}</h3>
            <RadioGroup value={form.workshop} onValueChange={(v) => setForm({ ...form, workshop: v })}>
              <div className="grid grid-cols-1 gap-2">
                {workshops.map((w) => (
                  <label key={w.value} className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    form.workshop === w.value ? "border-cta bg-cta/5" : "border-border/40 hover:border-cta/30"
                  )}>
                    <RadioGroupItem value={w.value} />
                    <span className="text-sm font-medium">{w.label}</span>
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
          <div className="space-y-3">
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
