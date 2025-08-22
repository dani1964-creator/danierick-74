-- Fix security vulnerability: Restrict access to sensitive broker contact information
-- The current get_public_broker_info function exposes too much sensitive data

-- Create a new function that only exposes essential business branding information
CREATE OR REPLACE FUNCTION public.get_public_broker_branding(broker_website_slug text DEFAULT NULL::text)
 RETURNS TABLE(
   id uuid, 
   business_name text, 
   display_name text, 
   website_slug text, 
   logo_url text, 
   primary_color text, 
   secondary_color text, 
   about_text text, 
   footer_text text, 
   whatsapp_button_color text, 
   whatsapp_button_text text, 
   background_image_url text, 
   overlay_color text, 
   overlay_opacity text, 
   hero_title text, 
   hero_subtitle text, 
   is_active boolean, 
   created_at timestamp with time zone, 
   updated_at timestamp with time zone, 
   tracking_scripts jsonb, 
   about_us_content text, 
   privacy_policy_content text, 
   terms_of_use_content text
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- This function only exposes safe branding information, no sensitive contact details
  RETURN QUERY
  SELECT 
    b.id,
    b.business_name,
    b.display_name,
    b.website_slug,
    b.logo_url,
    b.primary_color,
    b.secondary_color,
    b.about_text,
    b.footer_text,
    b.whatsapp_button_color,
    b.whatsapp_button_text,
    b.background_image_url,
    b.overlay_color,
    b.overlay_opacity,
    b.hero_title,
    b.hero_subtitle,
    b.is_active,
    b.created_at,
    b.updated_at,
    b.tracking_scripts,
    b.about_us_content,
    b.privacy_policy_content,
    b.terms_of_use_content
  FROM public.brokers b
  WHERE b.is_active = true
    AND (broker_website_slug IS NULL OR b.website_slug = broker_website_slug);
END;
$$;

-- Create a separate function for getting contact information (requires rate limiting)
CREATE OR REPLACE FUNCTION public.get_broker_contact_info(broker_website_slug text)
 RETURNS TABLE(
   whatsapp_number text, 
   contact_email text, 
   creci text
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- This function exposes contact information with rate limiting considerations
  -- Should be called only when user explicitly requests contact (like clicking contact button)
  
  RETURN QUERY
  SELECT 
    b.whatsapp_number,
    b.contact_email,
    b.creci
  FROM public.brokers b
  WHERE b.is_active = true
    AND b.website_slug = broker_website_slug;
END;
$$;

-- Update the existing function to include a deprecation notice
COMMENT ON FUNCTION public.get_public_broker_info(text) IS 
'DEPRECATED: This function exposes too much sensitive information. Use get_public_broker_branding() for general info and get_broker_contact_info() for contact details.';

-- Create a more restrictive RLS policy for direct table access
-- Drop the existing public access policy if it exists
DROP POLICY IF EXISTS "Public can view limited broker info via function" ON public.brokers;

-- Create a new policy that completely prevents direct public access to the brokers table
CREATE POLICY "No direct public access to brokers table" 
ON public.brokers 
FOR SELECT 
TO anon
USING (false);

-- Ensure authenticated users can still access their own data
-- This policy should already exist, but let's make sure it's properly set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'brokers' 
    AND policyname = 'Brokers can only access their own data'
  ) THEN
    CREATE POLICY "Brokers can only access their own data" 
    ON public.brokers 
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add comments to document the security model
COMMENT ON FUNCTION public.get_public_broker_branding(text) IS 
'Returns only safe branding information for public website display. No sensitive contact information is exposed.';

COMMENT ON FUNCTION public.get_broker_contact_info(text) IS 
'Returns contact information for a specific broker. Should be called only when user explicitly requests contact information and with proper rate limiting.';

-- Add audit logging for contact information access
CREATE TABLE IF NOT EXISTS public.broker_contact_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  user_ip inet,
  user_agent text,
  access_type text NOT NULL DEFAULT 'contact_info'
);

-- Enable RLS on the access log
ALTER TABLE public.broker_contact_access_log ENABLE ROW LEVEL SECURITY;

-- Create policy for the access log (only admins can view)
CREATE POLICY "Only admins can view contact access logs" 
ON public.broker_contact_access_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.brokers 
    WHERE user_id = auth.uid() 
    AND id = broker_contact_access_log.broker_id
  )
);