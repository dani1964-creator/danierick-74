-- Fix critical security issues and enable public access for business functionality

-- 1. Add public access policy for properties (critical for business functionality)
CREATE POLICY "Anyone can view active properties" 
ON public.properties 
FOR SELECT 
USING (is_active = true);

-- 2. Add public access policy for brokers (critical for lead generation)
CREATE POLICY "Anyone can view active broker profiles" 
ON public.brokers 
FOR SELECT 
USING (is_active = true);

-- 3. Fix the handle_new_broker function security vulnerability
-- Replace the existing function with proper security definer and search path
CREATE OR REPLACE FUNCTION public.handle_new_broker()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.brokers (user_id, business_name, display_name, email, website_slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'business_name', 'Minha Imobiliária'),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    NEW.email,
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email), ' ', '-')) || '-' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
END;
$function$;

-- 4. Create trigger for the function if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_broker();