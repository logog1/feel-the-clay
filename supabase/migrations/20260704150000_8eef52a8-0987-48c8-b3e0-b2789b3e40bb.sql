
CREATE INDEX IF NOT EXISTS partner_staff_user_partner_idx
  ON public.partner_staff (user_id, partner_id);

CREATE UNIQUE INDEX IF NOT EXISTS partner_staff_partner_user_unique
  ON public.partner_staff (partner_id, user_id);
