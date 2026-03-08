DROP FUNCTION IF EXISTS public.list_users_with_roles();

CREATE FUNCTION public.list_users_with_roles()
 RETURNS TABLE(user_id uuid, email text, created_at timestamp with time zone, role text, last_sign_in_at timestamp with time zone, profile_type text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT
    u.id as user_id,
    u.email::text,
    u.created_at,
    COALESCE(ur.role::text, 'pending') as role,
    u.last_sign_in_at,
    COALESCE(ur.profile_type, 'general') as profile_type
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  ORDER BY u.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.set_user_profile_type(_target_user_id uuid, _profile_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  UPDATE public.user_roles SET profile_type = _profile_type WHERE user_id = _target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_profile_type()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(profile_type, 'general') FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;