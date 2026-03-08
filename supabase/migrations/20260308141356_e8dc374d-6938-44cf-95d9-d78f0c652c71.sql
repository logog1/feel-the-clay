
-- Marketing items table
CREATE TABLE public.marketing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'post',
  status text NOT NULL DEFAULT 'idea',
  platform text DEFAULT NULL,
  assignee text DEFAULT NULL,
  due_date date DEFAULT NULL,
  notes text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage marketing" ON public.marketing_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Inventory items table
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  quantity integer NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 5,
  unit text NOT NULL DEFAULT 'pcs',
  status text NOT NULL DEFAULT 'in_stock',
  linked_workshop text DEFAULT NULL,
  notes text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage inventory" ON public.inventory_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Employees table
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'instructor',
  email text DEFAULT NULL,
  phone text DEFAULT NULL,
  avatar_url text DEFAULT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Automations table
CREATE TABLE public.automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT NULL,
  enabled boolean NOT NULL DEFAULT false,
  trigger_type text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage automations" ON public.automations
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed default automations
INSERT INTO public.automations (name, description, trigger_type, enabled) VALUES
  ('Send booking confirmation email', 'Automatically send confirmation email when a booking is confirmed', 'on_status_change', true),
  ('Send order notification', 'Notify owner when a new order is placed', 'on_insert', true),
  ('24h booking reminder', 'Send reminder to customer 24h before their booking', 'scheduled', true),
  ('Monthly report email', 'Send monthly summary report on the 1st of each month', 'scheduled', true),
  ('Low stock alert', 'Alert when inventory item falls below minimum quantity', 'on_update', false),
  ('Welcome email to new customers', 'Send welcome email when a new customer is synced from website', 'on_insert', false);
