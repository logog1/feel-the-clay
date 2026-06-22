import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useHotelPartnerBySlug } from "@/hooks/use-hotel-partners";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Hotel, Printer, Loader2, Lock, Copy, MessageCircle, BookOpen,
  CheckCircle2, Sparkles, QrCode, Phone,
} from "lucide-react";

type Lang = "en" | "fr" | "es" | "ar";

const WORKSHOPS = [
  { name: "Pottery wheel", time: "2h", price: "350 MAD", who: "Adults, couples, families" },
  { name: "Zellige mosaic", time: "2h", price: "400 MAD", who: "Design lovers, hands-on guests" },
  { name: "Weaving (Amazigh rug)", time: "2-3h", price: "450 MAD", who: "Culture seekers, gift hunters" },
  { name: "Embroidery", time: "1.5h", price: "300 MAD", who: "Quiet, meditative guests" },
  { name: "Paint-a-pot & plant", time: "1h", price: "180 MAD", who: "Families with kids" },
];

const WHATSAPP_TEMPLATES: Record<string, Record<Lang, string>> = {
  welcome: {
    en: "Hi {guest}, welcome to {hotel}! While you're with us, we offer authentic Moroccan craft workshops with master artisans — pottery, zellige, weaving. Want me to send you the menu?",
    fr: "Bonjour {guest}, bienvenue au {hotel} ! Pendant votre séjour, nous proposons des ateliers d'artisanat marocain avec des maîtres artisans — poterie, zellige, tissage. Souhaitez-vous le menu ?",
    es: "Hola {guest}, ¡bienvenido a {hotel}! Durante su estancia ofrecemos talleres de artesanía marroquí con maestros artesanos — cerámica, zellige, tejido. ¿Le envío el menú?",
    ar: "مرحباً {guest}, أهلاً بك في {hotel}! خلال إقامتك، نقدم ورش حرف مغربية أصيلة مع معلمين حرفيين — فخار، زليج، نسيج. هل ترغب أن أرسل لك القائمة؟",
  },
  followup: {
    en: "Here's our craft workshop link: {url}. Pick any time during your stay — we'll handle transport details. Let me know which one interests you!",
    fr: "Voici le lien de nos ateliers : {url}. Choisissez un créneau pendant votre séjour — nous gérons le transport. Dites-moi lequel vous intéresse !",
    es: "Aquí está el enlace de nuestros talleres: {url}. Elige cualquier momento — nos encargamos del transporte. ¡Dime cuál te interesa!",
    ar: "هذا رابط الورش: {url}. اختر أي وقت خلال إقامتك — سنهتم بالنقل. أخبرني أيهم يناسبك!",
  },
  reminder: {
    en: "Reminder: your {workshop} workshop is tomorrow at {time}. Pickup at reception. Wear comfortable clothes you don't mind getting clay on!",
    fr: "Rappel : votre atelier {workshop} est demain à {time}. Rendez-vous à la réception. Portez des vêtements confortables !",
    es: "Recordatorio: tu taller de {workshop} es mañana a las {time}. Punto de encuentro: recepción. ¡Lleva ropa cómoda!",
    ar: "تذكير: ورشة {workshop} غداً في {time}. نقطة اللقاء: الاستقبال. ارتدِ ملابس مريحة!",
  },
};

const SCRIPTS = [
  {
    moment: "At check-in",
    icon: CheckCircle2,
    en: "While I prepare your keys — many of our guests join one of our Moroccan craft workshops during their stay. It's about 2 hours with a master artisan, here in Tétouan. Would you like me to share the options?",
  },
  {
    moment: "When guest asks about activities",
    icon: Sparkles,
    en: "The most popular thing our guests do is a pottery or zellige workshop. You leave with the piece you make. Want me to book it for you? It takes 30 seconds.",
  },
  {
    moment: "In-room turndown card",
    icon: BookOpen,
    en: "Scan the QR by your bed to discover authentic craft workshops with master artisans — pottery, zellige, weaving. Every booking supports the artisan you learn from.",
  },
];

const FAQ = [
  { q: "Is the workshop in English?", a: "Yes — all artisans are accompanied by a bilingual host. EN, FR, ES, AR available." },
  { q: "How do guests get there?", a: "Workshop is a short taxi from most central riads. Terraria can arrange pickup on request." },
  { q: "Can children join?", a: "Yes, 6+ for pottery/zellige. The paint-a-pot workshop is great for younger kids." },
  { q: "Refund policy?", a: "Free cancellation up to 24h before the workshop. Full refund if Terraria cancels for any reason." },
  { q: "Do you pay commission?", a: "Yes — tracked automatically via the QR code, paid monthly to your property." },
];

