import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";
import { Loader2, Printer, Plus, X, Download, QrCode } from "lucide-react";
import { toast } from "sonner";

type Touchpoint = {
  id: string;
  label: string;
  source: string;
  caption: string;
};

const PALETTE = {
  bg: "#FBFAF6",
  ink: "#0E1418",
  blue: "#5B8AA6",
  blueDeep: "#2E5168",
  sand: "#E6C36B",
  sandSoft: "#F1E2BE",
  line: "#E8E2D2",
};

const DEFAULTS: Touchpoint[] = [
  { id: "room", label: "In-Room Card", source: "room", caption: "Place on the desk or nightstand in each suite." },
  { id: "spa", label: "Spa & Wellness", source: "spa", caption: "Display at the spa welcome counter." },
  { id: "reception", label: "Reception", source: "reception", caption: "Concierge desk and check-in counter." },
  { id: "pool", label: "Pool & Beach Bar", source: "pool", caption: "Beach loungers and bar menus." },
  { id: "restaurant", label: "Restaurant", source: "restaurant", caption: "Tabletop tents at breakfast & dinner." },
  { id: "lobby", label: "Lobby Display", source: "lobby", caption: "Welcome screen or printed easel." },
];

export default function SofitelQR() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles").select("role").eq("user_id", session.user.id);
      setIsAdmin(((data || []) as any[]).some((r) => r.role === "admin"));
    })();
  }, [session]);

  if (checking) return <Center><Loader2 className="animate-spin" /></Center>;
  if (!session) return <Center>
    <div className="text-center">
      <p className="opacity-60 text-sm mb-3">Please sign in as an administrator.</p>
      <a href="/sofitel/admin" className="px-4 py-2 rounded-lg text-sm text-white inline-block" style={{ background: PALETTE.blueDeep }}>
        Go to admin
      </a>
    </div>
  </Center>;
  if (isAdmin === null) return <Center><Loader2 className="animate-spin" /></Center>;
  if (!isAdmin) return <Center><p className="opacity-60 text-sm">Admin access required.</p></Center>;

  return <Generator />;
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen grid place-items-center px-4" style={{ background: PALETTE.bg }}>{children}</div>;
}

