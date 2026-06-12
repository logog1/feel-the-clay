
CREATE OR REPLACE FUNCTION public.get_partner_commission_rate(_partner_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT commission_rate FROM public.hotel_partners
  WHERE id = _partner_id AND is_active = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_partner_commission_rate(uuid) TO anon, authenticated;
