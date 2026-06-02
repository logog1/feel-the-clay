-- Partner staff assignments (which user can access which partner concierge)
CREATE TABLE public.partner_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  user_id uuid NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_staff TO authenticated;
GRANT ALL ON public.partner_staff TO service_role;

ALTER TABLE public.partner_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage partner staff"
  ON public.partner_staff FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Staff read own assignments"
  ON public.partner_staff FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Helper: is this user staff for this partner?
CREATE OR REPLACE FUNCTION public.is_partner_staff(_user_id uuid, _partner_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_staff
    WHERE user_id = _user_id AND partner_id = _partner_id
  )
$$;

-- Tighten hotel_staff RLS to per-partner scope
DROP POLICY IF EXISTS "Hotel staff read sofitel bookings" ON public.sofitel_bookings;
CREATE POLICY "Hotel staff read assigned bookings"
  ON public.sofitel_bookings FOR SELECT TO authenticated
  USING (partner_id IS NOT NULL AND public.is_partner_staff(auth.uid(), partner_id));

CREATE POLICY "Hotel staff update assigned bookings"
  ON public.sofitel_bookings FOR UPDATE TO authenticated
  USING (partner_id IS NOT NULL AND public.is_partner_staff(auth.uid(), partner_id));

DROP POLICY IF EXISTS "Hotel staff read group requests" ON public.sofitel_group_requests;
CREATE POLICY "Hotel staff read assigned group requests"
  ON public.sofitel_group_requests FOR SELECT TO authenticated
  USING (partner_id IS NOT NULL AND public.is_partner_staff(auth.uid(), partner_id));
