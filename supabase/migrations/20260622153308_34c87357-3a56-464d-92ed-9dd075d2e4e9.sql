
CREATE OR REPLACE FUNCTION public.enforce_experience_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exp_capacity INT;
  taken INT;
  new_participants INT;
BEGIN
  -- Only check on inserts / when participants or status change toward active
  IF (TG_OP = 'UPDATE') AND NEW.status = OLD.status AND NEW.participants = OLD.participants AND NEW.experience_id = OLD.experience_id THEN
    RETURN NEW;
  END IF;

  -- Cancelled bookings never count toward capacity
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  SELECT capacity INTO exp_capacity FROM public.sofitel_experiences WHERE id = NEW.experience_id;
  IF exp_capacity IS NULL THEN
    RETURN NEW; -- no capacity set, skip
  END IF;

  SELECT COALESCE(SUM(participants), 0) INTO taken
  FROM public.sofitel_bookings
  WHERE experience_id = NEW.experience_id
    AND status <> 'cancelled'
    AND (TG_OP = 'INSERT' OR id <> NEW.id);

  new_participants := COALESCE(NEW.participants, 1);

  IF taken + new_participants > exp_capacity THEN
    RAISE EXCEPTION 'Capacity exceeded: only % spots remaining for this session', GREATEST(exp_capacity - taken, 0)
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_experience_capacity ON public.sofitel_bookings;
CREATE TRIGGER trg_enforce_experience_capacity
BEFORE INSERT OR UPDATE ON public.sofitel_bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_experience_capacity();
