import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sun, Contrast, Droplets, RotateCcw, Check, Crop, Frame,
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

        {/* Preview */}
        <div className="flex justify-center bg-muted/30 rounded-xl p-4">
          <div className={`inline-block overflow-hidden rounded-xl transition-all ${getFrameClasses(edits.frame)}`}>
            <img
              src={imageUrl}
              alt="Preview"
              className="max-h-[300px] w-auto object-contain"
              style={{ filter: filterStyle }}
            />
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
