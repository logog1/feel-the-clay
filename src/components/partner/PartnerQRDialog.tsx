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

const PUBLIC_ORIGIN = "https://www.terrariaworkshops.com";

/** Load a Google font into the document so canvas can use it. */
async function ensureFont(family: string, weight: number, url: string) {
  try {
    const face = new FontFace(family, `url(${url})`, { weight: String(weight), style: "normal" });
    await face.load();
    (document as any).fonts.add(face);
  } catch {
    /* ignore, canvas will fall back */
  }
}

/** Draw a rounded rect path. */
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Eight-point Moroccan star (khatam) outline. */
function drawKhatam(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI / 8) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.46;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

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
  const url = partner ? `${PUBLIC_ORIGIN}/${partner.slug}` : "";

  useEffect(() => {
    if (!open || !partner) return;
    QRCode.toDataURL(url, {
      margin: 1,
      width: 900,
      color: { dark: "#0E1418", light: "#00000000" }, // transparent so poster paper shows through
      errorCorrectionLevel: "H",
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [open, url, partner]);

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const downloadQrOnly = () => {
    if (!qrDataUrl || !partner) return;
    // For "QR only" export we want an opaque white background — regenerate.
    QRCode.toDataURL(url, {
      margin: 2,
      width: 1200,
      color: { dark: "#0E1418", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    }).then((data) => {
      const a = document.createElement("a");
      a.href = data;
      a.download = `${partner.slug}-qr.png`;
      a.click();
    });
  };

  const downloadFullDesign = async () => {
    if (!qrDataUrl || !partner) return;
    setBusy(true);
    try {
      // Load elegant fonts (Cormorant Garamond for display, Inter for labels)
      await Promise.all([
        ensureFont("PosterSerif", 500, "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff2"),
        ensureFont("PosterSerif", 300, "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYrEPjuw.woff2"),
        ensureFont("PosterSans", 500, "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2"),
        ensureFont("PosterSans", 400, "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2"),
      ]);

      const W = 1240;
      const H = 1754; // A4 @ ~150dpi
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // --- Paper background (warm off-white with subtle vertical gradient) ---
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#FBF7EF");
      bg.addColorStop(1, "#F4EEE1");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // --- Corner khatam ornaments (very subtle brand tint) ---
      ctx.save();
      ctx.fillStyle = brand;
      ctx.globalAlpha = 0.06;
      drawKhatam(ctx, 130, 130, 180);
      ctx.fill();
      drawKhatam(ctx, W - 130, H - 130, 180);
      ctx.fill();
      ctx.restore();

      // --- Editorial hairline border ---
      ctx.save();
      ctx.strokeStyle = brand;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(48, 48, W - 96, H - 96);
      ctx.globalAlpha = 0.15;
      ctx.strokeRect(64, 64, W - 128, H - 128);
      ctx.restore();

      // --- Eyebrow ---
      ctx.fillStyle = brand;
      ctx.textAlign = "center";
      ctx.font = "500 20px PosterSans, system-ui, -apple-system, Segoe UI, Roboto";
      const eyebrow = "· PARTNER  ·  TERRARIA WORKSHOPS ·";
      const spaced = eyebrow.split("").join("\u2009"); // hair-space letter-spacing
      ctx.fillText(spaced, W / 2, 170);

      // --- Small logo or khatam mark ---
      let markBottomY = 210;
      if (partner.logo_url) {
        try {
          const logo = await loadImage(partner.logo_url);
          const maxH = 110;
          const ratio = logo.width / logo.height;
          const h = Math.min(maxH, logo.height);
          const w = h * ratio;
          ctx.drawImage(logo, (W - w) / 2, markBottomY, w, h);
          markBottomY += h + 20;
        } catch {
          /* ignore */
        }
      } else {
        ctx.save();
        ctx.fillStyle = brand;
        drawKhatam(ctx, W / 2, markBottomY + 40, 34);
        ctx.fill();
        ctx.restore();
        markBottomY += 90;
      }

      // --- Partner name (display serif, restrained) ---
      ctx.fillStyle = "#141210";
      ctx.textAlign = "center";
      ctx.font = "500 88px PosterSerif, 'Cormorant Garamond', Georgia, serif";
      const nameY = markBottomY + 90;
      ctx.fillText(partner.name, W / 2, nameY);

      // --- Thin divider with center dot ---
      const divY = nameY + 60;
      ctx.save();
      ctx.strokeStyle = brand;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 220, divY);
      ctx.lineTo(W / 2 - 18, divY);
      ctx.moveTo(W / 2 + 18, divY);
      ctx.lineTo(W / 2 + 220, divY);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = brand;
      ctx.beginPath();
      ctx.arc(W / 2, divY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- Instruction line ---
      ctx.fillStyle = "#5C554C";
      ctx.font = "400 26px PosterSans, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scan to discover authentic Moroccan craft workshops", W / 2, divY + 44);

      // --- QR panel: framed with brand corner brackets, no full border ---
      const qrSize = 720;
      const pad = 56;
      const panelW = qrSize + pad * 2;
      const panelH = qrSize + pad * 2;
      const panelX = (W - panelW) / 2;
      const panelY = divY + 110;

      // soft shadow
      ctx.save();
      ctx.shadowColor = "rgba(20, 15, 10, 0.14)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 18;
      ctx.fillStyle = "#FFFFFF";
      roundedRect(ctx, panelX, panelY, panelW, panelH, 24);
      ctx.fill();
      ctx.restore();

      // brand corner brackets
      const bracket = 46;
      const bx = panelX;
      const by = panelY;
      ctx.strokeStyle = brand;
      ctx.lineWidth = 4;
      ctx.lineCap = "square";
      const drawBracket = (x: number, y: number, dx: number, dy: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * bracket);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * bracket, y);
        ctx.stroke();
      };
      drawBracket(bx + 12, by + 12, 1, 1);
      drawBracket(bx + panelW - 12, by + 12, -1, 1);
      drawBracket(bx + 12, by + panelH - 12, 1, -1);
      drawBracket(bx + panelW - 12, by + panelH - 12, -1, -1);

      // QR
      const qrImg = await loadImage(qrDataUrl);
      ctx.drawImage(qrImg, panelX + pad, panelY + pad, qrSize, qrSize);

      // --- Footer ---
      const footerY = panelY + panelH + 90;

      // URL as pill
      const urlText = url.replace(/^https?:\/\//, "");
      ctx.font = "500 30px PosterSans, system-ui, sans-serif";
      const urlW = ctx.measureText(urlText).width + 64;
      const urlH = 60;
      const urlX = (W - urlW) / 2;
      ctx.save();
      ctx.fillStyle = brand;
      roundedRect(ctx, urlX, footerY, urlW, urlH, urlH / 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(urlText, W / 2, footerY + urlH / 2 + 1);
      ctx.restore();
      ctx.textBaseline = "alphabetic";

      // Tagline
      ctx.fillStyle = "#8A8378";
      ctx.font = "400 20px PosterSans, system-ui, sans-serif";
      ctx.textAlign = "center";
      const tagY = footerY + urlH + 54;
      ctx.fillText("POTTERY   ·   ZELLIGE   ·   WEAVING   ·   TÉTOUAN, MOROCCO", W / 2, tagY);

      // Signature at very bottom
      ctx.fillStyle = brand;
      ctx.font = "500 italic 22px PosterSerif, 'Cormorant Garamond', Georgia, serif";
      ctx.fillText("Terraria · handmade in Morocco", W / 2, H - 110);

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
          <DialogTitle>{partner.name} · QR poster</DialogTitle>
        </DialogHeader>

        {/* Preview card mirrors the printed poster's spirit */}
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: "linear-gradient(180deg, #FBF7EF 0%, #F4EEE1 100%)",
          }}
        >
          {/* hairline frames */}
          <div
            className="absolute inset-3 rounded-xl pointer-events-none"
            style={{ border: `1px solid ${brand}`, opacity: 0.28 }}
          />
          <div
            className="absolute inset-5 rounded-lg pointer-events-none"
            style={{ border: `1px solid ${brand}`, opacity: 0.12 }}
          />

          <div className="p-7 flex flex-col items-center text-center relative">
            <p
              className="text-[10px] tracking-[0.28em] font-medium"
              style={{ color: brand }}
            >
              · PARTNER · TERRARIA ·
            </p>

            {partner.logo_url ? (
              <img src={partner.logo_url} alt="" className="h-9 object-contain mt-4" />
            ) : (
              <svg viewBox="-50 -50 100 100" className="w-8 h-8 mt-4" fill={brand}>
                <polygon
                  points={Array.from({ length: 16 }, (_, i) => {
                    const a = (Math.PI / 8) * i - Math.PI / 2;
                    const r = i % 2 === 0 ? 40 : 18;
                    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
                  }).join(" ")}
                />
              </svg>
            )}

            <h3
              className="mt-5 text-3xl leading-none"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}
            >
              {partner.name}
            </h3>

            <div className="flex items-center gap-2 my-3">
              <span className="h-px w-16" style={{ background: brand, opacity: 0.4 }} />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: brand }}
              />
              <span className="h-px w-16" style={{ background: brand, opacity: 0.4 }} />
            </div>

            <p className="text-[11px] text-muted-foreground max-w-[220px] leading-snug">
              Scan to discover authentic Moroccan craft workshops
            </p>

            {/* QR with corner brackets */}
            <div className="relative mt-5 bg-white rounded-2xl p-4 shadow-[0_10px_30px_-12px_rgba(20,15,10,0.18)]">
              {[
                "top-1.5 left-1.5 border-t-2 border-l-2 rounded-tl-md",
                "top-1.5 right-1.5 border-t-2 border-r-2 rounded-tr-md",
                "bottom-1.5 left-1.5 border-b-2 border-l-2 rounded-bl-md",
                "bottom-1.5 right-1.5 border-b-2 border-r-2 rounded-br-md",
              ].map((cls) => (
                <span
                  key={cls}
                  className={`absolute w-4 h-4 ${cls}`}
                  style={{ borderColor: brand }}
                />
              ))}
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR" className="w-52 h-52 block" />
              ) : (
                <div className="w-52 h-52 grid place-items-center">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <span
              className="mt-5 inline-block text-[11px] font-medium px-4 py-1.5 rounded-full text-white"
              style={{ background: brand }}
            >
              {url.replace(/^https?:\/\//, "")}
            </span>

            <p className="mt-4 text-[9px] tracking-[0.24em] text-muted-foreground">
              POTTERY · ZELLIGE · WEAVING · TÉTOUAN
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" onClick={downloadQrOnly} disabled={!qrDataUrl}>
            <Download size={14} className="mr-1.5" /> QR only
          </Button>
          <Button
            onClick={downloadFullDesign}
            disabled={!qrDataUrl || busy}
            style={{ background: brand }}
          >
            {busy ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <ImageIcon size={14} className="mr-1.5" />
            )}
            Full poster
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
