import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Image as ImageIcon, Upload, X, GripVertical, Plus, Save, CheckCircle2,
  Home, Layers, Palette, Monitor, Tablet, Smartphone, Ratio, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { ImageEditorDialog, getFrameClasses, DEFAULT_EDITS, type ImageEdits, type FrameStyle } from "./ImageEditorDialog";

// ─── Default image imports ───
import heroBg from "@/assets/hero-bg.jpg";
import handbuildingHero from "@/assets/handbuilding-hero.jpg";
import potteryGirls from "@/assets/pottery-girls.jpg";
import embrHero from "@/assets/embr-hero.jpg";

// Moments gallery defaults
import workshop1 from "@/assets/workshop-1.jpg";
import workshop3 from "@/assets/workshop-3.jpg";
import workshop4 from "@/assets/workshop-4.jpg";
import workshop5 from "@/assets/workshop-5.jpg";
import workshop6 from "@/assets/workshop-6.jpg";
import workshop8 from "@/assets/workshop-8.jpg";
import workshop9 from "@/assets/workshop-9.jpg";
import workshop10 from "@/assets/workshop-10.jpg";
import workshop11 from "@/assets/workshop-11.jpg";
import workshop12 from "@/assets/workshop-12.jpg";
import workshop13 from "@/assets/workshop-13.jpg";
import workshop14 from "@/assets/workshop-14.jpg";
import workshop15 from "@/assets/workshop-15.jpg";
import workshop16 from "@/assets/workshop-16.jpg";
import workshop18 from "@/assets/workshop-18.jpg";
import workshop19 from "@/assets/workshop-19.jpg";
import workshop20 from "@/assets/workshop-20.jpg";
import workshop21 from "@/assets/workshop-21.jpg";

// Workshop gallery defaults
import potteryEntrance from "@/assets/pottery-entrance.jpg";
import potteryMasters from "@/assets/pottery-masters.jpg";
import potteryClaySource from "@/assets/pottery-clay-source.jpg";
import embrGallery1 from "@/assets/embr-gallery-1.jpg";
import embrGallery2 from "@/assets/embr-gallery-2.jpg";
import embrGallery3 from "@/assets/embr-gallery-3.jpg";
import embrGallery4 from "@/assets/embr-gallery-4.jpg";
import embrGallery5 from "@/assets/embr-gallery-5.jpg";

type GalleryImage = { url: string; alt: string; size?: string; frame?: FrameStyle };

type DeviceRatios = { mobile: string; tablet: string; desktop: string };

const ASPECT_RATIOS = [
  { value: "auto", label: "Auto" },
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "3:2", label: "3:2" },
  { value: "16:9", label: "16:9" },
  { value: "3:4", label: "3:4" },
  { value: "2:3", label: "2:3" },
  { value: "9:16", label: "9:16" },
];

const DEFAULT_RATIOS: DeviceRatios = { mobile: "auto", tablet: "auto", desktop: "auto" };

// ─── Default values ───
const DEFAULT_SINGLES: Record<string, string> = {
  image_hero_bg: heroBg,
  image_workshop_handbuilding: handbuildingHero,
  image_workshop_pottery: potteryGirls,
  image_workshop_embroidery: embrHero,
};

