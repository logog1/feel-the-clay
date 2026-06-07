
DROP POLICY IF EXISTS "Active partners are publicly viewable" ON public.hotel_partners;

REVOKE SELECT ON public.hotel_partners FROM anon;

CREATE OR REPLACE VIEW public.hotel_partners_public
WITH (security_invoker = true) AS
SELECT
  id, slug, name, type, city, brand_color, logo_url, cover_image,
  intro_en, intro_fr, intro_es, intro_ar,
  contact_name, contact_email, contact_phone, whatsapp, website_url,
  perks, experiences_config, is_active, sort_order,
  address, stars, languages_spoken,
  created_at, updated_at
FROM public.hotel_partners
WHERE is_active = true;

GRANT SELECT ON public.hotel_partners_public TO anon, authenticated;

CREATE POLICY "Public can read active partners via view"
ON public.hotel_partners
FOR SELECT
TO anon, authenticated
USING (is_active = true AND (
  current_setting('role', true) = 'authenticator'
  AND false
));
