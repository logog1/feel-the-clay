import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Calendar as CalendarIcon,
  Check,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Users,
  Clock,
  MessageCircle,
  Mail,
} from "lucide-react";

export type PartnerOfferLite = {
  assignment_id: string;
  offer_id: string;
  kind: "offer" | "event";
  title: string;
  subtitle: string | null;
  cover_image: string | null;
  price: number | null;
  currency: string;
  event_at: string | null;
  capacity: number | null;
};

export type PartnerExperienceLite = {
  id: string;
  title: string;
  cover_image: string | null;
  scheduled_at: string;
  capacity: number;
  price_per_person: number;
  currency: string;
};

type Mode = "existing" | "custom";

const WORKSHOPS: { id: string; en: string; ar: string; es: string; fr: string }[] = [
  { id: "pottery", en: "Pottery on the wheel", ar: "الفخار على العجلة", es: "Alfarería en torno", fr: "Poterie au tour" },
  { id: "handbuilding", en: "Handbuilding with clay", ar: "التشكيل اليدوي بالطين", es: "Modelado a mano", fr: "Modelage à la main" },
  { id: "zellij", en: "Zellij mosaic", ar: "الزليج", es: "Mosaico Zellij", fr: "Mosaïque Zellige" },
  { id: "embroidery", en: "Traditional embroidery", ar: "التطريز التقليدي", es: "Bordado tradicional", fr: "Broderie traditionnelle" },
  { id: "carpets", en: "Amazigh carpet weaving", ar: "نسج الزرابي الأمازيغية", es: "Tejido de alfombras amazigh", fr: "Tissage de tapis amazigh" },
  { id: "gardening", en: "Andalusian gardening", ar: "البستنة الأندلسية", es: "Jardinería andalusí", fr: "Jardinage andalou" },
];

const schema = z.object({
  name: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().min(7, "Invalid phone").max(20),
  participants: z.number().int().min(1).max(50),
  notes: z.string().max(1000).optional(),
});

