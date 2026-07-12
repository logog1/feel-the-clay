import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Image as ImageIcon } from "lucide-react";

type PartnerLike = {
  name: string;
  slug: string;
  brand_color?: string | null;
  logo_url?: string | null;
};

export function PartnerQRDialog({
  open,
  onOpenChange,
  partner,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  partner: PartnerLike | null;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const brand = partner?.brand_color || "#0E1418";
  // Always encode the canonical production URL in QR codes so printed posters
  // keep working even when the admin generates them from preview / lovable.app.
  const PUBLIC_ORIGIN = "https://www.terrariaworkshops.com";
  const url = partner
    ? `${PUBLIC_ORIGIN}/${partner.slug}`
    : "";

  useEffect(() => {
    if (!open || !partner) return;
    QRCode.toDataURL(url, {
      margin: 1,
      width: 800,
      color: { dark: "#0E1418", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [open, url, partner]);

  const downloadQrOnly = () => {
    if (!qrDataUrl || !partner) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${partner.slug}-qr.png`;
    a.click();
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const downloadFullDesign = async () => {
    if (!qrDataUrl || !partner) return;
    setBusy(true);
    try {
      const W = 1200;
      const H = 1600;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);

      // Brand top bar
      ctx.fillStyle = brand;
      ctx.fillRect(0, 0, W, 24);

      // Logo (top center) or brand initials
      let headerY = 140;
      if (partner.logo_url) {
        try {
          const logo = await loadImage(partner.logo_url);
          const maxH = 140;
          const ratio = logo.width / logo.height;
          const h = Math.min(maxH, logo.height);
          const w = h * ratio;
          ctx.drawImage(logo, (W - w) / 2, 90, w, h);
          headerY = 90 + h + 40;
        } catch {
          /* ignore */
        }
      } else {
        ctx.fillStyle = brand;
        ctx.font = "bold 72px system-ui, -apple-system, Segoe UI, Roboto";
        ctx.textAlign = "center";
        ctx.fillText(partner.name, W / 2, 170);
        headerY = 220;
      }

      // Name
      ctx.fillStyle = "#0E1418";
      ctx.font = "600 48px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.textAlign = "center";
      ctx.fillText(partner.name, W / 2, headerY);

      // Kicker
      ctx.fillStyle = "#8A8A8A";
      ctx.font = "500 22px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("SCAN TO DISCOVER OUR CRAFT EXPERIENCES", W / 2, headerY + 42);

      // QR panel
      const qrSize = 780;
      const qrX = (W - qrSize) / 2;
      const qrY = headerY + 90;
      // Rounded background
      const pad = 40;
      const bgX = qrX - pad;
      const bgY = qrY - pad;
      const bgW = qrSize + pad * 2;
      const bgH = qrSize + pad * 2;
      const r = 32;
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#E8E4DB";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bgX + r, bgY);
      ctx.arcTo(bgX + bgW, bgY, bgX + bgW, bgY + bgH, r);
      ctx.arcTo(bgX + bgW, bgY + bgH, bgX, bgY + bgH, r);
      ctx.arcTo(bgX, bgY + bgH, bgX, bgY, r);
      ctx.arcTo(bgX, bgY, bgX + bgW, bgY, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const qrImg = await loadImage(qrDataUrl);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Footer tagline
      ctx.fillStyle = "#0E1418";
      ctx.font = "500 30px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.textAlign = "center";
      ctx.fillText("Authentic Moroccan craft workshops", W / 2, qrY + qrSize + 110);

      ctx.fillStyle = brand;
      ctx.font = "600 24px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(url.replace(/^https?:\/\//, ""), W / 2, qrY + qrSize + 150);

      // Brand bottom bar
      ctx.fillStyle = brand;
      ctx.fillRect(0, H - 24, W, 24);

      const png = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = `${partner.slug}-qr-poster.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  if (!partner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{partner.name} · QR code</DialogTitle>
        </DialogHeader>

        <div ref={cardRef} className="rounded-2xl border bg-white overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: brand }} />
          <div className="p-6 flex flex-col items-center text-center">
            {partner.logo_url ? (
              <img src={partner.logo_url} alt="" className="h-10 object-contain mb-2" />
            ) : null}
            <h3 className="font-semibold text-base">{partner.name}</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1 mb-4">
              Scan to discover our craft experiences
            </p>
            <div className="p-3 rounded-xl border bg-white">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR" className="w-56 h-56 block" />
              ) : (
                <div className="w-56 h-56 grid place-items-center">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 break-all">
              {url.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" onClick={downloadQrOnly} disabled={!qrDataUrl}>
            <Download size={14} className="mr-1.5" /> QR only
          </Button>
          <Button onClick={downloadFullDesign} disabled={!qrDataUrl || busy} style={{ background: brand }}>
            {busy ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <ImageIcon size={14} className="mr-1.5" />}
            Full design
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
