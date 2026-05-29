
-- Hotels & Riads partner properties
CREATE TABLE public.hotel_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'hotel', -- hotel | riad | boutique
  city text,
  brand_color text NOT NULL DEFAULT '#c4654a',
  logo_url text,
  cover_image text,
  intro_en text NOT NULL DEFAULT '',
  intro_fr text NOT NULL DEFAULT '',
  intro_es text NOT NULL DEFAULT '',
  intro_ar text NOT NULL DEFAULT '',
  contact_name text,
  contact_email text,
  contact_phone text,
  whatsapp text,
  website_url text,
  -- Perks/advantages mirrored from the B2B "for hotels & riads" block.
  -- jsonb array of { key, enabled, label_en, label_fr, label_es, label_ar, desc_en, ... }
  perks jsonb NOT NULL DEFAULT '[
    {"key":"landing","enabled":true,"label":"Custom landing page"},
    {"key":"qr","enabled":true,"label":"In-room QR check-in"},
    {"key":"calendar","enabled":true,"label":"Shared group calendar"},
    {"key":"revenue","enabled":true,"label":"Revenue share / commission"},
    {"key":"concierge","enabled":true,"label":"Concierge dashboard"},
    {"key":"transport","enabled":false,"label":"Guest transport coordination"}
  ]'::jsonb,
  experiences_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hotel_partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_partners TO authenticated;
GRANT ALL ON public.hotel_partners TO service_role;

ALTER TABLE public.hotel_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active partners are publicly viewable"
  ON public.hotel_partners FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage partners"
  ON public.hotel_partners FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER hotel_partners_updated_at
  BEFORE UPDATE ON public.hotel_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_products_updated_at();

-- Link existing Sofitel data to a seeded partner
INSERT INTO public.hotel_partners (slug, name, type, city, brand_color, intro_en, contact_email, sort_order, is_active)
VALUES ('sofitel', 'Sofitel Tamuda Bay', 'hotel', 'M''diq', '#0a2540',
        'Curated craft experiences for Sofitel Tamuda Bay guests.',
        'errachidyothmane@gmail.com', 0, true);

ALTER TABLE public.sofitel_experiences      ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.hotel_partners(id) ON DELETE SET NULL;
ALTER TABLE public.sofitel_bookings         ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.hotel_partners(id) ON DELETE SET NULL;
ALTER TABLE public.sofitel_group_requests   ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.hotel_partners(id) ON DELETE SET NULL;

UPDATE public.sofitel_experiences    SET partner_id = (SELECT id FROM public.hotel_partners WHERE slug='sofitel') WHERE partner_id IS NULL;
UPDATE public.sofitel_bookings       SET partner_id = (SELECT id FROM public.hotel_partners WHERE slug='sofitel') WHERE partner_id IS NULL;
UPDATE public.sofitel_group_requests SET partner_id = (SELECT id FROM public.hotel_partners WHERE slug='sofitel') WHERE partner_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_sofitel_experiences_partner    ON public.sofitel_experiences(partner_id);
CREATE INDEX IF NOT EXISTS idx_sofitel_bookings_partner       ON public.sofitel_bookings(partner_id);
CREATE INDEX IF NOT EXISTS idx_sofitel_group_requests_partner ON public.sofitel_group_requests(partner_id);