export default function PartnerBookingForm({
  partnerId,
  partnerName,
  brand,
  offers,
  experiences,
  taken,
}: {
  partnerId: string;
  partnerName: string;
  brand: string;
  offers: PartnerOfferLite[];
  experiences: PartnerExperienceLite[];
  taken: Record<string, number>;
}) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState(2);
  const [notes, setNotes] = useState("");

  // For >=3 participants: choose between joining an existing offer or scheduling a new date.
  const [mode, setMode] = useState<Mode>("existing");
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const [customWorkshop, setCustomWorkshop] = useState<string>("");
  const [customTimeSlot, setCustomTimeSlot] = useState<string>("");

  // Availability wired to the main admin dashboard (workshop_availability +
  // per-workshop schedules stored in site_settings as workshop_schedule_<id>).
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [workshopSchedules, setWorkshopSchedules] = useState<
    Record<string, { date: string; time_slots: string[] }[]>
  >({});

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data } = await supabase.from("workshop_availability").select("date, is_available");
      if (data) {
        setBlockedDates(new Set(data.filter((d: any) => !d.is_available).map((d: any) => d.date)));
      }
    };
    const fetchSchedules = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .like("key", "workshop_schedule_%");
      if (data) {
        const map: Record<string, { date: string; time_slots: string[] }[]> = {};
        for (const row of data as any[]) {
          const id = row.key.replace("workshop_schedule_", "");
          try {
            const parsed = JSON.parse(row.value);
            if (Array.isArray(parsed)) map[id] = parsed;
          } catch { /* noop */ }
        }
        setWorkshopSchedules(map);
      }
    };
    fetchAvailability();
    fetchSchedules();

    const channel = supabase
      .channel("partner-booking-availability")
      .on("postgres_changes", { event: "*", schema: "public", table: "workshop_availability" }, fetchAvailability)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, (payload: any) => {
        const key = (payload?.new?.key || payload?.old?.key || "") as string;
        if (key.startsWith("workshop_schedule_")) fetchSchedules();
      })
      .subscribe();

    const onFocus = () => { fetchAvailability(); fetchSchedules(); };
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, []);


  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const isSmall = participants <= 2;
  const now = Date.now();

  // Build a unified list of joinable slots: experiences with remaining capacity + event-type offers.
  type Slot =
    | { key: string; type: "exp"; title: string; when: Date; remaining: number; cover: string | null; price: number; currency: string; refId: string }
    | { key: string; type: "offer"; title: string; when: Date | null; remaining: number | null; cover: string | null; price: number | null; currency: string; refId: string };

  const slots = useMemo<Slot[]>(() => {
    const list: Slot[] = [];
    experiences.forEach((e) => {
      const remaining = Math.max(0, e.capacity - (taken[e.id] || 0));
      const when = parseISO(e.scheduled_at);
      if (when.getTime() < now || remaining <= 0) return;
      list.push({
        key: `exp:${e.id}`,
        type: "exp",
        title: e.title,
        when,
        remaining,
        cover: e.cover_image,
        price: e.price_per_person,
        currency: e.currency,
        refId: e.id,
      });
    });
    offers.forEach((o) => {
      const when = o.event_at ? parseISO(o.event_at) : null;
      if (when && when.getTime() < now) return;
      list.push({
        key: `off:${o.assignment_id}`,
        type: "offer",
        title: o.title,
        when,
        remaining: o.capacity,
        cover: o.cover_image,
        price: o.price,
        currency: o.currency,
        refId: o.offer_id,
      });
    });
    return list.sort((a, b) => {
      const ta = a.when ? a.when.getTime() : Infinity;
      const tb = b.when ? b.when.getTime() : Infinity;
      return ta - tb;
    });
  }, [experiences, offers, taken, now]);

  // Whether user can currently submit "custom date" flow (only for 3+).
  const canUseCustom = !isSmall;

  // Reset selected slot if it disappears
  const selectedSlot = slots.find((s) => s.key === selectedSlotKey) || null;

  const resolveWorkshopLabel = (id: string) => {
    const w = WORKSHOPS.find((x) => x.id === id);
    if (!w) return id;
    return (w as any)[language] || w.en;
  };

  const submit = async () => {
    const parsed = schema.safeParse({
      name,
      email,
      phone: phone || "",
      participants,
      notes,
    });
    if (!parsed.success) {
      toast({ title: parsed.error.errors[0]?.message || "Please check the form", variant: "destructive" });
      return;
    }

    let workshopLabel = "";
    let bookingDate = "";
    let sessionInfo: string | null = null;
    let gross: number | null = null;

    if (mode === "existing" || isSmall) {
      if (!selectedSlot) {
        toast({ title: t("partner.pform.pick_slot"), variant: "destructive" });
        return;
      }
      workshopLabel = selectedSlot.title;
      bookingDate = selectedSlot.when ? format(selectedSlot.when, "yyyy-MM-dd") : "";
      sessionInfo = selectedSlot.when ? format(selectedSlot.when, "HH:mm") : null;
      if (selectedSlot.price != null && selectedSlot.price > 0) gross = selectedSlot.price * participants;
    } else {
      if (!customDate || !customWorkshop) {
        toast({ title: t("partner.pform.pick_date_workshop"), variant: "destructive" });
        return;
      }
      workshopLabel = resolveWorkshopLabel(customWorkshop);
      bookingDate = format(customDate, "yyyy-MM-dd");
      sessionInfo = customTimeSlot ? customTimeSlot : "custom-request";
    }

    setSubmitting(true);

    let commissionRate: number | null = null;
    try {
      const { data } = await (supabase as any).rpc("get_partner_commission_rate", { _partner_id: partnerId });
      if (typeof data === "number") commissionRate = data;
    } catch { /* noop */ }

    const qrVariant = (() => {
      try { return sessionStorage.getItem(`qr_variant_${partnerId}`) || null; } catch { return null; }
    })();

    const { error } = await supabase.from("bookings").insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone || null,
      workshop: workshopLabel,
      booking_date: bookingDate,
      participants,
      session_info: sessionInfo,
      notes: notes.trim() || null,
      partner_id: partnerId,
      gross_amount: gross,
      commission_rate: commissionRate,
      source: qrVariant ? `qr:${qrVariant}` : "partner_landing",
    } as any);

    setSubmitting(false);
    if (error) {
      toast({ title: t("partner.book.failed"), description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center bg-card border border-border rounded-3xl p-8 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white" style={{ background: brand }}>
          <Check size={30} />
        </div>
        <h3 className="text-2xl font-light">{t("partner.pform.received_title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("partner.pform.received_body").replace("{name}", name.split(" ")[0]).replace("{partner}", partnerName)}
        </p>
        <div className="text-start bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <MessageCircle size={14} className="mt-0.5 shrink-0" style={{ color: brand }} />
            <span>{t("partner.pform.wa_note")} <strong>{phone}</strong></span>
          </p>
          <p className="flex items-start gap-2">
            <Mail size={14} className="mt-0.5 shrink-0" style={{ color: brand }} />
            <span>{t("partner.pform.email_note")} <strong>{email}</strong></span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-card border border-border rounded-3xl p-5 md:p-8 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Step 1 — Your details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center text-white" style={{ background: brand }}>1</span>
          <h3 className="font-medium">{t("partner.pform.step_details")}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>{t("partner.book.full_name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
          </div>
          <div>
            <Label>{t("partner.book.email_label")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
          </div>
          <div>
            <Label>{t("partner.pform.whatsapp_label")}</Label>
            <PhoneInput
              international
              defaultCountry="MA"
              value={phone}
              onChange={setPhone}
              placeholder={t("partner.book.phone_placeholder")}
              className="phone-input mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label>{t("partner.pform.participants_label")}</Label>
            <div className="mt-1 flex items-center gap-2">
              <Button
                type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setParticipants((p) => Math.max(1, p - 1))}
                aria-label="Decrease"
              >
                <Minus size={16} />
              </Button>
              <Input
                type="number" min={1} max={50}
                value={participants}
                onChange={(e) => setParticipants(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="text-center font-medium"
              />
              <Button
                type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full"
                onClick={() => setParticipants((p) => Math.min(50, p + 1))}
                aria-label="Increase"
              >
                <Plus size={16} />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {isSmall ? t("partner.pform.small_hint") : t("partner.pform.large_hint")}
            </p>
          </div>
        </div>
      </div>

      {/* Step 2 — Choose experience */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center text-white" style={{ background: brand }}>2</span>
          <h3 className="font-medium">{t("partner.pform.step_choose")}</h3>
        </div>

        {canUseCustom && (
          <div className="inline-flex p-1 bg-muted rounded-full text-sm">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={cn(
                "px-4 py-1.5 rounded-full transition",
                mode === "existing" ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              style={mode === "existing" ? { background: brand } : undefined}
            >
              {t("partner.pform.mode_existing")}
            </button>
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={cn(
                "px-4 py-1.5 rounded-full transition",
                mode === "custom" ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              style={mode === "custom" ? { background: brand } : undefined}
            >
              {t("partner.pform.mode_custom")}
            </button>
          </div>
        )}

        {(isSmall || mode === "existing") && (
          <div className="space-y-2.5">
            {slots.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border text-center bg-background/60">
                <CalendarIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isSmall ? t("partner.pform.no_slots_small") : t("partner.pform.no_slots_large")}
                </p>
              </div>
            ) : (
              slots.map((s) => {
                const active = selectedSlotKey === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedSlotKey(s.key)}
                    aria-pressed={active}
                    className={cn(
                      "w-full text-start bg-background border rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 min-h-[80px] transition",
                      active
                        ? "border-2 shadow-sm"
                        : "border-border hover:border-foreground/30 hover:-translate-y-0.5"
                    )}
                    style={active ? { borderColor: brand } : undefined}
                  >
                    {s.cover ? (
                      <img src={s.cover} alt={s.title} loading="lazy" className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl grid place-items-center shrink-0" style={{ background: `${brand}22`, color: brand }}>
                        <Sparkles size={18} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full text-white" style={{ background: brand }}>
                          {s.type === "offer" ? t("partner.offers.event") : t("partner.slots.workshop")}
                        </span>
                        {s.when && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarIcon size={11} /> {format(s.when, "EEE d MMM")}
                          </span>
                        )}
                        {s.when && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={11} /> {format(s.when, "HH:mm")}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-sm md:text-base truncate">{s.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {s.remaining != null && (
                          <span className="inline-flex items-center gap-1">
                            <Users size={11} /> {s.type === "exp"
                              ? t("partner.slots.left").replace("{n}", String(s.remaining))
                              : `${s.remaining} ${t("partner.offers.spots")}`}
                          </span>
                        )}
                        {s.price != null && s.price > 0 && (
                          <span className="font-medium text-foreground">{s.price} {s.currency}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                        active ? "" : "border-border"
                      )}
                      style={active ? { borderColor: brand, background: brand } : undefined}
                    >
                      {active && <Check size={12} className="text-white" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {!isSmall && mode === "custom" && (() => {
          const schedule = customWorkshop ? workshopSchedules[customWorkshop] || [] : [];
          const scheduleDates = new Set(schedule.map((s) => s.date));
          const hasSchedule = scheduleDates.size > 0;
          const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
          const dateStr = customDate ? format(customDate, "yyyy-MM-dd") : "";
          const slotsForDate = hasSchedule
            ? (schedule.find((s) => s.date === dateStr)?.time_slots || [])
            : [];

          return (
            <div className="space-y-3">
              <div>
                <Label>{t("partner.pform.pick_workshop")}</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {WORKSHOPS.map((w) => {
                    const active = customWorkshop === w.id;
                    const label = (w as any)[language] || w.en;
                    const wsSchedule = workshopSchedules[w.id] || [];
                    const upcomingCount = wsSchedule.filter((s) => s.date >= format(todayStart, "yyyy-MM-dd")).length;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setCustomWorkshop(w.id);
                          setCustomDate(undefined);
                          setCustomTimeSlot("");
                        }}
                        className={cn(
                          "text-xs md:text-sm px-3 py-2 rounded-xl border text-start transition",
                          active ? "border-2 font-medium" : "border-border hover:border-foreground/30"
                        )}
                        style={active ? { borderColor: brand, background: `${brand}12`, color: brand } : undefined}
                      >
                        <div>{label}</div>
                        {upcomingCount > 0 && (
                          <div className="text-[10px] font-normal text-muted-foreground mt-0.5">
                            {t("partner.pform.dates_available").replace("{n}", String(upcomingCount))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>{t("partner.pform.pick_date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!customWorkshop}
                        className={cn(
                          "w-full mt-1 justify-start text-start font-normal",
                          !customDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="me-2 h-4 w-4" />
                        {customDate ? format(customDate, "PPP") : t("partner.pform.pick_date_placeholder")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customDate}
                        onSelect={(d) => { setCustomDate(d); setCustomTimeSlot(""); }}
                        disabled={(d) => {
                          if (d < todayStart) return true;
                          const k = format(d, "yyyy-MM-dd");
                          if (blockedDates.has(k)) return true;
                          if (hasSchedule && !scheduleDates.has(k)) return true;
                          return false;
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {!customWorkshop && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {t("partner.pform.pick_workshop_first")}
                    </p>
                  )}
                  {customWorkshop && !hasSchedule && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {t("partner.pform.any_date_hint")}
                    </p>
                  )}
                </div>

                {slotsForDate.length > 0 && (
                  <div>
                    <Label>{t("partner.pform.pick_time")}</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {slotsForDate.map((slot) => {
                        const active = customTimeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setCustomTimeSlot(slot)}
                            className={cn(
                              "text-xs px-3 py-1.5 rounded-full border transition",
                              active ? "border-2 font-medium" : "border-border hover:border-foreground/30"
                            )}
                            style={active ? { borderColor: brand, background: `${brand}12`, color: brand } : undefined}
                          >
                            <Clock size={11} className="inline me-1 -mt-0.5" />
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Step 3 — Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center text-muted-foreground bg-muted">3</span>
          <h3 className="font-medium text-muted-foreground">
            {t("partner.pform.step_notes")} <span className="text-xs font-normal">({t("partner.book.optional")})</span>
          </h3>
        </div>
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
          placeholder={t("partner.pform.notes_placeholder")}
        />
      </div>

      {/* Submit */}
      <Button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full h-12 rounded-full text-white text-base font-medium"
        style={{ background: brand }}
      >
        {submitting ? (
          <><Loader2 size={16} className="me-2 animate-spin" />{t("partner.book.sending")}</>
        ) : (
          t("partner.pform.submit")
        )}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        {t("partner.pform.reply_note")}
      </p>
    </div>
  );
}
