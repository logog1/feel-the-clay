import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, CheckCircle2, Mail, Phone, Settings as SettingsIcon } from "lucide-react";

export function SettingsSection() {
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("key, value").in("key", ["notification_email", "whatsapp_numbers"]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.key] = r.value; });
        setContactEmail(map["notification_email"] || "");
        setContactWhatsApp(map["whatsapp_numbers"] || "");
      }
    };
    fetch();
  }, []);

  const saveContacts = async () => {
    setSaving(true);
    setSaved(false);
    await Promise.all([
      supabase.from("site_settings").upsert({ key: "notification_email", value: contactEmail.trim(), updated_at: new Date().toISOString() }),
      supabase.from("site_settings").upsert({ key: "whatsapp_numbers", value: contactWhatsApp.trim(), updated_at: new Date().toISOString() }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-2">
        <h3 className="font-bold text-foreground flex items-center gap-2"><SettingsIcon size={18} className="text-primary" /> Settings</h3>
        <p className="text-sm text-muted-foreground">Manage notification contacts and site configuration.</p>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2"><Mail size={16} className="text-primary" /> Notification Email</h4>
        <p className="text-sm text-muted-foreground">Orders and bookings will be sent to this email.</p>
        <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@example.com" className="rounded-xl" />
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border/40 space-y-5">
        <h4 className="font-bold text-foreground flex items-center gap-2"><Phone size={16} className="text-primary" /> WhatsApp Numbers</h4>
        <p className="text-sm text-muted-foreground">Comma-separated list (include country code).</p>
        <Input value={contactWhatsApp} onChange={(e) => setContactWhatsApp(e.target.value)} placeholder="+212600000000,+212700000000" className="rounded-xl" />
      </div>

      <Button onClick={saveContacts} disabled={saving} className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
        {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> {saving ? "Saving..." : "Save Settings"}</>}
      </Button>
    </div>
  );
}
