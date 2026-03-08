CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Settings are publicly readable" ON public.site_settings FOR SELECT USING (true);

INSERT INTO public.site_settings (key, value) VALUES 
  ('notification_email', 'contact.terraria@gmail.com'),
  ('whatsapp_numbers', '+212650094668,+212687323997');
