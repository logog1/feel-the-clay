
-- Workshop cities table
CREATE TABLE public.workshop_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL,
  workshop text NOT NULL DEFAULT 'all',
  is_active boolean NOT NULL DEFAULT true,
  schedule jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Workshop city pricing (session-based per city)
CREATE TABLE public.workshop_city_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.workshop_cities(id) ON DELETE CASCADE,
  session_type text NOT NULL DEFAULT 'open',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MAD',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(city_id, session_type)
);

-- Enable RLS
ALTER TABLE public.workshop_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_city_pricing ENABLE ROW LEVEL SECURITY;

-- RLS policies for workshop_cities
CREATE POLICY "Cities are publicly viewable" ON public.workshop_cities FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage cities" ON public.workshop_cities FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- RLS policies for workshop_city_pricing
CREATE POLICY "Pricing is publicly viewable" ON public.workshop_city_pricing FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage pricing" ON public.workshop_city_pricing FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
