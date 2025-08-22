-- Update the get_public_broker_info function to include new content fields
CREATE OR REPLACE FUNCTION public.get_public_broker_info(broker_website_slug text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, business_name text, display_name text, website_slug text, logo_url text, primary_color text, secondary_color text, about_text text, footer_text text, whatsapp_button_color text, whatsapp_button_text text, background_image_url text, overlay_color text, overlay_opacity text, whatsapp_number text, contact_email text, creci text, hero_title text, hero_subtitle text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone, tracking_scripts jsonb, about_us_content text, privacy_policy_content text, terms_of_use_content text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This function runs with elevated privileges and can access broker data
  -- It only exposes safe, business-related fields for public consumption
  -- Sensitive fields like personal email and address are NOT exposed
  
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
    b.whatsapp_number,  -- Business contact (safe to expose)
    b.contact_email,    -- Business contact (safe to expose) 
    b.creci,           -- Professional license (safe to expose)
    b.hero_title,
    b.hero_subtitle,
    b.is_active,
    b.created_at,
    b.updated_at,
    b.tracking_scripts,  -- Include tracking scripts for public use
    b.about_us_content,
    b.privacy_policy_content,
    b.terms_of_use_content
  FROM public.brokers b
  WHERE b.is_active = true
    AND (broker_website_slug IS NULL OR b.website_slug = broker_website_slug);
END;
$function$