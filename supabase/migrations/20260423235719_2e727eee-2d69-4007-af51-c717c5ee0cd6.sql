UPDATE public.bookings SET status='confirmed' WHERE id='614f2a44-9c4b-4386-9e33-fb9fb8d46e43';
INSERT INTO public.site_settings (key, value) VALUES ('booking_reminder_sms_fallback', 'always')
  ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now();
INSERT INTO public.site_settings (key, value) VALUES ('booking_reminder_mode', 'evening_before')
  ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now();