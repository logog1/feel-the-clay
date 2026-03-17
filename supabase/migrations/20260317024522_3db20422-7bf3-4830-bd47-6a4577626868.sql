DROP POLICY IF EXISTS "Public can read safe settings" ON public.site_settings;

CREATE POLICY "Public can read safe settings"
ON public.site_settings
FOR SELECT
TO public
USING (
  (key = ANY (ARRAY[
    'public_email'::text, 'public_whatsapp'::text, 'public_map_url'::text,
    'seasonal_theme'::text, 'hero_image'::text, 'about_image'::text,
    'gallery_image_1'::text, 'gallery_image_2'::text, 'gallery_image_3'::text,
    'gallery_image_4'::text, 'gallery_image_5'::text,
    'workshop_pottery_image'::text, 'workshop_handbuilding_image'::text, 'workshop_embroidery_image'::text
  ]))
  OR (key ~~ 'site_image_%'::text)
  OR (key ~~ 'media_ratio_%'::text)
  OR (key ~~ 'media_frame_%'::text)
  OR (key ~~ 'image_%'::text)
  OR (key ~~ 'gallery_%'::text)
);