
-- 1. Extend bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES public.hotel_partners(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS room_number text,
  ADD COLUMN IF NOT EXISTS gross_amount numeric,
  ADD COLUMN IF NOT EXISTS commission_rate numeric,
  ADD COLUMN IF NOT EXISTS commission_amount numeric,
  ADD COLUMN IF NOT EXISTS commission_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;

CREATE INDEX IF NOT EXISTS bookings_partner_id_idx ON public.bookings(partner_id);
CREATE INDEX IF NOT EXISTS bookings_partner_status_idx ON public.bookings(partner_id, status);

-- 2. Commission lifecycle trigger
CREATE OR REPLACE FUNCTION public.handle_booking_status_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Completed -> compute & mark commission due
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
    IF NEW.partner_id IS NOT NULL AND COALESCE(NEW.gross_amount, 0) > 0 AND COALESCE(NEW.commission_rate, 0) > 0 THEN
      NEW.commission_amount := ROUND((NEW.gross_amount * NEW.commission_rate / 100.0)::numeric, 2);
      NEW.commission_status := COALESCE(NULLIF(NEW.commission_status, 'paid'), 'due');
      IF NEW.commission_status <> 'paid' THEN NEW.commission_status := 'due'; END IF;
    END IF;
  END IF;

  -- Cancelled -> void commission
  IF NEW.status = 'cancelled' AND (OLD.status IS DISTINCT FROM 'cancelled') THEN
    NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
    NEW.commission_status := 'void';
    NEW.commission_amount := 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_status_lifecycle ON public.bookings;
CREATE TRIGGER booking_status_lifecycle
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_booking_status_lifecycle();

-- 3. Partner payouts
CREATE TABLE IF NOT EXISTS public.partner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.hotel_partners(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MAD',
  paid_at timestamptz,
  method text,
  reference text,
  notes text,
  booking_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_payouts TO authenticated;
GRANT ALL ON public.partner_payouts TO service_role;
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage payouts"
  ON public.partner_payouts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partner staff read own payouts"
  ON public.partner_payouts FOR SELECT TO authenticated
  USING (public.is_partner_staff(auth.uid(), partner_id));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS partner_payouts_touch ON public.partner_payouts;
CREATE TRIGGER partner_payouts_touch BEFORE UPDATE ON public.partner_payouts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. QR scan log
CREATE TABLE IF NOT EXISTS public.qr_scan_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.hotel_partners(id) ON DELETE CASCADE,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  referrer text
);

GRANT SELECT ON public.qr_scan_log TO authenticated;
GRANT INSERT ON public.qr_scan_log TO anon, authenticated;
GRANT ALL ON public.qr_scan_log TO service_role;
ALTER TABLE public.qr_scan_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log scans"
  ON public.qr_scan_log FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read all scans"
  ON public.qr_scan_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partner staff read own scans"
  ON public.qr_scan_log FOR SELECT TO authenticated
  USING (public.is_partner_staff(auth.uid(), partner_id));

CREATE INDEX IF NOT EXISTS qr_scan_log_partner_time_idx ON public.qr_scan_log(partner_id, scanned_at DESC);

-- 5. Extend bookings RLS for partner staff
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Partner staff read own bookings') THEN
    DROP POLICY "Partner staff read own bookings" ON public.bookings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Partner staff update own bookings') THEN
    DROP POLICY "Partner staff update own bookings" ON public.bookings;
  END IF;
END $$;

CREATE POLICY "Partner staff read own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (partner_id IS NOT NULL AND public.is_partner_staff(auth.uid(), partner_id));

CREATE POLICY "Partner staff update own bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (partner_id IS NOT NULL AND public.is_partner_staff(auth.uid(), partner_id))
  WITH CHECK (partner_id IS NOT NULL AND public.is_partner_staff(auth.uid(), partner_id));
