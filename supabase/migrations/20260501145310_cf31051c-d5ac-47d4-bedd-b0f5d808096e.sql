CREATE OR REPLACE FUNCTION public.trigger_booking_app_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  base_functions_url text := 'https://akwjovwwqpgsftshlgth.supabase.co/functions/v1';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImFrd2pvdnd3cXBnc2Z0c2hsZ3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjY0MTEsImV4cCI6MjA4NjYwMjQxMX0.2jbEcOjNwbobVJEskxmnG-D4WCIXjltfNF5REY6rxy0';
begin
  if new.email is not null and length(trim(new.email)) > 0 then
    perform net.http_post(
      url := base_functions_url || '/send-transactional-email',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || anon_key, 'apikey', anon_key),
      body := jsonb_build_object('templateName', 'booking-confirmation', 'recipientEmail', new.email, 'idempotencyKey', 'booking-confirm-' || new.id::text, 'templateData', jsonb_build_object('name', new.name, 'workshop', new.workshop, 'date', coalesce(new.booking_date, ''), 'participants', coalesce(new.participants, 1), 'city', coalesce(new.city, ''), 'sessionInfo', coalesce(new.session_info, '')))
    );
  end if;

  perform net.http_post(
    url := base_functions_url || '/send-transactional-email',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || anon_key, 'apikey', anon_key),
    body := jsonb_build_object('templateName', 'booking-admin-notification', 'recipientEmail', 'errachidyothmane@gmail.com', 'idempotencyKey', 'booking-admin-' || new.id::text || '-errachidyothmane@gmail.com', 'templateData', jsonb_build_object('name', new.name, 'email', coalesce(new.email, ''), 'phone', coalesce(new.phone, ''), 'workshop', new.workshop, 'date', coalesce(new.booking_date, ''), 'participants', coalesce(new.participants, 1), 'city', coalesce(new.city, ''), 'sessionInfo', coalesce(new.session_info, ''), 'notes', coalesce(new.notes, '')))
  );

  perform net.http_post(
    url := base_functions_url || '/send-transactional-email',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || anon_key, 'apikey', anon_key),
    body := jsonb_build_object('templateName', 'booking-admin-notification', 'recipientEmail', 'terraria.socials@gmail.com', 'idempotencyKey', 'booking-admin-' || new.id::text || '-terraria.socials@gmail.com', 'templateData', jsonb_build_object('name', new.name, 'email', coalesce(new.email, ''), 'phone', coalesce(new.phone, ''), 'workshop', new.workshop, 'date', coalesce(new.booking_date, ''), 'participants', coalesce(new.participants, 1), 'city', coalesce(new.city, ''), 'sessionInfo', coalesce(new.session_info, ''), 'notes', coalesce(new.notes, '')))
  );

  perform net.http_post(
    url := base_functions_url || '/send-notification',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || anon_key, 'apikey', anon_key),
    body := jsonb_build_object('type', 'booking', 'data', jsonb_build_object('skipPersist', true, 'name', new.name, 'email', coalesce(new.email, ''), 'phone', coalesce(new.phone, ''), 'workshop', new.workshop, 'date', coalesce(new.booking_date, ''), 'participants', coalesce(new.participants, 1), 'city', coalesce(new.city, ''), 'sessionInfo', coalesce(new.session_info, ''), 'notes', coalesce(new.notes, '')))
  );

  return new;
exception when others then
  raise warning 'trigger_booking_app_emails failed: %', sqlerrm;
  return new;
end;
$$;

REVOKE ALL ON FUNCTION public.trigger_booking_app_emails() FROM public;
REVOKE ALL ON FUNCTION public.trigger_booking_app_emails() FROM anon;
REVOKE ALL ON FUNCTION public.trigger_booking_app_emails() FROM authenticated;