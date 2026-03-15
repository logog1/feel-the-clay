-- 1. Fix site_settings: restrict public SELECT to only safe keys
DROP POLICY IF EXISTS "Settings are publicly readable" ON public.site_settings;

CREATE POLICY "Public can read safe settings" ON public.site_settings
FOR SELECT TO public
USING (
  key IN (
    'public_email', 'public_whatsapp', 'public_map_url',
    'seasonal_theme',
    'hero_image', 'about_image', 'gallery_image_1', 'gallery_image_2',
    'gallery_image_3', 'gallery_image_4', 'gallery_image_5',
    'workshop_pottery_image', 'workshop_handbuilding_image', 'workshop_embroidery_image'
  )
  OR key LIKE 'site_image_%'
);

-- 2. Fix blog_posts: only show published posts publicly
DROP POLICY IF EXISTS "Blog posts are publicly viewable" ON public.blog_posts;

CREATE POLICY "Published blog posts are publicly viewable" ON public.blog_posts
FOR SELECT TO public
USING (is_published = true);