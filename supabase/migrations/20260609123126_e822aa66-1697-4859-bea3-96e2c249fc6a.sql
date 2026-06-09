CREATE OR REPLACE VIEW public.partner_offers_public
WITH (security_invoker = on) AS
SELECT a.id AS assignment_id,
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
   AND (o.ends_at IS NULL OR o.ends_at >= now())
   AND (o.kind <> 'event' OR o.event_at IS NULL OR o.event_at >= (now() - interval '2 hours'));

GRANT SELECT ON public.partner_offers_public TO anon, authenticated;