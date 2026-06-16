import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useHotelPartnerBySlug } from "@/hooks/use-hotel-partners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Hotel, QrCode, Printer, Plus, Trash2, Lock, Loader2, Download, BedDouble, User,
} from "lucide-react";

type Variant = {
  id: string;
  partner_id: string;
  code: string;
  label: string;
  scope: "property" | "room" | "staff" | "event";
  room_number: string | null;
  staff_user_id: string | null;
  is_active: boolean;
};

type Size = "a4" | "a5" | "tent";

const SIZES: Record<Size, { label: string; w: string; h: string; qrPx: number }> = {
  a4: { label: "A4 poster", w: "210mm", h: "297mm", qrPx: 520 },
  a5: { label: "A5 flyer", w: "148mm", h: "210mm", qrPx: 380 },
  tent: { label: "Table tent", w: "100mm", h: "150mm", qrPx: 280 },
};

const STRAPLINES: Record<string, { en: string; fr: string; es: string; ar: string }> = {
  property: {
    en: "Scan to discover our curated craft experiences.",
    fr: "Scannez pour découvrir nos expériences artisanales.",
    es: "Escanea para descubrir experiencias artesanales.",
    ar: "امسح لاكتشاف تجارب الحرف اليدوية لدينا.",
  },
  room: {
    en: "Welcome to your room. Scan to book a workshop during your stay.",
    fr: "Bienvenue dans votre chambre. Scannez pour réserver un atelier.",
    es: "Bienvenido a tu habitación. Escanea para reservar un taller.",
    ar: "مرحبا في غرفتك. امسح لحجز ورشة عمل.",
  },
  staff: {
    en: "Ask our team. Scan to book directly.",
    fr: "Demandez à notre équipe. Scannez pour réserver.",
    es: "Pregunta a nuestro equipo. Escanea para reservar.",
    ar: "اسأل فريقنا. امسح للحجز.",
  },
  event: {
    en: "Join us. Scan to view the program.",
    fr: "Rejoignez-nous. Scannez pour voir le programme.",
    es: "Únete. Escanea para ver el programa.",
    ar: "انضم إلينا. امسح لمشاهدة البرنامج.",
  },
};

