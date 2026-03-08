import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SiteImageUploaderProps {
  settingKey: string;
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}

export function SiteImageUploader({ settingKey, label, currentUrl, onUploaded }: SiteImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${settingKey}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // Persist to site_settings
    await supabase.from("site_settings").upsert({
      key: settingKey,
      value: publicUrl,
      updated_at: new Date().toISOString(),
    });

    onUploaded(publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClear = async () => {
    await supabase.from("site_settings").upsert({
      key: settingKey,
      value: "",
      updated_at: new Date().toISOString(),
    });
    onUploaded("");
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
            <Button size="sm" variant="destructive" onClick={handleClear} className="rounded-lg text-xs">
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
