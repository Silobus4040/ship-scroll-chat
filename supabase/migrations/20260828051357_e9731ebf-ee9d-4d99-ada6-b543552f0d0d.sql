ALTER TABLE public.shipments ADD COLUMN consignment_photo_url text;

-- Allow public visitors to request signed URLs for consignment photos (private bucket)
CREATE POLICY "Public read consignment photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'consignment_photos');

-- Allow authenticated admins to upload photos
CREATE POLICY "Authenticated insert consignment photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'consignment_photos');

-- Allow authenticated admins to update photos
CREATE POLICY "Authenticated update consignment photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'consignment_photos')
WITH CHECK (bucket_id = 'consignment_photos');

-- Allow authenticated admins to delete photos
CREATE POLICY "Authenticated delete consignment photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'consignment_photos');