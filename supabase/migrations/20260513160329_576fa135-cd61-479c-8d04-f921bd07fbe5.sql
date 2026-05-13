
-- Group experience requests from Sofitel concierge for custom/group sessions
CREATE TABLE public.sofitel_group_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preferred_date date NOT NULL,
  preferred_time text,
  group_size integer NOT NULL DEFAULT 4,
  experience_type text,
  contact_name text NOT NULL,
  contact_email text,
  contact_phone text,
  room_number text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'sofitel_hotel',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sofitel_group_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit group requests"
  ON public.sofitel_group_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins manage group requests"
  ON public.sofitel_group_requests FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Hotel staff read group requests"
  ON public.sofitel_group_requests FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'hotel_staff'::app_role));

CREATE TRIGGER trg_sofitel_group_requests_updated
  BEFORE UPDATE ON public.sofitel_group_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_products_updated_at();

-- Public availability function: combines workshop blackouts + sofitel session load
-- Returns day-by-day status for next ~90 days
CREATE OR REPLACE FUNCTION public.get_terraria_availability(_days integer DEFAULT 60)
RETURNS TABLE(day date, status text, bookings_count integer, sofitel_sessions integer, is_blocked boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH days AS (
    SELECT (CURRENT_DATE + i)::date AS day
    FROM generate_series(0, GREATEST(_days, 1) - 1) i
  ),
  blocks AS (
    SELECT date::date AS day FROM public.workshop_availability WHERE is_available = false
  ),
  bks AS (
    SELECT booking_date::date AS day, COUNT(*)::int AS c
    FROM public.bookings
    WHERE booking_date IS NOT NULL AND status <> 'cancelled' AND booking_date ~ '^\d{4}-\d{2}-\d{2}'
    GROUP BY 1
  ),
  sofs AS (
    SELECT (scheduled_at AT TIME ZONE 'UTC')::date AS day, COUNT(*)::int AS c
    FROM public.sofitel_experiences
    WHERE is_active = true
    GROUP BY 1
  )
  SELECT
    d.day,
    CASE
      WHEN bl.day IS NOT NULL THEN 'blocked'
      WHEN COALESCE(bks.c,0) + COALESCE(sofs.c,0) >= 4 THEN 'full'
      WHEN COALESCE(bks.c,0) + COALESCE(sofs.c,0) >= 2 THEN 'limited'
      ELSE 'open'
    END AS status,
    COALESCE(bks.c, 0),
    COALESCE(sofs.c, 0),
    bl.day IS NOT NULL
  FROM days d
  LEFT JOIN blocks bl ON bl.day = d.day
  LEFT JOIN bks ON bks.day = d.day
  LEFT JOIN sofs ON sofs.day = d.day
  ORDER BY d.day;
$$;

GRANT EXECUTE ON FUNCTION public.get_terraria_availability(integer) TO anon, authenticated;
