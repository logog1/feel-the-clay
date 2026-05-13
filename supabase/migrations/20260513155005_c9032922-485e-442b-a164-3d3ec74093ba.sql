
-- Hotel staff can read all sofitel bookings
CREATE POLICY "Hotel staff read sofitel bookings"
  ON public.sofitel_bookings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'hotel_staff'));

-- Hotel staff can read all experiences (including inactive for planning visibility)
CREATE POLICY "Hotel staff read all experiences"
  ON public.sofitel_experiences FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'hotel_staff'));
