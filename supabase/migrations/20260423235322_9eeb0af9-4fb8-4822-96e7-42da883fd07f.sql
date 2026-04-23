CREATE OR REPLACE FUNCTION public.sync_booking_to_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_id uuid;
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email <> '' THEN
    SELECT id INTO existing_id FROM public.customers WHERE email = NEW.email LIMIT 1;
    IF existing_id IS NOT NULL THEN
      UPDATE public.customers
        SET total_bookings = total_bookings + 1,
            phone = COALESCE(NEW.phone, phone),
            city = COALESCE(NEW.city, city),
            name = COALESCE(NEW.name, name),
            updated_at = now()
        WHERE id = existing_id;
    ELSE
      INSERT INTO public.customers (name, email, phone, city, source, from_website, total_bookings)
      VALUES (NEW.name, NEW.email, NEW.phone, NEW.city, 'website', true, 1);
    END IF;
  ELSE
    INSERT INTO public.customers (name, phone, city, source, from_website, total_bookings)
    VALUES (NEW.name, NEW.phone, NEW.city, 'website', true, 1);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block the booking insert if customer sync fails
  RAISE WARNING 'sync_booking_to_customer failed: %', SQLERRM;
  RETURN NEW;
END;
$function$;