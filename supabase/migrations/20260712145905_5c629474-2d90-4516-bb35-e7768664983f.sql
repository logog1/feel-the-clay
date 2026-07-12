-- Restrict LIST/enumeration on public image buckets to admins.
-- Public buckets still serve files by direct URL; only the list API is affected.
DROP POLICY IF EXISTS "Product images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Site images are publicly viewable" ON storage.objects;

CREATE POLICY "Admins can list product images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can list site images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'site-images' AND public.is_admin());