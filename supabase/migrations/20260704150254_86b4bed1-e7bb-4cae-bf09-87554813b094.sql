
CREATE OR REPLACE FUNCTION public.notify_partner_of_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_functions_url text := 'https://akwjovwwqpgsftshlgth.supabase.co/functions/v1';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrd2pvdnd3cXBnc2Z0c2hsZ3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjY0MTEsImV4cCI6MjA4NjYwMjQxMX0.2jbEcOjNwbobVJEskxmnG-D4WCIXjltfNF5REY6rxy0';
  p RECORD;
  exp_title text;
  exp_when text;
  gross_txt text;
  comm_txt text;
  guest_name text;
  guest_email text;
  guest_phone text;
  room_num text;
  participants_n int;
  currency_txt text;
  idem text;
BEGIN
  IF NEW.partner_id IS NULL THEN RETURN NEW; END IF;

  SELECT id, name, slug, contact_email, brand_color
    INTO p FROM public.hotel_partners WHERE id = NEW.partner_id;
  IF p.contact_email IS NULL OR length(trim(p.contact_email)) = 0 THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'sofitel_bookings' THEN
    guest_name := NEW.guest_name;
    guest_email := NEW.guest_email;
    guest_phone := NEW.guest_phone;
    room_num := NEW.room_number;
    participants_n := COALESCE(NEW.participants, 1);
    currency_txt := COALESCE(NEW.currency, 'MAD');
    SELECT title, to_char(scheduled_at, 'YYYY-MM-DD HH24:MI')
      INTO exp_title, exp_when
      FROM public.sofitel_experiences WHERE id = NEW.experience_id;
  ELSE
    guest_name := NEW.name;
    guest_email := NEW.email;
    guest_phone := NEW.phone;
    room_num := NULL;
    participants_n := COALESCE(NEW.participants, 1);
    currency_txt := 'MAD';
    exp_title := NEW.workshop;
    exp_when := COALESCE(NEW.booking_date, '');
  END IF;

  gross_txt := CASE WHEN NEW.gross_amount IS NOT NULL THEN NEW.gross_amount::text ELSE NULL END;
  comm_txt := CASE WHEN NEW.commission_amount IS NOT NULL THEN NEW.commission_amount::text ELSE NULL END;

  idem := 'partner-new-booking-' || NEW.id::text;

  PERFORM net.http_post(
    url := base_functions_url || '/send-transactional-email',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || anon_key,'apikey', anon_key),
    body := jsonb_build_object(
      'templateName','partner-new-booking',
      'recipientEmail', p.contact_email,
      'idempotencyKey', idem,
      'templateData', jsonb_build_object(
        'partnerName', p.name,
        'brandColor', p.brand_color,
        'guestName', guest_name,
        'roomNumber', room_num,
        'guestEmail', guest_email,
        'guestPhone', guest_phone,
        'experience', exp_title,
        'scheduledAt', exp_when,
        'participants', participants_n,
        'grossAmount', gross_txt,
        'commissionRate', NEW.commission_rate,
        'commissionAmount', comm_txt,
        'currency', currency_txt,
        'source', COALESCE(NEW.source, 'direct'),
        'conciergeUrl', 'https://terrariaworkshops.com/partners/' || p.slug || '/concierge'
      )
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_partner_of_booking failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_partner_sofitel_booking ON public.sofitel_bookings;
CREATE TRIGGER notify_partner_sofitel_booking
AFTER INSERT ON public.sofitel_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_partner_of_booking();

DROP TRIGGER IF EXISTS notify_partner_booking ON public.bookings;
CREATE TRIGGER notify_partner_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
WHEN (NEW.partner_id IS NOT NULL)
EXECUTE FUNCTION public.notify_partner_of_booking();
