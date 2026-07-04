REVOKE ALL ON public.partner_staff FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.partner_staff FROM authenticated;
GRANT SELECT ON public.partner_staff TO authenticated;
GRANT UPDATE (terms_accepted_at, terms_version, terms_accepted_ip) ON public.partner_staff TO authenticated;
GRANT ALL ON public.partner_staff TO service_role;

DROP POLICY IF EXISTS "Staff update own terms acceptance" ON public.partner_staff;
CREATE POLICY "Staff update own terms acceptance"
  ON public.partner_staff
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());