import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Image as ImageIcon, Upload, X, GripVertical, Plus, Save, CheckCircle2,
  Home, Layers, BookOpen, Palette,
} from "lucide-react";
import { toast } from "sonner";

type GalleryImage = { url: string; alt: string; size?: string };

const HERO_SETTINGS = [
  { key: "image_hero_bg", label: "Home Page Hero Background" },
];

const CARD_SETTINGS = [
  { key: "image_workshop_handbuilding", label: "Handbuilding Card & Hero" },
  { key: "image_workshop_pottery", label: "Pottery Card & Hero" },
  { key: "image_workshop_embroidery", label: "Embroidery Card & Hero" },
];

const GALLERY_SETTINGS = [
  { key: "gallery_moments", label: "Moments Gallery (Home Page)" },
  { key: "gallery_about", label: "About Us Gallery" },
  { key: "gallery_workshop_handbuilding", label: "Handbuilding Workshop Gallery" },
  { key: "gallery_workshop_pottery", label: "Pottery Workshop Gallery" },
  { key: "gallery_workshop_embroidery", label: "Embroidery Workshop Gallery" },
];

const ALL_KEYS = [
  ...HERO_SETTINGS.map((s) => s.key),
  ...CARD_SETTINGS.map((s) => s.key),
  ...GALLERY_SETTINGS.map((s) => s.key),
];

// ─── Single Image Uploader ───
function SingleImageUploader({ settingKey, label, currentUrl, onUploaded }: {
  settingKey: string; label: string; currentUrl: string; onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${settingKey}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
    onUploaded(urlData.publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      {currentUrl ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/40 group">
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} className="rounded-lg text-xs">
              <Upload size={14} className="mr-1" /> Replace
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onUploaded("")} className="rounded-lg text-xs">
              <X size={14} className="mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ImageIcon size={24} />
          <span className="text-xs">{uploading ? "Uploading…" : "Click to upload"}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}

// ─── Gallery Manager ───
function GalleryManager({ settingKey, label, images, onChange }: {
  settingKey: string; label: string; images: GalleryImage[]; onChange: (imgs: GalleryImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const newImages = [...images];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `${settingKey}-${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (error) { toast.error(`Failed to upload ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
      newImages.push({ url: urlData.publicUrl, alt: file.name.replace(/\.[^.]+$/, "") });
    }
    onChange(newImages);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const updateAlt = (idx: number, alt: string) => {
    const updated = [...images];
    updated[idx] = { ...updated[idx], alt };
    onChange(updated);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    onChange(reordered);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-foreground">{label}</h5>
        <span className="text-xs text-muted-foreground">{images.length} images</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`relative group rounded-xl overflow-hidden border border-border/40 bg-muted/20 transition-shadow ${dragIdx === idx ? "ring-2 ring-primary shadow-lg" : ""}`}
          >
            <div className="aspect-square">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
              <div className="flex items-center gap-1">
                <GripVertical size={14} className="text-white/60 cursor-grab" />
                <Button size="sm" variant="destructive" onClick={() => remove(idx)} className="rounded-lg text-xs h-7 px-2">
                  <X size={12} />
                </Button>
              </div>
            </div>
            <div className="p-1.5">
              <Input
                value={img.alt}
                onChange={(e) => updateAlt(idx, e.target.value)}
                placeholder="Alt text"
                className="text-xs h-7 rounded-lg bg-background/80"
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Plus size={20} />
          <span className="text-[10px]">{uploading ? "Uploading…" : "Add images"}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
    </div>
  );
}

// ─── Main Component ───
export function MediaManagerSection() {
  const [singleImages, setSingleImages] = useState<Record<string, string>>({});
  const [galleries, setGalleries] = useState<Record<string, GalleryImage[]>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ALL_KEYS)
      .then(({ data }) => {
        if (!data) return;
        const singles: Record<string, string> = {};
        const gals: Record<string, GalleryImage[]> = {};
        data.forEach((r: any) => {
          if (r.key.startsWith("gallery_")) {
            try { gals[r.key] = JSON.parse(r.value) || []; } catch { gals[r.key] = []; }
          } else {
            singles[r.key] = r.value || "";
          }
        });
        setSingleImages(singles);
        setGalleries(gals);
      });
  }, []);

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    const now = new Date().toISOString();
    const upserts = [
      ...Object.entries(singleImages).map(([key, value]) => ({ key, value, updated_at: now })),
      ...Object.entries(galleries).map(([key, imgs]) => ({ key, value: JSON.stringify(imgs), updated_at: now })),
    ];
    if (upserts.length) {
      const { error } = await supabase.from("site_settings").upsert(upserts);
      if (error) { toast.error("Save failed"); setSaving(false); return; }
    }
    setSaving(false);
    setSaved(true);
    toast.success("All media settings saved!");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <ImageIcon size={18} className="text-primary" /> Media Manager
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage all site images, hero backgrounds, workshop cards, and galleries in one place. Drag to reorder gallery images.
        </p>
      </div>

      {/* Hero Images */}
      <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <Home size={16} className="text-primary" /> Hero & Background Images
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {HERO_SETTINGS.map((s) => (
            <SingleImageUploader
              key={s.key}
              settingKey={s.key}
              label={s.label}
              currentUrl={singleImages[s.key] || ""}
              onUploaded={(url) => setSingleImages((prev) => ({ ...prev, [s.key]: url }))}
            />
          ))}
        </div>
      </div>

      {/* Workshop Card Images */}
      <div className="p-6 rounded-2xl bg-card border border-primary/20 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <Palette size={16} className="text-primary" /> Workshop Card & Hero Images
        </h4>
        <p className="text-sm text-muted-foreground">These images appear on the workshop cards (home page) and as the hero on each workshop page.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CARD_SETTINGS.map((s) => (
            <SingleImageUploader
              key={s.key}
              settingKey={s.key}
              label={s.label}
              currentUrl={singleImages[s.key] || ""}
              onUploaded={(url) => setSingleImages((prev) => ({ ...prev, [s.key]: url }))}
            />
          ))}
        </div>
      </div>

      {/* Galleries */}
      <div className="p-6 rounded-2xl bg-card border border-primary/20 space-y-6">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <Layers size={16} className="text-primary" /> Galleries
        </h4>
        <p className="text-sm text-muted-foreground">
          Upload, remove, and drag-to-reorder images for each gallery. Leave empty to use defaults.
        </p>
        {GALLERY_SETTINGS.map((s) => (
          <div key={s.key} className="pt-4 border-t border-border/30 first:border-0 first:pt-0">
            <GalleryManager
              settingKey={s.key}
              label={s.label}
              images={galleries[s.key] || []}
              onChange={(imgs) => setGalleries((prev) => ({ ...prev, [s.key]: imgs }))}
            />
          </div>
        ))}
      </div>

      {/* Save */}
      <Button onClick={saveAll} disabled={saving} className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
        {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> {saving ? "Saving..." : "Save All Media"}</>}
      </Button>
    </div>
  );
}