const DEFAULT_GALLERIES: Record<string, GalleryImage[]> = {
  gallery_moments: [
    { url: workshop1, alt: "Workshop participant shaping clay" },
    { url: workshop4, alt: "Creating pottery together" },
    { url: workshop9, alt: "Hands shaping clay pieces" },
    { url: workshop13, alt: "Clay sculpture on pottery wheel" },
    { url: workshop14, alt: "Group workshop in the studio" },
    { url: workshop3, alt: "Group pottery session" },
    { url: workshop18, alt: "Artist presenting handmade mug" },
    { url: workshop5, alt: "Handbuilding clay pieces" },
    { url: workshop10, alt: "Artist rolling clay" },
    { url: workshop19, alt: "Community workshop gathering" },
    { url: workshop12, alt: "Friends enjoying the workshop" },
    { url: workshop15, alt: "Friends showing off their creations" },
    { url: workshop6, alt: "Coil building technique" },
    { url: workshop20, alt: "Friends with their clay creations" },
    { url: workshop8, alt: "Happy workshop participants" },
    { url: workshop11, alt: "Pottery tools on canvas" },
    { url: workshop21, alt: "Handmade clay pieces closeup" },
    { url: workshop16, alt: "Group photo at the workshop" },
  ],
  gallery_about: [
    { url: "/images/impact-7.jpg", alt: "Group workshop session" },
    { url: "/images/impact-10.jpg", alt: "Friends at the workshop" },
    { url: "/images/impact-1.jpg", alt: "Potter at work" },
    { url: "/images/impact-2.jpg", alt: "Workshop moment" },
    { url: "/images/impact-3.jpg", alt: "Community gathering" },
    { url: "/images/impact-4.jpg", alt: "Pottery creation" },
    { url: "/images/impact-8.jpg", alt: "Team selfie" },
    { url: "/images/impact-9.jpg", alt: "Woman at pottery wheel" },
    { url: "/images/impact-6.jpg", alt: "Finished pieces" },
    { url: "/images/impact-11.jpg", alt: "Pottery lamp with workshop" },
  ],
  gallery_workshop_handbuilding: [
    { url: workshop5, alt: "Handbuilding clay pieces" },
    { url: workshop6, alt: "Coil building technique" },
    { url: workshop8, alt: "Happy participants" },
    { url: workshop10, alt: "Artist rolling clay" },
  ],
  gallery_workshop_pottery: [
    { url: potteryEntrance, alt: "Pottery workshop entrance" },
    { url: potteryGirls, alt: "Group pottery session" },
    { url: potteryMasters, alt: "Pottery masters at work" },
    { url: potteryClaySource, alt: "Clay source" },
  ],
  gallery_workshop_embroidery: [
    { url: embrGallery1, alt: "Embroidery session 1" },
    { url: embrGallery2, alt: "Embroidery session 2" },
    { url: embrGallery3, alt: "Embroidery session 3" },
    { url: embrGallery4, alt: "Embroidery session 4" },
    { url: embrGallery5, alt: "Embroidery session 5" },
  ],
};

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
function SingleImageUploader({ settingKey, label, currentUrl, defaultUrl, onUploaded, frame, onFrameChange }: {
  settingKey: string; label: string; currentUrl: string; defaultUrl?: string; onUploaded: (url: string) => void;
  frame?: FrameStyle; onFrameChange?: (frame: FrameStyle) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = currentUrl || defaultUrl || "";
  const isDefault = !currentUrl && !!defaultUrl;
  const currentFrame = frame || "none";

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
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground font-medium">{label}</label>
        {isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Default</span>}
      </div>
      {displayUrl ? (
        <div className={`relative w-full aspect-video rounded-xl overflow-hidden border border-border/40 group ${getFrameClasses(currentFrame)}`}>
          <img src={displayUrl} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)} className="rounded-lg text-xs">
              <Pencil size={14} className="mr-1" /> Edit
            </Button>
            <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} className="rounded-lg text-xs">
              <Upload size={14} className="mr-1" /> Replace
            </Button>
            {currentUrl && (
              <Button size="sm" variant="destructive" onClick={() => onUploaded("")} className="rounded-lg text-xs">
                <X size={14} className="mr-1" /> {defaultUrl ? "Reset" : "Remove"}
              </Button>
            )}
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

      {editing && displayUrl && (
        <ImageEditorDialog
          open={editing}
          onClose={() => setEditing(false)}
          imageUrl={displayUrl}
          settingKey={settingKey}
          initialEdits={{ ...DEFAULT_EDITS, frame: currentFrame }}
          onApply={(newUrl, appliedEdits) => {
            if (newUrl !== displayUrl) onUploaded(newUrl);
            onFrameChange?.(appliedEdits.frame);
          }}
        />
      )}
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

  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const updateField = (idx: number, field: keyof GalleryImage, value: string) => {
    const updated = [...images];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-foreground">{label}</h5>
        <span className="text-xs text-muted-foreground">{images.length} images</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={`${idx}-${img.url.slice(-20)}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            className={`relative group rounded-xl overflow-hidden border border-border/40 bg-muted/20 transition-shadow ${dragIdx === idx ? "ring-2 ring-primary shadow-lg" : ""}`}
          >
            <div className={`aspect-square overflow-hidden ${getFrameClasses(img.frame || "none")}`}>
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
              <div className="flex items-center gap-1">
                <GripVertical size={14} className="text-white/60 cursor-grab" />
                <Button size="sm" variant="secondary" onClick={() => setEditingIdx(idx)} className="rounded-lg text-xs h-7 px-2">
                  <Pencil size={12} />
                </Button>
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

      {editingIdx !== null && images[editingIdx] && (
        <ImageEditorDialog
          open={true}
          onClose={() => setEditingIdx(null)}
          imageUrl={images[editingIdx].url}
          settingKey={`${settingKey}-${editingIdx}`}
          initialEdits={{ ...DEFAULT_EDITS, frame: images[editingIdx].frame || "none" }}
          onApply={(newUrl, appliedEdits) => {
            const updated = [...images];
            updated[editingIdx] = {
              ...updated[editingIdx],
              url: newUrl,
              frame: appliedEdits.frame,
            };
            onChange(updated);
            setEditingIdx(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Main Component ───
export function MediaManagerSection() {
  const [singleImages, setSingleImages] = useState<Record<string, string>>({});
  const [singleFrames, setSingleFrames] = useState<Record<string, FrameStyle>>({});
  const [galleries, setGalleries] = useState<Record<string, GalleryImage[]>>({});
  const [mediaRatios, setMediaRatios] = useState<Record<string, DeviceRatios>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch image settings
      // Fetch all relevant keys in one go
      const allFetchKeys = [...ALL_KEYS];
      const { data: mainData } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", allFetchKeys);
      
      const { data: ratioData } = await supabase
        .from("site_settings")
        .select("key, value")
        .like("key", "media_ratio_%");

      const { data: frameData } = await supabase
        .from("site_settings")
        .select("key, value")
        .like("key", "media_frame_%");
      
      const data = [...(mainData || []), ...(ratioData || []), ...(frameData || [])];

      const singles: Record<string, string> = {};
      const gals: Record<string, GalleryImage[]> = {};
      const ratios: Record<string, DeviceRatios> = {};
      const frames: Record<string, FrameStyle> = {};

      if (data) {
        data.forEach((r: any) => {
          if (r.key.startsWith("media_ratio_")) {
            try {
              ratios[r.key.replace("media_ratio_", "")] = JSON.parse(r.value);
            } catch { /* ignore */ }
          } else if (r.key.startsWith("media_frame_")) {
            frames[r.key.replace("media_frame_", "")] = r.value as FrameStyle;
          } else if (r.key.startsWith("gallery_")) {
            try {
              const parsed = JSON.parse(r.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                gals[r.key] = parsed;
              }
            } catch { /* use default */ }
          } else {
            if (r.value) singles[r.key] = r.value;
          }
        });
      }

      // For galleries without saved data, populate with defaults
      for (const key of Object.keys(DEFAULT_GALLERIES)) {
        if (!gals[key] || gals[key].length === 0) {
          gals[key] = [...DEFAULT_GALLERIES[key]];
        }
      }

      setSingleImages(singles);
      setSingleFrames(frames);
      setGalleries(gals);
      setMediaRatios(ratios);
      setLoaded(true);
    };
    fetchAll();
  }, []);

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    const now = new Date().toISOString();
    const upserts = [
      ...Object.entries(singleImages).map(([key, value]) => ({ key, value, updated_at: now })),
      ...Object.entries(singleFrames).map(([key, frame]) => ({ key: `media_frame_${key}`, value: frame, updated_at: now })),
      ...Object.entries(galleries).map(([key, imgs]) => ({ key, value: JSON.stringify(imgs), updated_at: now })),
      ...Object.entries(mediaRatios).map(([key, ratios]) => ({ key: `media_ratio_${key}`, value: JSON.stringify(ratios), updated_at: now })),
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

  if (!loaded) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading media…</div>;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <ImageIcon size={18} className="text-primary" /> Media Manager
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage all site images, hero backgrounds, workshop cards, and galleries in one place. Drag to reorder. Upload to replace defaults.
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
              defaultUrl={DEFAULT_SINGLES[s.key]}
              onUploaded={(url) => setSingleImages((prev) => ({ ...prev, [s.key]: url }))}
              frame={singleFrames[s.key]}
              onFrameChange={(f) => setSingleFrames((prev) => ({ ...prev, [s.key]: f }))}
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
              defaultUrl={DEFAULT_SINGLES[s.key]}
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
          All current images are shown below. Drag to reorder, click × to remove, or add new ones. Changes apply after saving.
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

      {/* Media Aspect Ratios */}
      <div className="p-6 rounded-2xl bg-card border border-primary/20 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <Ratio size={16} className="text-primary" /> Image Aspect Ratios by Device
        </h4>
        <p className="text-sm text-muted-foreground">
          Control how images are cropped on different devices. "Auto" uses the image's natural ratio.
        </p>
        <div className="space-y-4">
          {[...HERO_SETTINGS, ...CARD_SETTINGS].map((s) => {
            const ratios = mediaRatios[s.key] || { ...DEFAULT_RATIOS };
            const updateRatio = (device: keyof DeviceRatios, value: string) => {
              setMediaRatios(prev => ({
                ...prev,
                [s.key]: { ...(prev[s.key] || DEFAULT_RATIOS), [device]: value },
              }));
            };
            return (
              <div key={s.key} className="p-4 rounded-xl bg-muted/20 space-y-3">
                <span className="text-sm font-medium text-foreground">{s.label}</span>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
                    { key: "tablet" as const, icon: Tablet, label: "Tablet" },
                    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
                  ]).map(device => (
                    <div key={device.key} className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <device.icon size={12} /> {device.label}
                      </label>
                      <Select value={ratios[device.key]} onValueChange={(v) => updateRatio(device.key, v)}>
                        <SelectTrigger className="h-8 rounded-lg text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASPECT_RATIOS.map(r => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <Button onClick={saveAll} disabled={saving} className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
        {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> {saving ? "Saving..." : "Save All Media"}</>}
      </Button>
    </div>
  );
}
