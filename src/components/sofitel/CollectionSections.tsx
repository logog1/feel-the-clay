import { Palette, Hammer, Grid3x3, Brush, Loader, ChefHat, Sprout, Wine, Languages, Users, Clock, Ban, Boxes, Receipt, QrCode, CalendarCheck, LayoutDashboard, Check, ArrowRight } from "lucide-react";

const P = {
  bg: "#FBFAF6",
  ink: "#0E1418",
  blue: "#5B8AA6",
  blueDeep: "#2E5168",
  sand: "#E6C36B",
  sandSoft: "#F1E2BE",
  terracotta: "#A0522D",
  navy: "#1B2A4E",
  line: "#E8E2D2",
};

const serif = { fontFamily: "'Cormorant Garamond', serif" };

function SectionHeader({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="max-w-3xl mb-10">
      {kicker && (
        <p className="text-[11px] tracking-[0.32em] uppercase mb-4" style={{ color: P.blueDeep }}>
          {kicker}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl leading-[1.1] font-light" style={{ ...serif, color: P.ink }}>
        {title}
      </h2>
      {sub && <p className="mt-4 text-base sm:text-lg opacity-75 leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ---------- 1. The Merger ---------- */
function MergerSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
      <SectionHeader
        kicker="The partnership"
        title="Merging five-star comfort with authentic living heritage"
        sub="Every experience is led by founder and instructor Othmane Errachidy, ensuring a premium, unified standard of excellence for every guest."
      />
      <div className="mt-6 flex items-center justify-center gap-[-2rem] flex-wrap">
        <div
          className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full flex items-center justify-center text-center -mr-6 sm:-mr-10 z-10"
          style={{ background: P.navy, color: "#fff" }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">Sofitel</p>
            <p className="mt-1 text-2xl sm:text-3xl" style={serif}>Five-star comfort</p>
          </div>
        </div>
        <div
          className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full flex items-center justify-center text-center"
          style={{ background: P.terracotta, color: "#fff" }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">Terraria</p>
            <p className="mt-1 text-2xl sm:text-3xl" style={serif}>Living heritage</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. Guest Journey ---------- */
function JourneySection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <SectionHeader kicker="The guest journey" title="From the lobby to the landscape" />
      <div className="grid md:grid-cols-2 gap-5">
        {[
          {
            tag: "Inside the Hotel",
            title: "Soft creative sessions",
            body: "Accessible, relaxing workshops hosted directly within the comfort of the Sofitel grounds.",
            color: P.blueDeep,
          },
          {
            tag: "Outside the Hotel",
            title: "Deep cultural immersions",
            body: "Exclusive small-group excursions into the living heart of Tétouan.",
            color: P.terracotta,
          },
        ].map((c) => (
          <div key={c.tag} className="rounded-3xl bg-white p-7 sm:p-9" style={{ border: `1px solid ${P.line}` }}>
            <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: c.color }}>{c.tag}</p>
            <h3 className="mt-3 text-2xl sm:text-3xl" style={serif}>{c.title}</h3>
            <p className="mt-3 opacity-75 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 3. On-property Menu ---------- */
const ON_PROPERTY = [
  { icon: Hammer, name: "Pottery Handbuilding", price: 300, dur: "2h30–3h", desc: "Shape natural clay by hand into pinch pots, vases, or sculptural forms. Natural or air-dry clay available.", group: "Earth / Form" },
  { icon: Brush, name: "Canvas Painting", price: 280, dur: "2h–2h30", desc: "Guided sessions featuring Moroccan motifs or landscapes using premium acrylics.", group: "Color / Paint" },
  { icon: Grid3x3, name: "Zellij Mosaic Tiles", price: 350, dur: "2h30–3h", desc: "Cut, arrange, and grout a classic 13×13 cm geometric tile. A true piece of living heritage.", group: "Earth / Form" },
  { icon: Palette, name: "Ceramic Painting", price: 280, dur: "2h–2h30", desc: "Paint bespoke motifs onto pre-fired ceramics, ready to display.", group: "Color / Paint" },
];

function MenuSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <SectionHeader kicker="At the resort" title="Creative workshops on the Sofitel grounds" sub="Four hands-on sessions to slow down, create, and leave with something you made yourself." />
      <div className="grid sm:grid-cols-2 gap-4">
        {ON_PROPERTY.map((w) => (
          <article key={w.name} className="rounded-3xl bg-white p-6 flex gap-5" style={{ border: `1px solid ${P.line}` }}>
            <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: P.sandSoft, color: P.terracotta }}>
              <w.icon size={20} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-50">{w.group}</p>
              <h3 className="mt-1 text-xl" style={serif}>{w.name}</h3>
              <p className="mt-2 text-sm opacity-75 leading-relaxed">{w.desc}</p>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="font-medium" style={{ color: P.blueDeep }}>{w.price} MAD <span className="opacity-60 font-normal">/ guest</span></span>
                <span className="opacity-40">·</span>
                <span className="opacity-70 inline-flex items-center gap-1"><Clock size={11} /> {w.dur}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- 4. Rug Weaving Crown Jewel ---------- */
function RugSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <div className="rounded-3xl overflow-hidden grid md:grid-cols-2" style={{ background: P.ink, color: "#fff" }}>
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: P.sand }}>The crown jewel</p>
          <h2 className="mt-4 text-3xl sm:text-4xl leading-tight" style={serif}>The art of the Moroccan rug</h2>
          <p className="mt-4 opacity-80 leading-relaxed">
            An immersive workshop in traditional Moroccan weaving. Guests learn the intricate rhythms of the loom and create
            a tangible connection to generations of Moroccan artisans.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {[
              ["Duration", "2h30 – 3h"],
              ["Capacity", "Max 8 participants"],
              ["Investment", "350 MAD per person"],
              ["Position", "Unparalleled premium resort activity"],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between gap-4 py-2 border-b border-white/10">
                <span className="opacity-60 text-[11px] uppercase tracking-[0.2em]">{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[280px] md:min-h-[440px] flex items-center justify-center" style={{ background: P.terracotta }}>
          <Loader size={120} strokeWidth={0.6} className="opacity-30 absolute" />
          <div className="relative z-10 text-center px-8">
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">Featured</p>
            <p className="mt-3 text-2xl sm:text-3xl" style={serif}>Hand-loom weaving</p>
            <p className="mt-2 text-sm opacity-80">Wool, color, rhythm, memory.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. Outside Experiences ---------- */
const OUTSIDE = [
  { icon: Hammer, name: "Pottery at a Local Cooperative", price: "On request", meta: "Half-day", desc: "A half-day journey into Tétouan's artisan quarter. Guests watch the wheel, shape raw earth alongside local craftsmen, and trace the lifecycle of a pot." },
  { icon: ChefHat, name: "Cooking with a Local Family", price: "On request", meta: "Min 2 · Max 8 guests", desc: "A genuine Tétouan home opens its kitchen. Guests prepare a traditional meal — tagine, couscous, pastilla — and share it with the family." },
  { icon: Sprout, name: "Garden & Plant Experience", price: "250 MAD / person", meta: "2h–2h30 · Group of 10: 2,000 MAD", desc: "A hands-on botanical session. Guests paint a terracotta pot and plant a seedling to create a living souvenir." },
];

function OutsideSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <SectionHeader kicker="Beyond the resort" title="Cultural immersions in the heart of Tetouan" sub="Step out with a small group and meet the artisans, families and gardens behind the craft." />
      <div className="grid md:grid-cols-3 gap-4">
        {OUTSIDE.map((o) => (
          <article key={o.name} className="rounded-3xl bg-white p-7" style={{ border: `1px solid ${P.line}` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: P.sandSoft, color: P.terracotta }}>
              <o.icon size={20} strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 text-xl" style={serif}>{o.name}</h3>
            <p className="mt-3 text-sm opacity-75 leading-relaxed">{o.desc}</p>
            <div className="mt-5 pt-4 border-t flex items-center justify-between text-xs" style={{ borderColor: P.line }}>
              <span className="font-medium" style={{ color: P.blueDeep }}>{o.price}</span>
              <span className="opacity-60">{o.meta}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- 6. Bespoke ---------- */
function BespokeSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <SectionHeader
        kicker="Bespoke curation"
        title="Designing activations tailored to your hotel concepts"
        sub="Beyond our core menu, Terraria acts as your creative partner. We design and execute custom activations that seamlessly integrate with Sofitel's seasonal campaigns, VIP arrivals, or F&B concepts."
      />
      <div className="rounded-3xl p-8 sm:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center" style={{ background: P.sandSoft, border: `1px solid ${P.line}` }}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: P.terracotta }}>Featured concept</p>
          <h3 className="mt-3 text-3xl sm:text-4xl" style={serif}>The "Wine & Clay" Evening</h3>
          <p className="mt-4 opacity-80 leading-relaxed max-w-xl">
            A sophisticated pairing event. We collaborate with Sofitel's sommelier to match premium vintages with a chic,
            adults-only pottery instruction session. A perfect high-end activation for couples or corporate retreats.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em]">
            {["Adults only", "Couples", "Corporate retreats", "F&B partnership"].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-white/70">{t}</span>
            ))}
          </div>
        </div>
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mx-auto" style={{ background: P.ink, color: P.sand }}>
          <Wine size={56} strokeWidth={1} />
        </div>
      </div>
    </section>
  );
}

/* ---------- 7. Advantage ---------- */
function AdvantageSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <SectionHeader kicker="Frictionless partnership" title="The Sofitel advantage: zero operational friction" />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-3xl p-7 sm:p-9" style={{ background: P.terracotta, color: "#fff" }}>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">Terraria's responsibility</p>
          <h3 className="mt-3 text-2xl" style={serif}>We handle everything.</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              "100% of materials sourced, provided, and prepped",
              "Instruction led entirely by Terraria experts",
              "All session cleanup and material management",
            ].map((l) => (
              <li key={l} className="flex gap-3"><Check size={16} className="shrink-0 mt-0.5" /> {l}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl p-7 sm:p-9" style={{ background: P.navy, color: "#fff" }}>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">Sofitel's benefit</p>
          <h3 className="mt-3 text-2xl" style={serif}>You receive the praise.</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              "Zero storage hassle — materials neatly managed on-site by our team",
              "Shared media rights — capture brilliant, organic marketing content",
              "Sofitel receives all the guest praise; Terraria does the heavy lifting",
            ].map((l) => (
              <li key={l} className="flex gap-3"><Check size={16} className="shrink-0 mt-0.5" /> {l}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 8. Digital Ecosystem ---------- */
function EcosystemSection() {
  const steps = [
    { icon: QrCode, title: "Guest Discovery", body: "QR codes placed effortlessly in rooms and at reception. Guests scan to instantly view the weekly program, descriptions, and availability." },
    { icon: CalendarCheck, title: "Live Booking", body: "Guests select their preferred experience, time, and group size, receiving instant digital confirmation." },
    { icon: LayoutDashboard, title: "Hotel Dashboard", body: "Sofitel management accesses a private interface to track weekly availability, monitor upcoming sessions, and adjust group sizes with total visibility." },
  ];
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <SectionHeader kicker="Digital ecosystem" title="Seamless for guests and management" />
      <div className="grid md:grid-cols-3 gap-4 relative">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-3xl bg-white p-7 relative" style={{ border: `1px solid ${P.line}` }}>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: P.ink, color: P.sand }}>
                <s.icon size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-40">Step {i + 1}</span>
            </div>
            <h3 className="mt-5 text-xl" style={serif}>{s.title}</h3>
            <p className="mt-3 text-sm opacity-75 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 9. Standards ---------- */
const STANDARDS = [
  { icon: Languages, title: "Multilingual excellence", body: "All sessions seamlessly instructed in French, English, or Arabic to serve a global clientele." },
  { icon: Users, title: "Minimum attendance", body: "Just 4 guests required for indoor sessions; 2 guests required for outdoor immersions." },
  { icon: Clock, title: "Advanced booking", body: "A simple 24-hour minimum notice via the dashboard or QR code system." },
  { icon: Ban, title: "Flexible cancellation", body: "Completely free before 24 hours. A 30% fee applies only if cancelled under 24 hours." },
  { icon: Boxes, title: "Seamless storage", body: "All necessary materials are discreetly stored on-site at Sofitel for immediate access." },
  { icon: Receipt, title: "Partnership terms", body: "Invoiced per session, with all payment terms open to mutual negotiation." },
];

function StandardsSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <SectionHeader kicker="Standards & logistics" title="Professional standards and flexible logistics" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STANDARDS.map((s) => (
          <div key={s.title} className="rounded-3xl bg-white p-6" style={{ border: `1px solid ${P.line}` }}>
            <s.icon size={20} strokeWidth={1.5} style={{ color: P.blueDeep }} />
            <h3 className="mt-4 text-lg" style={serif}>{s.title}</h3>
            <p className="mt-2 text-sm opacity-75 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 10. CTA ---------- */
function CtaSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20 sm:py-28">
      <div className="rounded-3xl p-10 sm:p-16 text-center" style={{ background: P.ink, color: "#fff" }}>
        <p className="text-[11px] uppercase tracking-[0.32em]" style={{ color: P.sand }}>Sofitel × Terraria</p>
        <h2 className="mt-5 text-4xl sm:text-5xl leading-tight max-w-3xl mx-auto" style={serif}>
          Let's build unforgettable experiences together
        </h2>
        <p className="mt-5 max-w-xl mx-auto opacity-80 leading-relaxed">
          All terms are open to discussion — our goal is a partnership that works for everyone. We look forward to bringing
          authentic Moroccan memory-making to your guests.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="https://wa.me/212650094668" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[0.2em]" style={{ background: P.sand, color: P.ink }}>
            WhatsApp Othmane <ArrowRight size={14} />
          </a>
          <a href="mailto:hello@terrariaworkshops.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium uppercase tracking-[0.2em] border border-white/20">
            Send a brief
          </a>
        </div>
        <p className="mt-8 text-xs opacity-60">
          Errachidy Othmane, Founder & Instructor · +212 650 094 668 · www.terrariaworkshops.com
        </p>
      </div>
    </section>
  );
}

/* ---------- Good to know (guest-facing) ---------- */
const GOOD_TO_KNOW = [
  { icon: Languages, title: "Three languages", body: "Sessions in French, English or Arabic." },
  { icon: Users, title: "Small groups", body: "From 4 guests indoors, 2 guests for outdoor immersions." },
  { icon: Clock, title: "Book ahead", body: "A 24h notice is enough to confirm your spot." },
  { icon: Ban, title: "Free cancellation", body: "Free up to 24h before. A 30% fee applies under 24h." },
  { icon: Boxes, title: "All materials included", body: "Clay, tools, paints, looms, aprons, everything is set up for you." },
  { icon: Check, title: "Take it home", body: "Most pieces are yours to keep, ready the same day or shipped after firing." },
];

function GoodToKnowSection() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24" style={{ borderTop: `1px solid ${P.line}` }}>
      <SectionHeader kicker="Good to know" title="A few things before you book" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GOOD_TO_KNOW.map((s) => (
          <div key={s.title} className="rounded-3xl bg-white p-6" style={{ border: `1px solid ${P.line}` }}>
            <s.icon size={20} strokeWidth={1.5} style={{ color: P.blueDeep }} />
            <h3 className="mt-4 text-lg" style={serif}>{s.title}</h3>
            <p className="mt-2 text-sm opacity-75 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CollectionSections() {
  return (
    <>
      <MenuSection />
      <RugSection />
      <OutsideSection />
      <GoodToKnowSection />
    </>
  );
}

export function CollectionCta() {
  return null;
}
