
-- Make accounting-receipts bucket private
UPDATE storage.buckets SET public = false WHERE id = 'accounting-receipts';

-- Drop the public SELECT policy if it exists
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can view accounting receipts" ON storage.objects;

-- Admin-only SELECT policy on the bucket
CREATE POLICY "Admins can view accounting receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'accounting-receipts' AND public.is_admin());

-- Admin-only INSERT/UPDATE/DELETE policies on the bucket
DROP POLICY IF EXISTS "Admins can upload accounting receipts" ON storage.objects;
CREATE POLICY "Admins can upload accounting receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'accounting-receipts' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update accounting receipts" ON storage.objects;
CREATE POLICY "Admins can update accounting receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'accounting-receipts' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete accounting receipts" ON storage.objects;
CREATE POLICY "Admins can delete accounting receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'accounting-receipts' AND public.is_admin());
