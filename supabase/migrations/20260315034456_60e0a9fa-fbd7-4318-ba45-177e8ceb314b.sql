CREATE TABLE public.google_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  text text NOT NULL DEFAULT '',
  relative_time_description text,
  profile_photo_url text,
  fetched_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable" ON public.google_reviews
FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage reviews" ON public.google_reviews
FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());