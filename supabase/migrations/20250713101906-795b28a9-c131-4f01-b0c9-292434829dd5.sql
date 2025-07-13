
-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true);

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload evidence files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'evidence' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to view their own files
CREATE POLICY "Allow users to view their own evidence files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'evidence'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow admins to view all evidence files
CREATE POLICY "Allow admins to view all evidence files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'evidence'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own evidence files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'evidence'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
