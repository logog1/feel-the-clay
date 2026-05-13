ALTER TABLE public.sofitel_bookings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sofitel_bookings;