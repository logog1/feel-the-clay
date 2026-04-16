import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sun, Contrast, Droplets, RotateCcw, Check, Crop, Frame,
  Smartphone, Monitor,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FrameStyle = "none" | "thin" | "rounded" | "shadow" | "polaroid" | "thick";

export interface ImageEdits {
  brightness: number;
  contrast: number;
  saturation: number;
  frame: FrameStyle;
}

export const DEFAULT_EDITS: ImageEdits = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  frame: "none",
};

const FRAME_PRESETS: { value: FrameStyle; label: string }[] = [
  { value: "none", label: "No Frame" },
  { value: "thin", label: "Thin Border" },
  { value: "thick", label: "Thick Border" },
  { value: "rounded", label: "Rounded" },
  { value: "shadow", label: "Shadow" },
  { value: "polaroid", label: "Polaroid" },
];

/** CSS classes for frame styles — used in rendering on the actual site */
export function getFrameClasses(frame: FrameStyle): string {
  switch (frame) {
    case "thin": return "ring-1 ring-border";
    case "thick": return "ring-4 ring-border";
    case "rounded": return "rounded-3xl ring-2 ring-border/60";
    case "shadow": return "shadow-2xl ring-1 ring-border/30";
    case "polaroid": return "ring-4 ring-white shadow-xl pb-8 bg-white";
    default: return "";
  }
}

interface ImageEditorDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  settingKey: string;
  onApply: (newUrl: string, edits: ImageEdits) => void;
  initialEdits?: ImageEdits;
}

