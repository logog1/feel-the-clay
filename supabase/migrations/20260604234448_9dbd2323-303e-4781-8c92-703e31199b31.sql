
ALTER TABLE public.hotel_partners
  ADD COLUMN IF NOT EXISTS rooms_count integer,
  ADD COLUMN IF NOT EXISTS qr_codes_installed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2),
  ADD COLUMN IF NOT EXISTS commission_notes text,
  ADD COLUMN IF NOT EXISTS partnership_status text NOT NULL DEFAULT 'prospect',
  ADD COLUMN IF NOT EXISTS partnership_started_on date,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS stars integer,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS booking_channel text,
  ADD COLUMN IF NOT EXISTS languages_spoken text[];
