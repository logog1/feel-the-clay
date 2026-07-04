
CREATE OR REPLACE FUNCTION public.guard_partner_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n_bookings int;
  n_sofitel int;
  n_payouts int;
BEGIN
  SELECT COUNT(*) INTO n_bookings FROM public.bookings WHERE partner_id = OLD.id;
  SELECT COUNT(*) INTO n_sofitel  FROM public.sofitel_bookings WHERE partner_id = OLD.id;
  SELECT COUNT(*) INTO n_payouts  FROM public.partner_payouts WHERE partner_id = OLD.id;

  IF (n_bookings + n_sofitel + n_payouts) > 0 THEN
    RAISE EXCEPTION
      'Cannot delete partner "%": it has % booking(s), % sofitel booking(s), and % payout(s) on file. Set is_active = false to deactivate instead.',
      OLD.name, n_bookings, n_sofitel, n_payouts
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS guard_hotel_partners_delete ON public.hotel_partners;
CREATE TRIGGER guard_hotel_partners_delete
BEFORE DELETE ON public.hotel_partners
FOR EACH ROW EXECUTE FUNCTION public.guard_partner_delete();