export default function PartnerQR() {
  const { slug } = useParams<{ slug: string }>();
  const { partner, loading: pLoading } = useHotelPartnerBySlug(slug);

  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [canManage, setCanManage] = useState(false);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingV, setLoadingV] = useState(false);

  const [tab, setTab] = useState<"room" | "staff" | "property">("room");
  const [size, setSize] = useState<Size>("a4");
  const [lang, setLang] = useState<"en" | "fr" | "es" | "ar">("en");

  const [bulkInput, setBulkInput] = useState("");
  const [staffLabel, setStaffLabel] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!session || !partner) { setCanManage(false); return; }
    (async () => {
      const [{ data: roles }, { data: staff }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
        (supabase as any).from("partner_staff").select("id").eq("user_id", session.user.id).eq("partner_id", partner.id).maybeSingle(),
      ]);
      const isAdmin = (roles || []).some((r: any) => r.role === "admin");
      setCanManage(isAdmin || !!staff);
    })();
  }, [session, partner]);

  const loadVariants = async () => {
    if (!partner) return;
    setLoadingV(true);
    const { data, error } = await (supabase as any)
      .from("partner_qr_variants")
      .select("*")
      .eq("partner_id", partner.id)
      .order("scope", { ascending: true })
      .order("code", { ascending: true });
    if (error) toast.error(error.message);
    setVariants((data || []) as Variant[]);
    setLoadingV(false);
  };

  useEffect(() => { if (canManage) loadVariants(); }, [canManage, partner?.id]);

  const filtered = useMemo(() => variants.filter((v) => v.scope === tab && v.is_active), [variants, tab]);

  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/partners/${partner?.slug}` : "";

  const qrUrl = (code: string | null) => {
    const target = code ? `${baseUrl}?v=${encodeURIComponent(code)}` : baseUrl;
    const color = (partner?.brand_color || "#0E1418").replace("#", "");
    const px = SIZES[size].qrPx;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${px}x${px}&margin=8&color=${color}&data=${encodeURIComponent(target)}`;
  };

  const parseRooms = (input: string): string[] => {
    const out = new Set<string>();
    input.split(",").map((s) => s.trim()).filter(Boolean).forEach((part) => {
      const m = part.match(/^(\d+)\s*[-–]\s*(\d+)$/);
      if (m) {
        const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
        if (a > 0 && b >= a && b - a <= 500) for (let i = a; i <= b; i++) out.add(String(i));
      } else if (/^\w+$/.test(part)) {
        out.add(part);
      }
    });
    return Array.from(out);
  };

  const bulkCreateRooms = async () => {
    if (!partner) return;
    const rooms = parseRooms(bulkInput);
    if (rooms.length === 0) return toast.error("Enter rooms like 101-120 or 12,14,16");
    setBusy(true);
    const rows = rooms.map((r) => ({
      partner_id: partner.id,
      code: `r-${r}`,
      label: `Room ${r}`,
      scope: "room",
      room_number: r,
      is_active: true,
    }));
    const { error } = await (supabase as any).from("partner_qr_variants").upsert(rows, { onConflict: "partner_id,code" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Created ${rooms.length} room QR${rooms.length > 1 ? "s" : ""}`);
    setBulkInput("");
    loadVariants();
  };

  const addStaff = async () => {
    if (!partner || !staffLabel.trim()) return toast.error("Enter a staff name");
    const code = (staffCode.trim() || `staff-${staffLabel.trim().toLowerCase().replace(/\s+/g, "-")}`).slice(0, 60);
    setBusy(true);
    const { error } = await (supabase as any).from("partner_qr_variants").upsert({
      partner_id: partner.id,
      code,
      label: staffLabel.trim(),
      scope: "staff",
      is_active: true,
    }, { onConflict: "partner_id,code" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Staff QR added");
    setStaffLabel(""); setStaffCode("");
    loadVariants();
  };

  const ensurePropertyVariant = async () => {
    if (!partner) return;
    setBusy(true);
    const { error } = await (supabase as any).from("partner_qr_variants").upsert({
      partner_id: partner.id,
      code: "main",
      label: "Main entrance",
      scope: "property",
      is_active: true,
    }, { onConflict: "partner_id,code" });
    setBusy(false);
    if (error) return toast.error(error.message);
    loadVariants();
  };

  const deactivate = async (id: string) => {
    const { error } = await (supabase as any).from("partner_qr_variants").update({ is_active: false }).eq("id", id);
    if (error) return toast.error(error.message);
    loadVariants();
  };

  // --- States ---
  if (pLoading || authChecking) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!partner) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <Hotel className="w-10 h-10 text-muted-foreground/60 mx-auto mb-2" />
          <h1 className="text-xl font-semibold">Property not found</h1>
          <Link to="/" className="text-primary underline text-sm">Back to home</Link>
        </div>
      </div>
    );
  }

  // Public preview if not authenticated: show a single property QR (the existing behaviour)
  if (!canManage) {
    const code = "main";
    return (
      <div className="min-h-screen grid place-items-center p-6" style={{ background: `${partner.brand_color}10` }}>
        <Card className="max-w-sm w-full p-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] mb-3"
               style={{ background: `${partner.brand_color}20`, color: partner.brand_color }}>
            <QrCode size={11} /> Guest check-in
          </div>
          <h1 className="text-xl font-semibold mb-1">{partner.name}</h1>
          <p className="text-xs text-muted-foreground mb-4">{STRAPLINES.property[lang]}</p>
          <div className="mx-auto w-fit p-3 rounded-2xl bg-white border">
            <img src={qrUrl(code)} alt="QR" width={240} height={240} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            <Lock size={10} className="inline mr-1" />Sign in as staff to manage the QR kit.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-3">
            <Link to={`/partners/${partner.slug}/concierge`}>Open concierge</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const printKit = () => window.print();

  return (
    <div className="min-h-screen bg-[#FBFAF6]">
      <Helmet><title>{partner.name} · QR Kit</title></Helmet>

      {/* Toolbar (hidden on print) */}
      <header className="border-b bg-white print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {partner.logo_url
              ? <img src={partner.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
              : <div className="w-8 h-8 rounded grid place-items-center text-white text-[10px] font-bold" style={{ background: partner.brand_color }}>{partner.name.slice(0,2).toUpperCase()}</div>}
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">QR kit</p>
              <h1 className="font-semibold truncate text-sm">{partner.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(Object.keys(SIZES) as Size[]).map((s) => (
              <button key={s} onClick={() => setSize(s)}
                className={`text-[11px] px-2.5 py-1 rounded-full border ${size === s ? "text-white" : "bg-white"}`}
                style={size === s ? { background: partner.brand_color, borderColor: partner.brand_color } : {}}>
                {SIZES[s].label}
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            {(["en", "fr", "es", "ar"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`text-[11px] px-2 py-1 rounded-full border uppercase ${lang === l ? "bg-foreground text-background" : "bg-white"}`}>
                {l}
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            <Button size="sm" variant="outline" onClick={printKit}>
              <Printer size={13} className="mr-1" /> Print / Save PDF
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to={`/partners/${partner.slug}/concierge`}>Concierge</Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2">
          {[
            { id: "room", label: "Rooms", icon: BedDouble },
            { id: "staff", label: "Staff", icon: User },
            { id: "property", label: "Property", icon: Hotel },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${tab === t.id ? "text-white" : "bg-white"}`}
              style={tab === t.id ? { background: partner.brand_color, borderColor: partner.brand_color } : {}}>
              <t.icon size={12} />{t.label}
              <span className="opacity-70">({variants.filter((v) => v.scope === (t.id as any) && v.is_active).length})</span>
            </button>
          ))}
        </div>
      </header>

      {/* Generator panel */}
      <section className="max-w-6xl mx-auto p-4 print:hidden">
        {tab === "room" && (
          <Card className="p-3 flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[220px]">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Bulk-create room QRs</label>
              <Input value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder="101-120, 201, 305" />
            </div>
            <Button onClick={bulkCreateRooms} disabled={busy} style={{ background: partner.brand_color }}>
              {busy ? <Loader2 size={14} className="animate-spin mr-1" /> : <Plus size={14} className="mr-1" />} Generate
            </Button>
          </Card>
        )}
        {tab === "staff" && (
          <Card className="p-3 flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Staff name</label>
              <Input value={staffLabel} onChange={(e) => setStaffLabel(e.target.value)} placeholder="Amine" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Code (optional)</label>
              <Input value={staffCode} onChange={(e) => setStaffCode(e.target.value)} placeholder="staff-amine" />
            </div>
            <Button onClick={addStaff} disabled={busy} style={{ background: partner.brand_color }}>
              <Plus size={14} className="mr-1" /> Add staff QR
            </Button>
          </Card>
        )}
        {tab === "property" && filtered.length === 0 && (
          <Card className="p-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Create a main entrance QR for general guests.</p>
            <Button onClick={ensurePropertyVariant} disabled={busy} style={{ background: partner.brand_color }}>
              <Plus size={14} className="mr-1" /> Add main QR
            </Button>
          </Card>
        )}
      </section>

      {/* Cards grid */}
      <main className="max-w-6xl mx-auto p-4 pt-0">
        {loadingV ? (
          <div className="py-10 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed">
            No {tab} QRs yet. Use the generator above.
          </Card>
        ) : (
          <div className="grid gap-4 print:gap-0 print:grid-cols-1"
               style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${SIZES[size].w}, 100%), 1fr))` }}>
            {filtered.map((v) => (
              <PrintCard key={v.id} v={v} partner={partner} size={size} lang={lang} qrUrl={qrUrl(v.code)} onDeactivate={() => deactivate(v.id)} />
            ))}
          </div>
        )}
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          @page { margin: 6mm; size: auto; }
          .print\\:hidden { display: none !important; }
          .qr-card { page-break-inside: avoid; break-inside: avoid; box-shadow: none !important; border: 1px dashed #ddd !important; }
        }
      `}</style>
    </div>
  );
}

