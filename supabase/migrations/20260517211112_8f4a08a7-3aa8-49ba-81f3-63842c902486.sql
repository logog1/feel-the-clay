CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  organization TEXT,
  satisfaction TEXT,
  recommendation TEXT,
  length_appropriate TEXT,
  expectations TEXT,
  facilitators TEXT,
  materials TEXT,
  source TEXT,
  liked_most TEXT,
  suggestions TEXT,
  effectiveness TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
ON public.feedback FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view feedback"
ON public.feedback FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update feedback"
ON public.feedback FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete feedback"
ON public.feedback FOR DELETE
USING (public.is_admin());