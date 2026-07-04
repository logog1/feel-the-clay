
-- 1) Terms acceptance tracking
ALTER TABLE public.hotel_partners
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT;

ALTER TABLE public.partner_staff
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT,
  ADD COLUMN IF NOT EXISTS terms_accepted_ip TEXT;

-- 2) Partner kit orders
CREATE TABLE IF NOT EXISTS public.partner_kit_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.hotel_partners(id) ON DELETE CASCADE,
  kit_type TEXT NOT NULL DEFAULT 'welcome',
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'requested',
  tracking_number TEXT,
  courier TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  requested_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.partner_kit_orders TO authenticated;
GRANT ALL ON public.partner_kit_orders TO service_role;

ALTER TABLE public.partner_kit_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all kit orders"
  ON public.partner_kit_orders
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff view own partner kit orders"
  ON public.partner_kit_orders
  FOR SELECT
  TO authenticated
  USING (public.is_partner_staff(auth.uid(), partner_id));

CREATE POLICY "Staff request kits for own partner"
  ON public.partner_kit_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_partner_staff(auth.uid(), partner_id));

CREATE INDEX IF NOT EXISTS partner_kit_orders_partner_idx
  ON public.partner_kit_orders (partner_id, created_at DESC);

CREATE TRIGGER partner_kit_orders_touch_updated_at
  BEFORE UPDATE ON public.partner_kit_orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