function Generator() {
  const baseUrl = `${window.location.origin}/sofitel`;
  const [campaign, setCampaign] = useState("sofitel-tamuda");
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>(DEFAULTS);
  const [newLabel, setNewLabel] = useState("");
  const [newSource, setNewSource] = useState("");

  const buildUrl = (source: string) =>
    `${baseUrl}?utm_source=${encodeURIComponent(source)}&utm_medium=qr&utm_campaign=${encodeURIComponent(campaign)}`;

  const addTouchpoint = () => {
    if (!newLabel.trim() || !newSource.trim()) return;
    const id = newSource.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (touchpoints.some((t) => t.id === id)) {
      toast.error("A touchpoint with this code already exists");
      return;
    }
    setTouchpoints([...touchpoints, { id, label: newLabel.trim(), source: newSource.trim(), caption: "" }]);
    setNewLabel(""); setNewSource("");
  };

  const removeTouchpoint = (id: string) => setTouchpoints(touchpoints.filter((t) => t.id !== id));

  return (
    <div className="min-h-screen" style={{ background: PALETTE.bg, color: PALETTE.ink, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Helmet>
        <title>Sofitel · QR Sheet | Terraria Workshop</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          @media print {
            body, html { background: white !important; }
            .no-print { display: none !important; }
            .print-page { page-break-after: always; }
            .print-page:last-child { page-break-after: auto; }
            @page { size: A4; margin: 0; }
          }
        `}</style>
      </Helmet>

      {/* Toolbar */}
      <header className="no-print sticky top-0 z-30 backdrop-blur" style={{ background: "rgba(251,250,246,0.9)", borderBottom: `1px solid ${PALETTE.line}` }}>
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: PALETTE.blueDeep }}>Sofitel × Terraria</div>
              <h1 className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>QR Sheet · Print & Place</h1>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs">
                <span className="opacity-60 mr-2">Campaign tag</span>
                <input value={campaign} onChange={(e) => setCampaign(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-sm bg-white outline-none" style={{ border: `1px solid ${PALETTE.line}` }} />
              </label>
              <button onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
                style={{ background: PALETTE.blueDeep }}>
                <Printer className="w-4 h-4" /> Print sheet
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New touchpoint label (e.g. Kids Club)"
              className="px-3 py-1.5 rounded-lg text-sm bg-white outline-none flex-1 min-w-[180px]" style={{ border: `1px solid ${PALETTE.line}` }} />
            <input value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="Tracking code (e.g. kids-club)"
              className="px-3 py-1.5 rounded-lg text-sm bg-white outline-none flex-1 min-w-[180px]" style={{ border: `1px solid ${PALETTE.line}` }} />
            <button onClick={addTouchpoint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm hover:bg-black/5"
              style={{ border: `1px solid ${PALETTE.line}` }}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <p className="mt-2 text-[11px] opacity-50">Each card is sized for A6 (105 × 148 mm). Two per A4 sheet, cut along the dotted line.</p>
        </div>
      </header>

      {/* Print pages: 2 cards per A4, paginated */}
      <main className="max-w-5xl mx-auto p-6 print:p-0 print:max-w-none">
        {chunk(touchpoints, 2).map((pair, i) => (
          <section key={i} className="print-page bg-white mb-6 print:mb-0 mx-auto"
            style={{ width: "210mm", minHeight: "297mm", border: `1px solid ${PALETTE.line}` }}>
            <div className="grid grid-rows-2 h-full" style={{ minHeight: "297mm" }}>
              {pair.map((t) => (
                <QRCard key={t.id} touchpoint={t} url={buildUrl(t.source)} onRemove={() => removeTouchpoint(t.id)} />
              ))}
              {pair.length === 1 && <div />}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

function QRCard({ touchpoint, url, onRemove }: { touchpoint: Touchpoint; url: string; onRemove: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 360, margin: 1, color: { dark: "#0E1418", light: "#FFFFFF" }, errorCorrectionLevel: "M" })
      .then(() => setReady(true))
      .catch(() => toast.error("Could not generate QR"));
  }, [url]);

  const download = async () => {
    const dataUrl = await QRCode.toDataURL(url, { width: 1024, margin: 2, color: { dark: "#0E1418", light: "#FFFFFF" } });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `terraria-sofitel-${touchpoint.id}.png`;
    a.click();
  };

  return (
    <div className="relative flex items-center justify-between gap-6 px-12 py-10 border-b border-dashed last:border-b-0"
      style={{ borderColor: PALETTE.line }}>
      {/* Brand strip */}
      <div className="flex-1 max-w-[55%]">
        <div className="text-[9px] tracking-[0.4em] uppercase" style={{ color: PALETTE.blueDeep }}>
          Terraria Workshop × Sofitel Tamuda Bay
        </div>
        <h2 className="mt-3 text-4xl leading-[1.05]" style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.ink }}>
          Discover authentic<br />
          <span style={{ fontStyle: "italic", color: PALETTE.blueDeep }}>creative Morocco</span>.
        </h2>
        <p className="mt-4 text-sm opacity-75 leading-relaxed">
          Scan to explore this week's curated artisan experiences:
          pottery rituals, sunset zellige, embroidery circles and more.
        </p>
        <div className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em]">
          <span className="h-px w-8" style={{ background: PALETTE.sand }} />
          <span style={{ color: PALETTE.blueDeep }}>{touchpoint.label}</span>
        </div>
        {touchpoint.caption && (
          <p className="mt-2 text-[10px] opacity-50 italic no-print">{touchpoint.caption}</p>
        )}
      </div>

      {/* QR */}
      <div className="text-center">
        <div className="p-4 rounded-2xl bg-white inline-block" style={{ border: `2px solid ${PALETTE.ink}` }}>
          <canvas ref={canvasRef} className="block" style={{ width: 180, height: 180 }} />
          {!ready && <div className="absolute inset-0 grid place-items-center"><Loader2 className="animate-spin w-4 h-4" /></div>}
        </div>
        <p className="mt-3 text-[10px] tracking-[0.2em] uppercase opacity-70">Scan to reserve</p>
        <p className="text-[9px] opacity-40 mt-1 max-w-[180px] mx-auto truncate">{url.replace(/^https?:\/\//, "")}</p>
      </div>

      {/* Controls */}
      <div className="absolute top-3 right-3 flex gap-1 no-print">
        <button onClick={download} className="p-1.5 rounded hover:bg-black/5" title="Download PNG" style={{ border: `1px solid ${PALETTE.line}` }}>
          <Download className="w-3.5 h-3.5" />
        </button>
        <button onClick={onRemove} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Remove" style={{ border: `1px solid ${PALETTE.line}` }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
