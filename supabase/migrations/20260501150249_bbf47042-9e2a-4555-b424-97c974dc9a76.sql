CREATE TABLE IF NOT EXISTS public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  recipient text NOT NULL,
  status text NOT NULL,
  error_message text,
  booking_id uuid,
  idempotency_key text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_booking ON public.notification_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_idem ON public.notification_log(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_notification_log_created ON public.notification_log(created_at DESC);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read notification log"
  ON public.notification_log FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Service role can insert notification log"
  ON public.notification_log FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');