
-- 1. partner_qr_variants
CREATE TABLE public.partner_qr_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.hotel_partners(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL,
  scope text NOT NULL DEFAULT 'room' CHECK (scope IN ('property','room','staff','event')),
  room_number text,
  staff_user_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_qr_variants TO authenticated;
GRANT ALL ON public.partner_qr_variants TO service_role;

ALTER TABLE public.partner_qr_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage qr variants"
  ON public.partner_qr_variants FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Staff read own partner variants"
  ON public.partner_qr_variants FOR SELECT
  TO authenticated
  USING (public.is_partner_staff(auth.uid(), partner_id));

CREATE TRIGGER touch_partner_qr_variants
  BEFORE UPDATE ON public.partner_qr_variants
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. qr_scan_log new columns
ALTER TABLE public.qr_scan_log
  ADD COLUMN IF NOT EXISTS variant_code text,
  ADD COLUMN IF NOT EXISTS variant_label text,
  ADD COLUMN IF NOT EXISTS variant_scope text,
  ADD COLUMN IF NOT EXISTS ip_hash text,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS booking_id uuid;

CREATE INDEX IF NOT EXISTS qr_scan_log_partner_time_idx ON public.qr_scan_log(partner_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS qr_scan_log_variant_idx ON public.qr_scan_log(partner_id, variant_code);

-- Allow staff to read their property's scan log
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_scan_log' AND policyname='Staff read own partner scans'
  ) THEN
    CREATE POLICY "Staff read own partner scans"
      ON public.qr_scan_log FOR SELECT
      TO authenticated
      USING (public.is_partner_staff(auth.uid(), partner_id) OR public.has_role(auth.uid(),'admin'));
  END IF;
END $$;

-- 3. bookings + sofitel_bookings variant columns
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS qr_variant_code text,
  ADD COLUMN IF NOT EXISTS qr_variant_scope text;

ALTER TABLE public.sofitel_bookings
  ADD COLUMN IF NOT EXISTS qr_variant_code text,
  ADD COLUMN IF NOT EXISTS qr_variant_scope text;

-- 4. Make sure staff can read payouts for their property
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partner_payouts' AND policyname='Staff read own partner payouts'
  ) THEN
    CREATE POLICY "Staff read own partner payouts"
      ON public.partner_payouts FOR SELECT
      TO authenticated
      USING (public.is_partner_staff(auth.uid(), partner_id) OR public.has_role(auth.uid(),'admin'));
  END IF;
END $$;
