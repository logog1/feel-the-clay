import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Clock, Percent, RotateCcw, Sparkles, FileText, Printer, ArrowLeft } from "lucide-react";

const UPDATED = "June 2026";
const VERSION = "v1.0";

export default function PartnerTerms() {
  const print = () => window.print();
  return (
    <div className="min-h-screen" style={{ background: "hsl(25 60% 92%)", fontFamily: "Rubik, system-ui, sans-serif" }}>
      <Helmet>
        <title>Partnership Terms & SLA · Terraria Workshops</title>
        <meta name="description" content="Service-level agreement and partnership terms for hotels and riads working with Terraria Workshops in Morocco." />
        <link rel="canonical" href="https://terrariaworkshops.com/partners/terms" />
      </Helmet>

      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Terraria Workshops
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">{VERSION} · Updated {UPDATED}</span>
            <Button size="sm" variant="outline" onClick={print} className="print:hidden">
              <Printer size={12} className="mr-1" /> Print / Save PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10 space-y-8">
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-[#c4654a] font-semibold">For hotels & riads</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Partnership Terms & Service Level Agreement</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            These terms describe how Terraria Workshops works with partner properties to offer authentic Moroccan
            craft experiences to your guests. This page is maintained by the Terraria team and may be updated
            as the program evolves; the version your property signed remains in effect until a new one is countersigned.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SLA icon={<Clock size={18} />} title="Confirmation SLA" body="Bookings created through your concierge dashboard or QR portals are confirmed within 2 hours during opening hours (9:00–19:00, Mon–Sat). Outside hours, by 10:00 the next day." />
          <SLA icon={<ShieldCheck size={18} />} title="Quality guarantee" body="If a guest is dissatisfied with the experience, we offer a full refund or a complimentary re-booking. The partner is never charged back commission on refunded bookings." />
          <SLA icon={<Percent size={18} />} title="Commission" body="Standard commission is 15% of the gross session price for bookings attributed to your property via QR variant, concierge dashboard, or unique booking link." />
          <SLA icon={<RotateCcw size={18} />} title="Cancellation" body="Guests may cancel free of charge up to 24 hours before the session. Within 24 hours, no commission is owed and no refund is due unless we cancel." />
        </div>

        <Section n="1" title="Scope">
          <p>This agreement is between <b>Terraria Workshops</b> (workshop operator) and the partner property
          (hotel, riad, guesthouse) named on the signed cover page. It governs the booking, attribution, payout,
          and service standards for craft experiences offered to the property's guests.</p>
        </Section>

        <Section n="2" title="Booking channels">
          <ul className="list-disc pl-5 space-y-1">
            <li>Public partner landing page at <code className="text-xs">/your-slug</code> — short, indexable, property-branded booking flow.</li>
            <li>Concierge dashboard ( <code className="text-xs">/partners/your-slug/concierge</code> ) — staff create bookings on behalf of guests.</li>
            <li>QR variants printed per room or per staff member, linking to the public landing page.</li>
          </ul>
          <p className="mt-2">All bookings made through these channels are automatically attributed to the partner for commission.</p>
        </Section>

        <Section n="3" title="Confirmation & service level">
          <ul className="list-disc pl-5 space-y-1">
            <li>Bookings are reviewed and confirmed within <b>2 hours</b> during opening hours.</li>
            <li>If we cannot honor a requested slot, we propose at least two alternatives within 1 hour.</li>
            <li>Workshops run with a maximum capacity per session; partners can see remaining capacity live.</li>
            <li>Guests receive a confirmation email and a WhatsApp reminder 24 hours before the session.</li>
          </ul>
        </Section>

        <Section n="4" title="Commission, invoicing & payout">
          <ul className="list-disc pl-5 space-y-1">
            <li>Commission is calculated on the gross session price (excluding optional add-ons paid directly to artisans).</li>
            <li>Commission accrues when a booking is marked <b>Completed</b> by the workshop facilitator.</li>
            <li>A monthly statement (CSV + PDF) is generated in the concierge dashboard within the first 5 business days of the following month.</li>
            <li>Payouts are made by bank transfer or in cash within <b>15 days</b> of the statement date.</li>
            <li>Refunded or no-show bookings do not generate commission.</li>
          </ul>
        </Section>

        <Section n="5" title="Cancellations & refunds">
          <ul className="list-disc pl-5 space-y-1">
            <li>Guests: free cancellation up to 24h before the session; within 24h, the session is non-refundable except in case of illness or force majeure.</li>
            <li>Workshop: in the rare case we must cancel, the guest is offered a full refund or a re-booking on any other available date.</li>
            <li>Partner: commission follows the guest outcome — paid on completion, voided on refund.</li>
          </ul>
        </Section>

        <Section n="6" title="Quality & guest experience">
          <p>Each workshop is led by a trained Terraria facilitator working alongside the artisan. We commit to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Welcoming the guest by name within 5 minutes of arrival.</li>
            <li>Providing all materials, aprons, refreshments, and take-home pieces included in the session price.</li>
            <li>Operating in English, French, Spanish, or Arabic on request.</li>
            <li>Collecting feedback after each session and sharing aggregate ratings with the partner monthly.</li>
          </ul>
        </Section>

        <Section n="7" title="Brand & marketing">
          <ul className="list-disc pl-5 space-y-1">
            <li>The partner authorizes Terraria to display the property name and logo on the partner landing page and the public partner list, unless opted out in writing.</li>
            <li>Terraria authorizes the partner to use the Terraria name, logo, and approved photography in concierge materials, in-room collateral, and the property's own marketing.</li>
            <li>Neither party will run paid advertising on the other's brand keywords without written consent.</li>
          </ul>
        </Section>

        <Section n="8" title="Data & privacy">
          <p>Guest contact details collected through the partner channels are processed by Terraria solely to deliver
          the booked experience and to share feedback summaries. They are not used for unrelated marketing without
          the guest's explicit consent. The partner remains the controller for any guest data it collects directly
          on its own systems. See the <Link to="/privacy" className="underline">Terraria privacy policy</Link> for details.</p>
        </Section>

        <Section n="9" title="Term & termination">
          <p>Either party may terminate this partnership with 30 days' written notice. Bookings already confirmed
          at the termination date are honored and any pending commission is paid on the next monthly cycle.</p>
        </Section>

        <Section n="10" title="Contact">
          <p>
            Partnerships: <a href="mailto:partners@terrariaworkshops.com" className="underline">partners@terrariaworkshops.com</a><br/>
            Operations & SLA: <a href="mailto:hello@terrariaworkshops.com" className="underline">hello@terrariaworkshops.com</a><br/>
            WhatsApp: <a href="https://wa.me/212600000000" className="underline">+212 6 00 00 00 00</a>
          </p>
        </Section>

        <Card className="p-6 bg-white">
          <div className="flex items-start gap-3">
            <Sparkles className="text-[#c4654a] shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Ready to countersign?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Print this page or save it as a PDF, then sign and return the cover page provided by the
                Terraria partnerships team. Once we receive it, we activate your concierge dashboard, QR variants,
                and staff kit the same day.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={print} style={{ background: "#c4654a" }} className="text-white">
                  <FileText size={14} className="mr-1.5" /> Print / Save PDF
                </Button>
                <Button asChild variant="outline">
                  <a href="mailto:partners@terrariaworkshops.com?subject=Partnership%20countersign">Email partnerships team</a>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <p className="text-[11px] text-muted-foreground text-center pt-4">
          {VERSION} · Last updated {UPDATED}. This page is editable content maintained by the Terraria team
          and is not a legal opinion or certification.
        </p>
      </main>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border p-5 md:p-6">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-[11px] font-semibold text-[#c4654a]">{n}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="text-sm text-foreground/80 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function SLA({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card className="p-4 bg-white">
      <div className="flex items-center gap-2 text-[#c4654a]">{icon}<span className="font-semibold text-sm text-foreground">{title}</span></div>
      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
    </Card>
  );
}
