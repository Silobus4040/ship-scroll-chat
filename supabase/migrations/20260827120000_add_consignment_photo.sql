ALTER TABLE shipments ADD COLUMN consignment_photo_url text;

INSERT INTO storage.buckets (id, name, public) VALUES ('consignment_photos', 'consignment_photos', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'consignment_photos');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'consignment_photos');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'consignment_photos');
