
CREATE TABLE public.zellige_kit_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  colors JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.zellige_kit_collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.zellige_kit_collections TO authenticated;
GRANT ALL ON public.zellige_kit_collections TO service_role;

ALTER TABLE public.zellige_kit_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published collections"
  ON public.zellige_kit_collections
  FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage collections"
  ON public.zellige_kit_collections
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER zellige_kit_collections_touch
  BEFORE UPDATE ON public.zellige_kit_collections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Update site_settings public read policy to allow kit_zellige_* keys
DROP POLICY IF EXISTS "Public can read safe settings" ON public.site_settings;
CREATE POLICY "Public can read safe settings"
  ON public.site_settings
  FOR SELECT
  USING (
    (
      (key = ANY (ARRAY['public_email','public_whatsapp','public_map_url','seasonal_theme','hero_image','about_image','gallery_image_1','gallery_image_2','gallery_image_3','gallery_image_4','gallery_image_5','workshop_pottery_image','workshop_handbuilding_image','workshop_embroidery_image','booking_embed_default']))
      OR key LIKE 'site_image_%'
      OR key LIKE 'media_ratio_%'
      OR key LIKE 'media_frame_%'
      OR key LIKE 'image_%'
      OR key LIKE 'gallery_%'
      OR key LIKE 'workshop_config_%'
      OR key LIKE 'workshop_schedule_%'
      OR key LIKE 'booking_embed_%'
      OR key LIKE 'kit_zellige_%'
    )
    AND key !~* '(secret|token|api[_-]?key|apikey|password|webhook|private|credential|auth)'
  );
