DROP POLICY IF EXISTS "Public can read safe settings" ON public.site_settings;

CREATE POLICY "Public can read safe settings"
ON public.site_settings
FOR SELECT
TO public
USING (
  key = ANY (ARRAY[
    'public_email','public_whatsapp','public_map_url','seasonal_theme',
    'hero_image','about_image',
    'gallery_image_1','gallery_image_2','gallery_image_3','gallery_image_4','gallery_image_5',
    'workshop_pottery_image','workshop_handbuilding_image','workshop_embroidery_image',
    'booking_embed_default'
  ])
  OR key LIKE 'site_image_%'
  OR key LIKE 'media_ratio_%'
  OR key LIKE 'media_frame_%'
  OR key LIKE 'image_%'
  OR key LIKE 'gallery_%'
  OR key LIKE 'workshop_config_%'
  OR key LIKE 'booking_embed_%'
);