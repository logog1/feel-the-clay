
-- Offers / events library
CREATE TABLE public.partner_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'offer' CHECK (kind IN ('offer','event')),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image TEXT,
  cta_type TEXT NOT NULL DEFAULT 'book' CHECK (cta_type IN ('book','whatsapp','link','none')),
  cta_value TEXT,
  cta_label TEXT,
  price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'MAD',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  event_at TIMESTAMPTZ,
  capacity INTEGER,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_offers TO authenticated;
GRANT ALL ON public.partner_offers TO service_role;

ALTER TABLE public.partner_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage offers"
  ON public.partner_offers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated staff read offers"
  ON public.partner_offers FOR SELECT
  TO authenticated
  USING (true);

-- Assignments: many-to-many between offers and hotel partners
CREATE TABLE public.partner_offer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.partner_offers(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.hotel_partners(id) ON DELETE CASCADE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cta_override_type TEXT CHECK (cta_override_type IN ('book','whatsapp','link','none')),
  cta_override_value TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (offer_id, partner_id)
);

CREATE INDEX idx_offer_assignments_partner ON public.partner_offer_assignments(partner_id);
CREATE INDEX idx_offer_assignments_offer ON public.partner_offer_assignments(offer_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_offer_assignments TO authenticated;
GRANT ALL ON public.partner_offer_assignments TO service_role;

ALTER TABLE public.partner_offer_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage assignments"
  ON public.partner_offer_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partner staff read own assignments"
  ON public.partner_offer_assignments FOR SELECT
  TO authenticated
  USING (public.is_partner_staff(auth.uid(), partner_id));

-- Updated-at trigger
CREATE TRIGGER trg_partner_offers_updated_at
  BEFORE UPDATE ON public.partner_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_products_updated_at();

-- Public read view: only published + active + within date window
CREATE OR REPLACE VIEW public.partner_offers_public
WITH (security_invoker = true) AS
SELECT
  a.id AS assignment_id,
  a.partner_id,
  a.sort_order AS assignment_sort,
  COALESCE(a.cta_override_type, o.cta_type) AS cta_type,
  COALESCE(a.cta_override_value, o.cta_value) AS cta_value,
  o.id AS offer_id,
  o.kind,
  o.title,
  o.subtitle,
  o.description,
  o.cover_image,
  o.cta_label,
  o.price,
  o.currency,
  o.starts_at,
  o.ends_at,
  o.event_at,
  o.capacity,
  o.tags
FROM public.partner_offer_assignments a
JOIN public.partner_offers o ON o.id = a.offer_id
WHERE a.is_published = true
  AND o.is_active = true
  AND (o.starts_at IS NULL OR o.starts_at <= now())
  AND (o.ends_at IS NULL OR o.ends_at >= now())
  AND (o.kind <> 'event' OR o.event_at IS NULL OR o.event_at >= now() - INTERVAL '2 hours');

GRANT SELECT ON public.partner_offers_public TO anon, authenticated;
