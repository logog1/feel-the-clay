
-- Products table for admin-managed store inventory
CREATE TABLE public.products (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 1,
  is_sold_out BOOLEAN NOT NULL DEFAULT false,
  is_promotion BOOLEAN NOT NULL DEFAULT false,
  promotion_label TEXT,
  dimensions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products (public store)
CREATE POLICY "Products are publicly viewable"
  ON public.products FOR SELECT USING (true);

-- Only admins can modify products
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE USING (public.is_admin());

-- Workshop availability table
CREATE TABLE public.workshop_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  workshop TEXT NOT NULL DEFAULT 'all',
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workshop_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view available dates
CREATE POLICY "Availability is publicly viewable"
  ON public.workshop_availability FOR SELECT USING (true);

-- Only admins can modify availability
CREATE POLICY "Admins can insert availability"
  ON public.workshop_availability FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update availability"
  ON public.workshop_availability FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete availability"
  ON public.workshop_availability FOR DELETE USING (public.is_admin());

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_products_updated_at();