export function ImageEditorDialog({ open, onClose, imageUrl, settingKey, onApply, initialEdits }: ImageEditorDialogProps) {
  const [edits, setEdits] = useState<ImageEdits>(initialEdits || { ...DEFAULT_EDITS });
  const [applying, setApplying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const hasFilterChanges = edits.brightness !== 100 || edits.contrast !== 100 || edits.saturation !== 100;

  // Load image
  useEffect(() => {
    if (!open || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; };
    img.src = imageUrl;
  }, [open, imageUrl]);

  const filterStyle = `brightness(${edits.brightness}%) contrast(${edits.contrast}%) saturate(${edits.saturation}%)`;

  const reset = () => setEdits({ ...DEFAULT_EDITS });

  const applyEdits = async () => {
    // If only frame changed (no filter changes), just save frame metadata
    if (!hasFilterChanges) {
      onApply(imageUrl, edits);
      onClose();
      return;
    }

    // Render filtered image to canvas and upload
    const img = imgRef.current;
    if (!img) { toast.error("Image not loaded yet"); return; }

    setApplying(true);
    try {
      const canvas = canvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.filter = filterStyle;
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) { toast.error("Failed to process image"); setApplying(false); return; }

      const path = `${settingKey}-edited-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("site-images").upload(path, blob, { upsert: true });
      if (error) { toast.error("Upload failed"); setApplying(false); return; }

      const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
      onApply(urlData.publicUrl, { ...edits, brightness: 100, contrast: 100, saturation: 100 });
      toast.success("Edits applied!");
      onClose();
    } catch {
      toast.error("Failed to apply edits");
    }
    setApplying(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Crop size={18} className="text-primary" /> Edit Image
          </DialogTitle>
        </DialogHeader>

        {/* Device Previews */}
        <div className="flex gap-4 justify-center bg-muted/30 rounded-xl p-4 overflow-x-auto">
          {/* Phone Preview */}
          <div className="flex-shrink-0 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <Smartphone size={10} /> Phone
            </div>
            <div className="relative overflow-hidden rounded-2xl border-2 border-border/60 bg-[hsl(var(--background))]" style={{ width: 140, height: 280 }}>
              {/* Status bar */}
              <div className="h-5 bg-background/80 flex items-center justify-between px-2">
                <span className="text-[6px] text-muted-foreground">9:41</span>
                <div className="flex gap-0.5">
                  <div className="w-2 h-1.5 rounded-sm bg-muted-foreground/30" />
                  <div className="w-2 h-1.5 rounded-sm bg-muted-foreground/30" />
                </div>
              </div>
              {/* Hero image area */}
              <div className="relative" style={{ height: 180 }}>
                <div className={`w-full h-full overflow-hidden ${getFrameClasses(edits.frame)}`}>
                  <img src={imageUrl} alt="Phone preview" className="w-full h-full object-cover" style={{ filter: filterStyle }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />
                {/* Simulated nav */}
                <div className="absolute top-1 left-2 right-2 flex items-center justify-between">
                  <div className="w-4 h-4 rounded bg-primary/70" />
                  <div className="w-4 h-4 rounded bg-muted/40 flex items-center justify-center">
                    <div className="w-2.5 h-[1px] bg-foreground/50" />
                  </div>
                </div>
                {/* Simulated text */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <div className="h-2 w-16 bg-foreground/70 rounded-sm" />
                  <div className="h-2 w-12 bg-foreground/50 rounded-sm" />
                  <div className="h-1 w-20 bg-foreground/30 rounded-sm mt-1" />
                </div>
              </div>
              {/* Below hero content */}
              <div className="p-2 space-y-1.5">
                <div className="h-1.5 w-full bg-muted/60 rounded" />
                <div className="h-1.5 w-3/4 bg-muted/40 rounded" />
                <div className="flex gap-1 mt-2">
                  <div className="h-3 w-8 rounded bg-primary/20" />
                  <div className="h-3 w-8 rounded bg-muted/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Preview */}
          <div className="flex-shrink-0 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <Monitor size={10} /> Desktop
            </div>
            <div className="relative overflow-hidden rounded-xl border-2 border-border/60 bg-[hsl(var(--background))]" style={{ width: 320, height: 200 }}>
              {/* Desktop nav bar */}
              <div className="h-6 bg-background/90 border-b border-border/30 flex items-center justify-between px-3">
                <div className="w-4 h-4 rounded bg-primary/70" />
                <div className="flex gap-3">
                  {["Home", "About", "Workshops", "Blog", "Contact"].map(n => (
                    <span key={n} className="text-[6px] text-muted-foreground">{n}</span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <div className="h-3 px-1.5 rounded bg-primary/20 text-[5px] text-primary flex items-center">Store</div>
                  <div className="h-3 px-1.5 rounded bg-primary text-[5px] text-primary-foreground flex items-center">Book</div>
                </div>
              </div>
              {/* Hero section */}
              <div className="relative" style={{ height: 145 }}>
                <div className={`w-full h-full overflow-hidden ${getFrameClasses(edits.frame)}`}>
                  <img src={imageUrl} alt="Desktop preview" className="w-full h-full object-cover" style={{ filter: filterStyle }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/70" />
                {/* Simulated hero text */}
                <div className="absolute bottom-4 left-6 space-y-1">
                  <div className="text-[10px] font-bold text-foreground drop-shadow-sm">Rethinking pottery</div>
                  <div className="text-[10px] font-bold text-foreground drop-shadow-sm">
                    as <span className="relative">community<span className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-primary rounded-full" /></span>
                  </div>
                  <div className="text-[6px] text-foreground/60 mt-0.5">A creative, grounding experience in Tetouan.</div>
                </div>
              </div>
              {/* Below hero */}
              <div className="px-4 py-2 flex gap-2">
                <div className="h-2 w-16 bg-muted/50 rounded" />
                <div className="h-2 w-12 bg-muted/30 rounded" />
                <div className="h-2 w-20 bg-muted/40 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sun size={14} className="text-amber-500" /> Brightness: {edits.brightness}%
            </label>
            <Slider
              value={[edits.brightness]}
              onValueChange={([v]) => setEdits(e => ({ ...e, brightness: v }))}
              min={30}
              max={200}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Contrast size={14} className="text-blue-500" /> Contrast: {edits.contrast}%
            </label>
            <Slider
              value={[edits.contrast]}
              onValueChange={([v]) => setEdits(e => ({ ...e, contrast: v }))}
              min={30}
              max={200}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Droplets size={14} className="text-emerald-500" /> Saturation: {edits.saturation}%
            </label>
            <Slider
              value={[edits.saturation]}
              onValueChange={([v]) => setEdits(e => ({ ...e, saturation: v }))}
              min={0}
              max={200}
              step={1}
            />
          </div>

          {/* Frame */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Frame size={14} className="text-primary" /> Frame Style
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FRAME_PRESETS.map((fp) => (
                <button
                  key={fp.value}
                  onClick={() => setEdits(e => ({ ...e, frame: fp.value }))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    edits.frame === fp.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {fp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground rounded-lg">
            <RotateCcw size={14} /> Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-lg">Cancel</Button>
            <Button size="sm" onClick={applyEdits} disabled={applying} className="gap-1.5 rounded-lg bg-primary text-primary-foreground">
              <Check size={14} /> {applying ? "Applying…" : "Apply"}
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
