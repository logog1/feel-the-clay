import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useHotelPartnerBySlug } from "@/hooks/use-hotel-partners";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, QrCode, Calendar, Users, LogIn, ExternalLink, CheckCircle2,
  MessageCircle, Sparkles, ArrowRight, Smartphone, Printer, Wallet, ClipboardList,
  Info, Shield, Clock, Star,
} from "lucide-react";

const brand = "#c2410c";

/**
 * Illustrated onboarding guide for hotel partner staff. Explains — with mock
 * UI screens rather than real screenshots — how each part of the concierge
 * ecosystem works: QR kit, staff kit, landing page, dashboard, bookings,
 * commissions, welcome kits, and support.
 */
export default function PartnerGuide() {
  const { slug } = useParams<{ slug: string }>();
  const { partner } = useHotelPartnerBySlug(slug);
  const partnerName = partner?.name ?? "Your property";
  const partnerSlug = partner?.slug ?? slug ?? "your-hotel";

  return (
    <div className="min-h-screen" style={{ background: "#FBFAF6", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Helmet>
        <title>{partnerName} · Partner Guide</title>
        <meta name="description" content="Step-by-step guide for hotel concierge staff to use the Terraria partner ecosystem." />
      </Helmet>

      {/* Hero */}
      <header className="border-b" style={{ background: `linear-gradient(135deg, ${brand} 0%, #92310a 100%)` }}>
        <div className="max-w-5xl mx-auto px-4 py-10 text-white">
          <Badge className="bg-white/20 text-white border-0 hover:bg-white/25">Concierge handbook</Badge>
          <h1 className="text-3xl md:text-4xl font-semibold mt-3 tracking-tight">How the partnership works</h1>
          <p className="mt-2 text-white/85 max-w-2xl">
            A visual walk-through of every tool you have as a Terraria partner — the QR cards, the staff kit,
            the concierge dashboard and how commissions are tracked. About 5 minutes to read.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Button size="sm" variant="secondary" asChild>
              <Link to={`/partners/${partnerSlug}/concierge`}><LogIn size={14} className="mr-1" /> Open dashboard</Link>
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white" asChild>
              <Link to={`/partners/${partnerSlug}/kit`} target="_blank"><BookOpen size={14} className="mr-1" /> Staff kit</Link>
            </Button>
            <Button size="sm" variant="outline" className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white" asChild>
              <Link to={`/partners/${partnerSlug}/qr`} target="_blank"><QrCode size={14} className="mr-1" /> QR kit</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-14">
        {/* Table of contents */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">In this guide</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {[
              ["1. The big picture", "big-picture"],
              ["2. QR cards in rooms", "qr"],
              ["3. The staff kit", "kit"],
              ["4. Sending a guest to book", "guest"],
              ["5. Your dashboard", "dashboard"],
              ["6. Commissions", "commissions"],
              ["7. Welcome kits", "welcome-kits"],
              ["8. Everyday scenarios", "scenarios"],
              ["9. Help & contacts", "help"],
            ].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:border-orange-300 transition">
                <ArrowRight size={12} className="text-orange-600" /> {label}
              </a>
            ))}
          </div>
        </section>

        {/* 1. Big picture */}
        <Section id="big-picture" step="01" title="The big picture" icon={<Sparkles size={18} />}>
          <p>
            Guests discover our workshops through <b>three doors</b>: a QR card in their room, a recommendation from
            your front desk, or a printed page in the staff kit. Every door is tagged with {partnerName}, so any
            booking that follows is automatically attributed to you and earns commission.
          </p>
          <div className="grid md:grid-cols-3 gap-3 mt-5">
            <MiniCard icon={<QrCode size={18} />} title="Room QR" text="Placed in-room. Guest scans, books directly." />
            <MiniCard icon={<Users size={18} />} title="Front desk" text="Staff recommend, then book on the guest's behalf." />
            <MiniCard icon={<BookOpen size={18} />} title="Printed kit" text="A one-pager they take with them." />
          </div>
        </Section>

        {/* 2. QR */}
        <Section id="qr" step="02" title="QR cards in the rooms" icon={<QrCode size={18} />}>
          <p>
            Every room gets a small tent card with a QR code. Scanning it opens your branded landing page on the
            guest's phone. Nothing to install, nothing to log in.
          </p>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            {/* Mock QR card */}
            <MockFrame label="Room card (front)">
              <div className="p-6 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Curated by {partnerName}</p>
                <h4 className="font-serif text-xl mt-1 mb-3">Craft your Morocco</h4>
                <div className="mx-auto w-28 h-28 rounded-lg grid place-items-center" style={{ background: "repeating-conic-gradient(#111 0deg 12deg, #fff 12deg 24deg)" }}>
                  <div className="w-24 h-24 bg-white/95 rounded-md" />
                </div>
                <p className="text-xs text-muted-foreground mt-3">Scan to reserve a pottery or zellige workshop</p>
                <p className="text-[10px] mt-2 text-orange-700 font-medium">terraria.ma/partners/{partnerSlug}</p>
              </div>
            </MockFrame>

            {/* Mock phone landing */}
            <MockPhone>
              <div className="h-8 flex items-center px-2 text-[9px] text-muted-foreground border-b">
                <span className="w-2 h-2 rounded-full bg-red-400 mr-1" />
                <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1" />
                <span className="w-2 h-2 rounded-full bg-green-400 mr-1" />
                <span className="ml-2 truncate">terraria.ma/partners/{partnerSlug}</span>
              </div>
              <div className="p-3">
                <p className="text-[9px] uppercase tracking-widest text-orange-700">Guests of {partnerName}</p>
                <h4 className="font-semibold text-sm mt-1">Traditional Moroccan workshops</h4>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <div className="aspect-square rounded bg-orange-100" />
                  <div className="aspect-square rounded bg-amber-100" />
                  <div className="aspect-square rounded bg-stone-200" />
                  <div className="aspect-square rounded bg-rose-100" />
                </div>
                <button className="mt-2 w-full text-[10px] text-white rounded py-1.5" style={{ background: brand }}>Book a workshop</button>
              </div>
            </MockPhone>
          </div>

          <Callout icon={<Info size={14} />}>
            Need more cards, or replacements? Order them from the <b>Welcome kit</b> section of your dashboard.
          </Callout>
        </Section>

        {/* 3. Staff kit */}
        <Section id="kit" step="03" title="The staff kit" icon={<BookOpen size={18} />}>
          <p>
            The staff kit is a printable page for the concierge desk. It has the workshop menu, prices, timings, and
            a bigger QR the guest can scan while you talk to them.
          </p>
          <MockFrame label="Front-desk kit (printable A4)">
            <div className="p-5 grid grid-cols-3 gap-3 text-[10px]">
              <div className="col-span-2">
                <p className="uppercase tracking-widest text-muted-foreground text-[8px]">{partnerName} × Terraria</p>
                <h4 className="font-serif text-base mt-0.5">Recommend a workshop in one sentence</h4>
                <div className="mt-2 space-y-1">
                  {["Pottery — 2h · 550 MAD", "Zellige mosaic — 3h · 750 MAD", "Weaving — 2h · 500 MAD", "Embroidery — 90 min · 400 MAD"].map((l) => (
                    <div key={l} className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-orange-600" /> {l}</div>
                  ))}
                </div>
                <p className="mt-2 text-muted-foreground">Pickup from lobby · English/French/Spanish · Small groups</p>
              </div>
              <div className="border-l pl-3 text-center">
                <div className="w-16 h-16 mx-auto rounded" style={{ background: "repeating-conic-gradient(#111 0deg 12deg, #fff 12deg 24deg)" }} />
                <p className="mt-1 text-[8px] text-muted-foreground">Scan to book</p>
              </div>
            </div>
          </MockFrame>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild><Link to={`/partners/${partnerSlug}/kit`} target="_blank"><Printer size={12} className="mr-1" /> Open printable kit</Link></Button>
          </div>
        </Section>

        {/* 4. Sending a guest */}
        <Section id="guest" step="04" title="Sending a guest to book" icon={<Users size={18} />}>
          <p>Two ways, both count as your booking:</p>
          <div className="grid md:grid-cols-2 gap-3">
            <StepCard n="A" title="Guest books themselves">
              <ol className="list-decimal ml-4 space-y-1 text-sm">
                <li>Guest scans the QR (room or kit).</li>
                <li>They choose date and workshop.</li>
                <li>They pay online or on-site.</li>
                <li>You see it appear in your dashboard within seconds.</li>
              </ol>
            </StepCard>
            <StepCard n="B" title="You book for them">
              <ol className="list-decimal ml-4 space-y-1 text-sm">
                <li>Open your <Link to={`/partners/${partnerSlug}/concierge`} className="underline">concierge dashboard</Link>.</li>
                <li>Pick a workshop and slot.</li>
                <li>Enter guest name + room number.</li>
                <li>Confirm — we'll message the guest with details.</li>
              </ol>
            </StepCard>
          </div>
        </Section>

        {/* 5. Dashboard */}
        <Section id="dashboard" step="05" title="Your concierge dashboard" icon={<Calendar size={18} />}>
          <p>Where you spend most of your time. Live view of experiences, bookings, and commissions.</p>

          <MockFrame label="Concierge dashboard">
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: "Experiences", v: "12" },
                  { l: "Total bookings", v: "38" },
                  { l: "Active", v: "6", c: brand },
                  { l: "Pending review", v: "2", c: "#d97706" },
                ].map((s) => (
                  <div key={s.l} className="border rounded-lg p-2 bg-white">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.l}</p>
                    <p className="text-lg font-semibold" style={{ color: s.c ?? "inherit" }}>{s.v}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1">
                {["Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14", "Sat 15", "Sun 16"].map((d, i) => (
                  <button key={d} className={`text-[10px] px-2 py-1 rounded whitespace-nowrap ${i === 2 ? "text-white" : "bg-white border"}`} style={i === 2 ? { background: brand } : {}}>{d}</button>
                ))}
              </div>

              <div className="border rounded-lg divide-y bg-white">
                {[
                  { t: "Pottery workshop", g: "M. Dupont · Room 214", s: "Confirmed", c: "text-green-700 bg-green-50" },
                  { t: "Zellige mosaic", g: "S. Alvarez · Room 302", s: "Pending", c: "text-amber-700 bg-amber-50" },
                  { t: "Weaving intro", g: "J. Chen · Room 118", s: "Completed", c: "text-blue-700 bg-blue-50" },
                ].map((r) => (
                  <div key={r.g} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div>
                      <p className="font-medium">{r.t}</p>
                      <p className="text-muted-foreground">{r.g}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${r.c}`}>{r.s}</span>
                  </div>
                ))}
              </div>
            </div>
          </MockFrame>

          <div className="grid md:grid-cols-3 gap-3 mt-2">
            <MiniCard icon={<Clock size={16} />} title="Live" text="New bookings show up automatically every 30 seconds." />
            <MiniCard icon={<ClipboardList size={16} />} title="Weekly view" text="Tap any day to see slots and remaining seats." />
            <MiniCard icon={<Star size={16} />} title="Analytics" text="See scans, conversion, and top rooms at a glance." />
          </div>
        </Section>

        {/* 6. Commissions */}
        <Section id="commissions" step="06" title="Commissions" icon={<Wallet size={18} />}>
          <p>You earn a percentage of every completed booking attributed to {partnerName}.</p>
          <MockFrame label="Booking with commission">
            <div className="p-4 text-xs space-y-2">
              <div className="flex justify-between"><span>Pottery — 2 guests</span><span>1 100 MAD</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Commission (15%)</span><span>165 MAD</span></div>
              <div className="border-t pt-2 flex justify-between font-semibold" style={{ color: brand }}><span>Owed to {partnerName}</span><span>165 MAD</span></div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid monthly</Badge>
            </div>
          </MockFrame>
          <ul className="text-sm list-disc ml-5 space-y-1">
            <li>A booking becomes <b>billable</b> once the workshop is completed.</li>
            <li>Cancellations don't count.</li>
            <li>You'll receive a monthly statement by email.</li>
          </ul>
        </Section>

        {/* 7. Welcome kits */}
        <Section id="welcome-kits" step="07" title="Reordering welcome kits" icon={<Printer size={18} />}>
          <p>Running low on room cards or brochures? Order more directly from the dashboard.</p>
          <MockFrame label="Welcome kit order form">
            <div className="p-4 grid grid-cols-3 gap-2 text-xs items-end">
              <div><p className="text-[10px] uppercase text-muted-foreground">Kit type</p><div className="border rounded h-8 px-2 flex items-center bg-white">Welcome kit</div></div>
              <div><p className="text-[10px] uppercase text-muted-foreground">Quantity</p><div className="border rounded h-8 px-2 flex items-center bg-white">50</div></div>
              <button className="h-8 rounded text-white text-[11px]" style={{ background: brand }}>Request kit</button>
            </div>
          </MockFrame>
          <p className="text-sm text-muted-foreground">We ship within 3–5 business days. You'll see tracking in the same table.</p>
        </Section>

        {/* 8. Scenarios */}
        <Section id="scenarios" step="08" title="Everyday scenarios" icon={<Smartphone size={18} />}>
          <div className="space-y-3">
            <Scenario q="A guest asks 'what's authentic to do around here?' at check-in">
              Show them the staff kit page, mention the closest workshop day, and offer to book it now. Takes 30 seconds.
            </Scenario>
            <Scenario q="A guest already booked and asks for directions">
              Open their booking in the dashboard — the pickup point and time are shown. Our driver is on WhatsApp too.
            </Scenario>
            <Scenario q="Guest wants to change the date">
              Cancel the current booking and rebook the new date. Commissions follow the new (completed) booking.
            </Scenario>
            <Scenario q="Room card is damaged">
              Order replacement cards from the Welcome kit section. Free of charge.
            </Scenario>
          </div>
        </Section>

        {/* 9. Help */}
        <Section id="help" step="09" title="Help & contacts" icon={<Shield size={18} />}>
          <div className="grid md:grid-cols-2 gap-3">
            <MiniCard icon={<MessageCircle size={16} />} title="WhatsApp support" text="Fastest channel — same-day answers, seven days a week." />
            <MiniCard icon={<ExternalLink size={16} />} title="Partner terms" text={<>Review the agreement any time · <Link to="/partners/terms" className="underline">Read →</Link></>} />
          </div>
          <p className="text-sm text-muted-foreground">
            That's the whole system. Bookmark this page — we update it as new features arrive.
          </p>
          <div className="flex gap-2">
            <Button size="sm" asChild style={{ background: brand }}>
              <Link to={`/partners/${partnerSlug}/concierge`}><LogIn size={14} className="mr-1" /> Back to dashboard</Link>
            </Button>
          </div>
        </Section>
      </main>
    </div>
  );
}

/* ---------- Little presentational primitives ---------- */

function Section({ id, step, title, icon, children }: { id: string; step: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center text-white" style={{ background: brand }}>{icon}</div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Step {step}</p>
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function MiniCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: React.ReactNode }) {
  return (
    <Card className="p-4 bg-white border">
      <div className="flex items-center gap-2 text-orange-700">{icon}<p className="font-medium text-sm">{title}</p></div>
      <p className="text-sm text-muted-foreground mt-1">{text}</p>
    </Card>
  );
}

function StepCard({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 bg-white border">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full grid place-items-center text-white text-xs font-semibold" style={{ background: brand }}>{n}</span>
        <p className="font-medium">{title}</p>
      </div>
      {children}
    </Card>
  );
}

function MockFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
        <div className="h-7 bg-stone-50 border-b flex items-center px-3 gap-1">
          <span className="w-2 h-2 rounded-full bg-red-300" />
          <span className="w-2 h-2 rounded-full bg-yellow-300" />
          <span className="w-2 h-2 rounded-full bg-green-300" />
          <span className="ml-2 text-[10px] text-muted-foreground">{label}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function MockPhone({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto rounded-[24px] border-4 border-stone-800 bg-white overflow-hidden shadow-lg w-[220px]">
      {children}
    </div>
  );
}

function Callout({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-sm">
      <span className="text-orange-700 mt-0.5">{icon}</span>
      <p className="text-orange-900">{children}</p>
    </div>
  );
}

function Scenario({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 bg-white border">
      <p className="font-medium text-sm">{q}</p>
      <p className="text-sm text-muted-foreground mt-1">{children}</p>
    </Card>
  );
}
