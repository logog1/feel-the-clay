GRANT INSERT ON public.sofitel_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sofitel_bookings TO authenticated;
GRANT ALL ON public.sofitel_bookings TO service_role;