
-- Role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer helper: check role without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Convenience: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- user_roles: only admins can read roles
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  email TEXT,
  phone TEXT,
  workshop TEXT NOT NULL,
  session_info TEXT,
  participants INT DEFAULT 1,
  booking_date TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public insert (from edge function using service role), admin-only read/update/delete
CREATE POLICY "Admins can view bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.is_admin());

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  region TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.is_admin());
