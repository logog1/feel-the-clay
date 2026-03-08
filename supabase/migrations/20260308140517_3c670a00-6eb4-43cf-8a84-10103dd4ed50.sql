
-- Accounting ledger table
CREATE TABLE public.accounting_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  type text NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  expense_type text DEFAULT NULL,
  amount numeric NOT NULL DEFAULT 0,
  attachment_url text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage accounting" ON public.accounting_entries
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Customers table (aggregated from bookings + manual entries)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text DEFAULT NULL,
  phone text DEFAULT NULL,
  city text DEFAULT NULL,
  source text NOT NULL DEFAULT 'website',
  notes text DEFAULT NULL,
  total_bookings integer NOT NULL DEFAULT 0,
  from_website boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customers" ON public.customers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Trigger to sync new bookings to customers table
CREATE OR REPLACE FUNCTION public.sync_booking_to_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (name, email, phone, city, source, from_website, total_bookings)
  VALUES (NEW.name, NEW.email, NEW.phone, NEW.city, 'website', true, 1)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- We need a unique constraint on email for upsert to work
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique ON public.customers (email) WHERE email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_booking_to_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    INSERT INTO public.customers (name, email, phone, city, source, from_website, total_bookings)
    VALUES (NEW.name, NEW.email, NEW.phone, NEW.city, 'website', true, 1)
    ON CONFLICT (email) DO UPDATE SET
      total_bookings = public.customers.total_bookings + 1,
      updated_at = now();
  ELSE
    INSERT INTO public.customers (name, phone, city, source, from_website, total_bookings)
    VALUES (NEW.name, NEW.phone, NEW.city, 'website', true, 1);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_insert_sync_customer
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_booking_to_customer();

-- Enable realtime for customers
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
