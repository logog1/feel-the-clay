
-- Create storage bucket for accounting receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('accounting-receipts', 'accounting-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admins to upload receipts
CREATE POLICY "Admins can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'accounting-receipts'
  AND public.is_admin()
);

-- Allow authenticated admins to update receipts
CREATE POLICY "Admins can update receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'accounting-receipts'
  AND public.is_admin()
);

-- Allow authenticated admins to delete receipts
CREATE POLICY "Admins can delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'accounting-receipts'
  AND public.is_admin()
);

-- Allow public read access to receipts (for viewing/downloading)
CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'accounting-receipts');
