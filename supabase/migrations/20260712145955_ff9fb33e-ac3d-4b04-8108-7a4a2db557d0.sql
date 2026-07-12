-- Trigger functions: no one should call these via the API
REVOKE ALL ON FUNCTION public.enforce_experience_capacity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_partner_delete() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.snapshot_partner_commission_rate() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_partner_of_booking() FROM PUBLIC, anon, authenticated;

-- Requires an auth session to be meaningful
REVOKE EXECUTE ON FUNCTION public.get_my_profile_type() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile_type() TO authenticated;