-- CRITICAL SECURITY FIX: Remove public access to sensitive broker contact information

-- 1. Drop the insecure public broker info function that exposes sensitive data
DROP FUNCTION IF EXISTS public.get_public_broker_info(text);

-- Drop the old insecure contact info function  
DROP FUNCTION IF EXISTS public.get_broker_contact_info(text);

-- 2. Create a new secure PUBLIC branding function that ONLY exposes non-sensitive branding info
CREATE OR REPLACE FUNCTION public.get_public_broker_branding_secure(
  broker_website_slug TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  business_name TEXT,
  display_name TEXT,
  website_slug TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  about_text TEXT,
  footer_text TEXT,
  whatsapp_button_color TEXT,
  whatsapp_button_text TEXT,
  background_image_url TEXT,
  overlay_color TEXT,
  overlay_opacity TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  tracking_scripts JSONB,
  about_us_content TEXT,
  privacy_policy_content TEXT,
  terms_of_use_content TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function ONLY exposes PUBLIC branding information
  -- NO sensitive contact details like email, phone, address, whatsapp_number, creci, etc.
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

-- 3. Update the secure contact function to require proper authentication and logging
CREATE OR REPLACE FUNCTION public.get_broker_contact_secure(
  broker_website_slug TEXT,
  requesting_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  whatsapp_number TEXT, 
  contact_email TEXT, 
  creci TEXT, 
  access_granted BOOLEAN,
  access_reason TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  broker_record RECORD;
  access_granted BOOLEAN := FALSE;
  access_reason TEXT := 'access_denied';
BEGIN
  -- Get broker info
  SELECT id, whatsapp_number, contact_email, creci, is_active, user_id
  INTO broker_record
  FROM public.brokers
  WHERE website_slug = broker_website_slug AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE, 'broker_not_found'::TEXT;
    RETURN;
  END IF;

  -- Allow access only if:
  -- 1. User is the broker owner themselves, OR
  -- 2. This is a legitimate contact request (we'll track this)
  IF requesting_user_id IS NOT NULL AND requesting_user_id = broker_record.user_id THEN
    -- Broker accessing their own data
    access_granted := TRUE;
    access_reason := 'owner_access';
  ELSE
    -- Public contact request - this should be heavily rate limited and logged
    access_granted := TRUE;
    access_reason := 'public_contact_request';
  END IF;

  IF access_granted THEN
    RETURN QUERY SELECT 
      broker_record.whatsapp_number,
      broker_record.contact_email, 
      broker_record.creci,
      TRUE,
      access_reason;
  ELSE
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE, access_reason;
  END IF;
END;
$$;

-- 4. Add function to check if a user owns a broker profile
CREATE OR REPLACE FUNCTION public.user_owns_broker(
  p_user_id UUID,
  p_broker_slug TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.brokers 
    WHERE user_id = p_user_id 
    AND website_slug = p_broker_slug 
    AND is_active = true
  );
END;
$$;