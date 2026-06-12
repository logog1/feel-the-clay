
ALTER TABLE public.sofitel_bookings
  ADD COLUMN IF NOT EXISTS gross_amount numeric,
  ADD COLUMN IF NOT EXISTS price_per_person numeric,
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS commission_rate numeric,
  ADD COLUMN IF NOT EXISTS commission_amount numeric,
  ADD COLUMN IF NOT EXISTS commission_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;

CREATE INDEX IF NOT EXISTS sofitel_bookings_partner_status_idx
  ON public.sofitel_bookings(partner_id, status);

CREATE OR REPLACE FUNCTION public.handle_sofitel_booking_lifecycle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
    IF NEW.partner_id IS NOT NULL
       AND COALESCE(NEW.gross_amount, 0) > 0
       AND COALESCE(NEW.commission_rate, 0) > 0 THEN
      NEW.commission_amount := ROUND((NEW.gross_amount * NEW.commission_rate / 100.0)::numeric, 2);
      IF NEW.commission_status <> 'paid' THEN
        NEW.commission_status := 'due';
      END IF;
    END IF;
  END IF;

  IF NEW.status = 'cancelled' AND (OLD.status IS DISTINCT FROM 'cancelled') THEN
    NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
    NEW.commission_status := 'void';
    NEW.commission_amount := 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sofitel_booking_lifecycle ON public.sofitel_bookings;
CREATE TRIGGER sofitel_booking_lifecycle
  BEFORE UPDATE ON public.sofitel_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_sofitel_booking_lifecycle();

-- Ensure partner staff can UPDATE their bookings (lifecycle changes)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sofitel_bookings' AND policyname='Partner staff update own sofitel bookings') THEN
    DROP POLICY "Partner staff update own sofitel bookings" ON public.sofitel_bookings;
  END IF;
END $$;

CREATE POLICY "Partner staff update own sofitel bookings"
  ON public.sofitel_bookings FOR UPDATE TO authenticated
  USING (partner_id IS NOT NULL AND public.is_partner_staff(auth.uid(), partner_id))
  WITH CHECK (partner_id IS NOT NULL AND public.is_partner_staff(auth.uid(), partner_id));