function PrintCard({ v, partner, size, lang, qrUrl, onDeactivate }: {
  v: Variant; partner: any; size: Size; lang: "en" | "fr" | "es" | "ar"; qrUrl: string; onDeactivate: () => void;
}) {
  const dims = SIZES[size];
  const strap = STRAPLINES[v.scope] || STRAPLINES.property;
  return (
    <div className="qr-card relative bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col"
         style={{ width: "100%", maxWidth: dims.w, aspectRatio: `${parseFloat(dims.w)} / ${parseFloat(dims.h)}` }}>
      <button onClick={onDeactivate} title="Remove"
              className="print:hidden absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white border text-muted-foreground hover:text-destructive">
        <Trash2 size={12} />
      </button>

      <div className="h-1.5 w-full" style={{ background: partner.brand_color }} />

      <div className="px-4 pt-3 flex items-center gap-2">
        {partner.logo_url
          ? <img src={partner.logo_url} alt="" className="h-7 object-contain" />
          : <div className="h-7 px-2 rounded grid place-items-center text-white text-[10px] font-bold" style={{ background: partner.brand_color }}>{partner.name}</div>}
        <div className="ml-auto text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {v.scope === "room" ? `Room ${v.room_number || v.code.replace("r-", "")}` : v.scope === "staff" ? "Staff" : "Entrance"}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-3">
        <div className="p-2 bg-white border rounded-lg">
          <img src={qrUrl} alt={`QR ${v.label}`} className="block" style={{ width: "100%", height: "auto", maxWidth: 360 }} />
        </div>
        <p className="text-center text-[11px] mt-3 text-foreground/80 leading-snug max-w-[80%]" dir={lang === "ar" ? "rtl" : "ltr"}>
          {strap[lang]}
        </p>
      </div>

      <div className="px-4 pb-3 flex items-center justify-between text-[9px] text-muted-foreground border-t pt-2">
        <span className="font-medium" style={{ color: partner.brand_color }}>{partner.name}</span>
        <span>terraria.workshops</span>
      </div>

      {!v.is_active && (
        <Badge variant="outline" className="absolute top-2 left-2 text-[9px]">Inactive</Badge>
      )}
    </div>
  );
}
