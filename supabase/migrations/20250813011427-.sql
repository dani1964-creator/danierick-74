-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for logo uploads
CREATE POLICY "Anyone can view logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own logo uploads" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own logo uploads" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

-- Function to create broker profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.brokers (
    user_id, 
    business_name, 
    email,
    primary_color,
    secondary_color,
    plan_type,
    is_active,
    max_properties
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Minha Imobiliária'),
    NEW.email,
    '#2563eb',
    '#64748b', 
    'free',
    true,
    5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create broker profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add footer settings to brokers table
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'Todos os direitos reservados';
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS contact_email TEXT;