
-- Allow every authenticated user to read their own role row.
-- Needed so the login page can detect hotel_staff and route them to the
-- correct concierge dashboard instead of the admin dead-end.
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
CREATE POLICY "Users read own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
