
-- Sofitel partner module: curated experiences + guest bookings
CREATE TABLE public.sofitel_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text NOT NULL DEFAULT '',
  cover_image text,
  category text NOT NULL DEFAULT 'in-hotel',
  audience text NOT NULL DEFAULT 'all',
  duration_minutes integer NOT NULL DEFAULT 90,
  difficulty text NOT NULL DEFAULT 'easy',
  price_per_person numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MAD',
  capacity integer NOT NULL DEFAULT 8,
  location text,
  scheduled_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sofitel_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.sofitel_experiences(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  room_number text NOT NULL,
  guest_email text,
  guest_phone text,
  participants integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  source text NOT NULL DEFAULT 'guest_qr',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sofitel_exp_scheduled ON public.sofitel_experiences(scheduled_at);
CREATE INDEX idx_sofitel_bookings_exp ON public.sofitel_bookings(experience_id);

ALTER TABLE public.sofitel_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sofitel_bookings ENABLE ROW LEVEL SECURITY;

-- Experiences: public can read active ones; admins manage
CREATE POLICY "Active experiences are publicly viewable"
  ON public.sofitel_experiences FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage experiences"
  ON public.sofitel_experiences FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Bookings: anyone can create; admins read/manage
CREATE POLICY "Anyone can create sofitel bookings"
  ON public.sofitel_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read sofitel bookings"
  ON public.sofitel_bookings FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "Admins update sofitel bookings"
  ON public.sofitel_bookings FOR UPDATE
  TO authenticated USING (is_admin());

CREATE POLICY "Admins delete sofitel bookings"
  ON public.sofitel_bookings FOR DELETE
  TO authenticated USING (is_admin());

CREATE TRIGGER trg_sofitel_exp_updated_at
  BEFORE UPDATE ON public.sofitel_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_products_updated_at();
