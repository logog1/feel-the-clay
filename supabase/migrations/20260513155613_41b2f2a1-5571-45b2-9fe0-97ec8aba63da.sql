CREATE OR REPLACE FUNCTION public.get_sofitel_availability()
RETURNS TABLE(experience_id uuid, taken integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.experience_id, COALESCE(SUM(b.participants), 0)::int AS taken
  FROM public.sofitel_bookings b
  WHERE b.status <> 'cancelled'
  GROUP BY b.experience_id;
$$;

REVOKE ALL ON FUNCTION public.get_sofitel_availability() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_sofitel_availability() TO anon, authenticated;