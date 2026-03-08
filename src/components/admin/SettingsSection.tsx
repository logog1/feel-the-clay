import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, CheckCircle2, Mail, Phone, Globe, Settings as SettingsIcon, ImageIcon, Zap } from "lucide-react";
import { SiteImageUploader } from "./SiteImageUploader";

const IMAGE_SETTINGS = [
  { key: "image_hero_bg", label: "Home Page Hero Background" },
  { key: "image_workshop_handbuilding", label: "Handbuilding Workshop Card & Hero" },
  { key: "image_workshop_pottery", label: "Pottery Workshop Card & Hero" },
  { key: "image_workshop_embroidery", label: "Embroidery Workshop Card & Hero" },
];

export function SettingsSection() {
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [publicEmail, setPublicEmail] = useState("");
  const [publicWhatsApp, setPublicWhatsApp] = useState("");
  const [publicMapUrl, setPublicMapUrl] = useState("");
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase.from("site_settings").select("key, value").in("key", [
        "notification_email", "whatsapp_numbers",
        "public_email", "public_whatsapp", "public_map_url",
        ...IMAGE_SETTINGS.map((s) => s.key),
      ]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        setContactEmail(map["notification_email"] || "");
        setContactWhatsApp(map["whatsapp_numbers"] || "");
        setPublicEmail(map["public_email"] || "");
        setPublicWhatsApp(map["public_whatsapp"] || "");
        setPublicMapUrl(map["public_map_url"] || "");
        const imgs: Record<string, string> = {};
        IMAGE_SETTINGS.forEach((s) => { if (map[s.key]) imgs[s.key] = map[s.key]; });
        setImageUrls(imgs);
      }
    };
    fetchAll();
  }, []);

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    const now = new Date().toISOString();
    await Promise.all([
      supabase.from("site_settings").upsert({ key: "notification_email", value: contactEmail.trim(), updated_at: now }),
      supabase.from("site_settings").upsert({ key: "whatsapp_numbers", value: contactWhatsApp.trim(), updated_at: now }),
      supabase.from("site_settings").upsert({ key: "public_email", value: publicEmail.trim(), updated_at: now }),
      supabase.from("site_settings").upsert({ key: "public_whatsapp", value: publicWhatsApp.trim(), updated_at: now }),
      supabase.from("site_settings").upsert({ key: "public_map_url", value: publicMapUrl.trim(), updated_at: now }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
        <h3 className="font-bold text-foreground flex items-center gap-2"><SettingsIcon size={18} className="text-primary" /> Settings</h3>
        <p className="text-sm text-muted-foreground">Manage notification contacts and public website info.</p>
      </div>

      {/* Internal notifications */}
      <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2"><Mail size={16} className="text-primary" /> Notification Email</h4>
        <p className="text-sm text-muted-foreground">Orders and bookings will be sent to this email.</p>
        <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@example.com" className="rounded-xl" />
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2"><Phone size={16} className="text-primary" /> Notification WhatsApp</h4>
        <p className="text-sm text-muted-foreground">Comma-separated list (include country code).</p>
        <Input value={contactWhatsApp} onChange={(e) => setContactWhatsApp(e.target.value)} placeholder="+212600000000" className="rounded-xl" />
      </div>

      {/* Public-facing contacts */}
      <div className="p-6 rounded-2xl bg-card border border-primary/20 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2"><Globe size={16} className="text-primary" /> Public Contact Info</h4>
        <p className="text-sm text-muted-foreground">These appear on the website for visitors to see.</p>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Public Email</Label>
            <Input value={publicEmail} onChange={(e) => setPublicEmail(e.target.value)} placeholder="hello@terrariaworkshops.com" className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Public WhatsApp Link</Label>
            <Input value={publicWhatsApp} onChange={(e) => setPublicWhatsApp(e.target.value)} placeholder="https://wa.me/message/XXXXXXX" className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Google Maps Embed URL</Label>
            <Input value={publicMapUrl} onChange={(e) => setPublicMapUrl(e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." className="rounded-xl" />
          </div>
        </div>
      </div>

      {/* Site Images */}
      <div className="p-6 rounded-2xl bg-card border border-primary/20 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2"><ImageIcon size={16} className="text-primary" /> Page Images</h4>
        <p className="text-sm text-muted-foreground">Customize hero backgrounds and workshop card images. Leave empty to use defaults.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {IMAGE_SETTINGS.map((s) => (
            <SiteImageUploader
              key={s.key}
              settingKey={s.key}
              label={s.label}
              currentUrl={imageUrls[s.key] || ""}
              onUploaded={(url) => setImageUrls((prev) => ({ ...prev, [s.key]: url }))}
            />
          ))}
        </div>
      </div>

      <Button onClick={saveAll} disabled={saving} className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
        {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> {saving ? "Saving..." : "Save Settings"}</>}
      </Button>
    </div>
  );
}
