CREATE TRIGGER trg_booking_app_emails
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_booking_app_emails();

CREATE TRIGGER trg_sync_booking_to_customer
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.sync_booking_to_customer();