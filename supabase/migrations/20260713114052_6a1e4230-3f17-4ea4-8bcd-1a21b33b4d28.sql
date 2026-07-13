CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_address TEXT NOT NULL DEFAULT '1200 Harbor Drive, Long Beach, CA 90802',
  contact_phone TEXT NOT NULL DEFAULT '+1 (555) 947-2600',
  contact_email TEXT NOT NULL DEFAULT 'ops@zipco-intl.com',
  headquarters_label TEXT NOT NULL DEFAULT 'Long Beach, California',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.site_settings (contact_address, contact_phone, contact_email, headquarters_label) VALUES
  ('1200 Harbor Drive, Long Beach, CA 90802', '+1 (555) 947-2600', 'ops@zipco-intl.com', 'Long Beach, California');