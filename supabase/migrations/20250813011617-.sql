-- Add footer settings to brokers table
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'Todos os direitos reservados';
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Create the trigger to ensure broker profiles are created automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create broker profile for existing users that don't have one
INSERT INTO public.brokers (
  user_id, 
  business_name, 
  email,
  primary_color,
  secondary_color,
  plan_type,
  is_active,
  max_properties,
  footer_text,
  contact_email
)
SELECT 
  u.id,
  'Minha Imobiliária',
  u.email,
  '#2563eb',
  '#64748b',
  'free',
  true,
  5,
  'Todos os direitos reservados',
  u.email
FROM auth.users u
LEFT JOIN public.brokers b ON b.user_id = u.id
WHERE b.user_id IS NULL;