export default function PartnerKit() {
  const { slug } = useParams<{ slug: string }>();
  const { partner, loading: pLoading } = useHotelPartnerBySlug(slug);
  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

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

  if (pLoading || authChecking) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  }
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
  if (!canManage) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <Card className="max-w-sm p-6">
          <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <h1 className="text-lg font-semibold mb-1">Staff sign-in required</h1>
          <p className="text-sm text-muted-foreground mb-4">The onboarding kit is reserved for {partner.name} team members.</p>
          <Button asChild size="sm"><Link to={`/partners/${partner.slug}/concierge`}>Open concierge</Link></Button>
        </Card>
      </div>
    );
  }

  const brand = partner.brand_color || "#0E1418";
  const baseUrl = typeof window !== "undefined" ? `${window.location.origin}/partners/${partner.slug}` : "";

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
  };

  const fillTemplate = (tpl: string) =>
    tpl.replace("{hotel}", partner.name).replace("{guest}", "[guest name]").replace("{url}", baseUrl).replace("{workshop}", "[workshop]").replace("{time}", "[time]");

  return (
    <div className="min-h-screen bg-[#FBFAF6]">
      <Helmet><title>{partner.name} · Onboarding Kit</title></Helmet>

      {/* Toolbar */}
      <header className="border-b bg-white print:hidden sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {partner.logo_url
              ? <img src={partner.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
              : <div className="w-8 h-8 rounded grid place-items-center text-white text-[10px] font-bold" style={{ background: brand }}>{partner.name.slice(0,2).toUpperCase()}</div>}
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Onboarding kit</p>
              <h1 className="font-semibold truncate text-sm">{partner.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["en", "fr", "es", "ar"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`text-[11px] px-2 py-1 rounded-full border uppercase ${lang === l ? "bg-foreground text-background" : "bg-white"}`}>
                {l}
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer size={13} className="mr-1" /> Print / Save PDF
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to={`/partners/${partner.slug}/qr`}><QrCode size={13} className="mr-1" /> QR Kit</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 print:p-0">
        {/* Cover */}
        <Card className="overflow-hidden print:shadow-none print:border-0">
          <div className="h-2 w-full" style={{ background: brand }} />
          <div className="p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Staff onboarding · {partner.name}</p>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">Recommending Terraria workshops to your guests</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              A 5-minute guide your front desk and concierge can use today. Print it, keep one copy at reception, share the digital link with new staff.
            </p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <KV label="Workshops">5 crafts</KV>
              <KV label="Languages">EN · FR · ES · AR</KV>
              <KV label="Booking link">terrariaworkshops.com</KV>
              <KV label="Property URL">{baseUrl.replace(/^https?:\/\//, "")}</KV>
            </div>
          </div>
        </Card>

        {/* What we offer */}
        <Section title="What we offer" icon={Sparkles} brand={brand}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2 pr-3">Workshop</th>
                  <th className="text-left py-2 pr-3">Duration</th>
                  <th className="text-left py-2 pr-3">From</th>
                  <th className="text-left py-2">Best for</th>
                </tr>
              </thead>
              <tbody>
                {WORKSHOPS.map((w) => (
                  <tr key={w.name} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{w.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{w.time}</td>
                    <td className="py-2 pr-3" style={{ color: brand }}>{w.price}</td>
                    <td className="py-2 text-muted-foreground">{w.who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Prices indicative — live prices and availability shown at booking.</p>
        </Section>

        {/* Scripts */}
        <Section title="What to say to guests" icon={MessageCircle} brand={brand}>
          <div className="grid md:grid-cols-3 gap-3">
            {SCRIPTS.map((s) => (
              <div key={s.moment} className="rounded-lg border bg-white p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} style={{ color: brand }} />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.moment}</p>
                </div>
                <p className="text-sm leading-relaxed flex-1">{s.en}</p>
                <Button size="sm" variant="ghost" className="mt-3 self-start print:hidden h-7 px-2 text-xs" onClick={() => copy(s.en)}>
                  <Copy size={11} className="mr-1" /> Copy
                </Button>
              </div>
            ))}
          </div>
        </Section>

        {/* WhatsApp templates */}
        <Section title="WhatsApp templates" icon={MessageCircle} brand={brand}>
          <p className="text-xs text-muted-foreground mb-3">
            Replace [guest name], [workshop], [time] before sending. Language: <span className="font-medium uppercase">{lang}</span>
          </p>
          <div className="space-y-3">
            {Object.entries(WHATSAPP_TEMPLATES).map(([key, langs]) => {
              const text = fillTemplate(langs[lang]);
              return (
                <div key={key} className="rounded-lg border bg-white p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{key === "welcome" ? "Welcome on check-in" : key === "followup" ? "Follow-up with link" : "Day-before reminder"}</p>
                    <Button size="sm" variant="ghost" className="print:hidden h-7 px-2 text-xs" onClick={() => copy(text)}>
                      <Copy size={11} className="mr-1" /> Copy
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" dir={lang === "ar" ? "rtl" : "ltr"}>{text}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* FAQ */}
        <Section title="Quick FAQ" icon={BookOpen} brand={brand}>
          <div className="grid md:grid-cols-2 gap-3">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-lg border bg-white p-4">
                <p className="text-sm font-medium mb-1">{f.q}</p>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Our promise */}
        <Section title="Our promise to your property" icon={CheckCircle2} brand={brand}>
          <ul className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              "Bookings confirmed within 2 hours, 7 days a week",
              "Free cancellation up to 24h before — full refund",
              "Commission tracked automatically via your QR codes",
              "Monthly statement and payout to your property",
              "Bilingual host on every workshop (EN · FR · ES · AR)",
              "If we cancel, your guest is refunded in full, instantly",
            ].map((p) => (
              <li key={p} className="flex gap-2 items-start">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: brand }} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Contact */}
        <Card className="p-5 print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Direct line for staff</p>
              <p className="text-sm">Terraria concierge · <a className="underline" href="mailto:contact.terraria@gmail.com">contact.terraria@gmail.com</a></p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} style={{ color: brand }} />
              <span className="text-muted-foreground">WhatsApp on your concierge dashboard</span>
            </div>
          </div>
        </Card>
      </main>

      <style>{`
        @media print {
          body { background: white !important; }
          @page { margin: 12mm; size: A4; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{children}</p>
    </div>
  );
}

function Section({ title, icon: Icon, brand, children }: { title: string; icon: any; brand: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 print:break-inside-avoid">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-md grid place-items-center text-white" style={{ background: brand }}>
          <Icon size={14} />
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}
