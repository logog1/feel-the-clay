
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_en text NOT NULL DEFAULT '',
  title_ar text NOT NULL DEFAULT '',
  title_es text NOT NULL DEFAULT '',
  title_fr text NOT NULL DEFAULT '',
  excerpt_en text NOT NULL DEFAULT '',
  excerpt_ar text NOT NULL DEFAULT '',
  excerpt_es text NOT NULL DEFAULT '',
  excerpt_fr text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_es text NOT NULL DEFAULT '',
  content_fr text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'pottery',
  published_at date NOT NULL DEFAULT CURRENT_DATE,
  read_time integer NOT NULL DEFAULT 5,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog posts are publicly viewable" ON public.blog_posts
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
