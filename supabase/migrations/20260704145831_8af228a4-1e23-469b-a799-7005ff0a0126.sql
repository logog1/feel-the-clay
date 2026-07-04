
CREATE OR REPLACE FUNCTION public.snapshot_partner_commission_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.partner_id IS NOT NULL AND NEW.commission_rate IS NULL THEN
    SELECT commission_rate INTO NEW.commission_rate
    FROM public.hotel_partners
    WHERE id = NEW.partner_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS snapshot_commission_rate_bookings ON public.bookings;
CREATE TRIGGER snapshot_commission_rate_bookings
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.snapshot_partner_commission_rate();

DROP TRIGGER IF EXISTS snapshot_commission_rate_sofitel_bookings ON public.sofitel_bookings;
CREATE TRIGGER snapshot_commission_rate_sofitel_bookings
BEFORE INSERT ON public.sofitel_bookings
FOR EACH ROW
EXECUTE FUNCTION public.snapshot_partner_commission_rate();
