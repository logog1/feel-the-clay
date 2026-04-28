create or replace function public.trigger_booking_app_emails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or length(trim(new.email)) = 0 then
    return new;
  end if;

  perform net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-transactional-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true),
      'apikey', current_setting('app.settings.supabase_anon_key', true)
    ),
    body := jsonb_build_object(
      'templateName', 'booking-confirmation',
      'recipientEmail', new.email,
      'idempotencyKey', 'booking-confirm-' || new.id::text,
      'templateData', jsonb_build_object(
        'name', new.name,
        'workshop', new.workshop,
        'date', coalesce(new.booking_date, ''),
        'participants', coalesce(new.participants, 1),
        'city', coalesce(new.city, ''),
        'sessionInfo', coalesce(new.session_info, '')
      )
    )
  );

  perform net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-transactional-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true),
      'apikey', current_setting('app.settings.supabase_anon_key', true)
    ),
    body := jsonb_build_object(
      'templateName', 'booking-admin-notification',
      'recipientEmail', 'errachidyothmane@gmail.com',
      'idempotencyKey', 'booking-admin-' || new.id::text || '-errachidyothmane@gmail.com',
      'templateData', jsonb_build_object(
        'name', new.name,
        'email', coalesce(new.email, ''),
        'phone', coalesce(new.phone, ''),
        'workshop', new.workshop,
        'date', coalesce(new.booking_date, ''),
        'participants', coalesce(new.participants, 1),
        'city', coalesce(new.city, ''),
        'sessionInfo', coalesce(new.session_info, ''),
        'notes', coalesce(new.notes, '')
      )
    )
  );

  perform net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-transactional-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true),
      'apikey', current_setting('app.settings.supabase_anon_key', true)
    ),
    body := jsonb_build_object(
      'templateName', 'booking-admin-notification',
      'recipientEmail', 'terraria.socials@gmail.com',
      'idempotencyKey', 'booking-admin-' || new.id::text || '-terraria.socials@gmail.com',
      'templateData', jsonb_build_object(
        'name', new.name,
        'email', coalesce(new.email, ''),
        'phone', coalesce(new.phone, ''),
        'workshop', new.workshop,
        'date', coalesce(new.booking_date, ''),
        'participants', coalesce(new.participants, 1),
        'city', coalesce(new.city, ''),
        'sessionInfo', coalesce(new.session_info, ''),
        'notes', coalesce(new.notes, '')
      )
    )
  );

  return new;
exception when others then
  raise warning 'trigger_booking_app_emails failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists send_booking_app_emails on public.bookings;

create trigger send_booking_app_emails
after insert on public.bookings
for each row
execute function public.trigger_booking_app_emails();