
-- Trigger-only functions: no app role should call these
REVOKE EXECUTE ON FUNCTION public.update_products_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_booking_to_customer() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_booking_app_emails() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_sofitel_booking_lifecycle() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_booking_status_lifecycle() FROM PUBLIC, anon, authenticated;

-- Internal pgmq queue helpers: edge functions use service_role, anon/auth must not call
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- Admin-only role-management functions: self-check inside, but no anon access needed
REVOKE EXECUTE ON FUNCTION public.list_users_with_roles() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_user_profile_type(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.remove_user_role(uuid) FROM PUBLIC, anon;

-- Anonymous visitors don't need these auth-only helpers
REVOKE EXECUTE ON FUNCTION public.get_my_profile_type() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_partner_staff(uuid, uuid) FROM anon;
