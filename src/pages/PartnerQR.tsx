import { useParams, Link } from "react-router-dom";
import { useHotelPartnerBySlug } from "@/hooks/use-hotel-partners";
import SEOHead from "@/components/SEOHead";
import { QrCode, ArrowRight, Hotel } from "lucide-react";

export default function PartnerQR() {
  const { slug } = useParams<{ slug: string }>();
  const { partner, loading } = useHotelPartnerBySlug(slug);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <Hotel className="w-12 h-12 text-muted-foreground/50" />
        <h1 className="text-2xl font-semibold">Property not found</h1>
        <Link to="/" className="text-primary underline">Back to home</Link>
      </div>
    );
  }

  const landingUrl = `${window.location.origin}/partners/${partner.slug}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(landingUrl)}&color=${partner.brand_color.replace("#", "")}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: `${partner.brand_color}10` }}>
      <SEOHead title={`${partner.name} · Quick check-in`} description={`Scan to book a craft experience at ${partner.name}`} path={`/partners/${partner.slug}/qr`} />

      <div className="max-w-md w-full bg-background rounded-3xl shadow-xl p-8 text-center border border-border/40">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] mb-4" style={{ background: `${partner.brand_color}20`, color: partner.brand_color }}>
          <QrCode size={12} /> Guest check-in
        </div>
        <h1 className="text-2xl font-semibold mb-2">{partner.name}</h1>
        <p className="text-sm text-muted-foreground mb-6">Scan to browse and book craft workshops curated for your stay.</p>

        <div className="mx-auto w-fit p-4 rounded-2xl bg-white border border-border/60">
          <img src={qrSrc} alt={`QR code for ${partner.name}`} width={280} height={280} />
        </div>

        <a href={landingUrl} className="mt-6 inline-flex items-center gap-2 text-sm font-medium" style={{ color: partner.brand_color }}>
          Open landing page <ArrowRight size={14} />
        </a>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">Print this page or display it on a tablet in-room.</p>
    </div>
  );
}
