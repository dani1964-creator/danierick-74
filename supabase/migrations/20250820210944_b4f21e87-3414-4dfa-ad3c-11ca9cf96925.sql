-- Drop and recreate the function with new fields
DROP FUNCTION IF EXISTS public.get_public_properties_with_realtor(integer, integer);

CREATE OR REPLACE FUNCTION public.get_public_properties_with_realtor(property_limit integer DEFAULT 50, property_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, title text, description text, property_type text, transaction_type text, address text, neighborhood text, city text, uf text, main_image_url text, images text[], features text[], price numeric, bedrooms integer, bathrooms integer, parking_spaces integer, area_m2 numeric, views_count integer, is_featured boolean, status text, slug text, property_code text, created_at timestamp with time zone, updated_at timestamp with time zone, broker_business_name text, broker_website_slug text, broker_display_name text, realtor_name text, realtor_avatar_url text, realtor_creci text, realtor_bio text, realtor_whatsapp_button_text text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.property_type,
    p.transaction_type,
    p.address,
    p.neighborhood,
    p.city,
    p.uf,
    p.main_image_url,
    p.images,
    p.features,
    p.price,
    p.bedrooms,
    p.bathrooms,
    p.parking_spaces,
    p.area_m2,
    p.views_count,
    p.is_featured,
    p.status,
    p.slug,
    p.property_code,
    p.created_at,
    p.updated_at,
    b.business_name,
    b.website_slug,
    b.display_name,
    r.name as realtor_name,
    r.avatar_url as realtor_avatar_url,
    r.creci as realtor_creci,
    r.bio as realtor_bio,
    r.whatsapp_button_text as realtor_whatsapp_button_text
  FROM public.properties p
  JOIN public.brokers b ON p.broker_id = b.id
  LEFT JOIN public.realtors r ON p.realtor_id = r.id
  WHERE p.is_active = true
    AND b.is_active = true
  ORDER BY p.created_at DESC
  LIMIT property_limit
  OFFSET property_offset;
END;
$function$;

-- Update get_public_broker_branding_secure to include whatsapp_number
DROP FUNCTION IF EXISTS public.get_public_broker_branding_secure(text);

CREATE OR REPLACE FUNCTION public.get_public_broker_branding_secure(broker_website_slug text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, business_name text, display_name text, website_slug text, logo_url text, primary_color text, secondary_color text, about_text text, footer_text text, whatsapp_button_color text, whatsapp_button_text text, background_image_url text, overlay_color text, overlay_opacity text, hero_title text, hero_subtitle text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone, tracking_scripts jsonb, about_us_content text, privacy_policy_content text, terms_of_use_content text, whatsapp_number text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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
    b.terms_of_use_content,
    b.whatsapp_number
  FROM public.brokers b
  WHERE b.is_active = true
    AND (broker_website_slug IS NULL OR b.website_slug = broker_website_slug);
END;
$function$;