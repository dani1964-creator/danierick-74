-- Drop the existing function and recreate with contact fields
DROP FUNCTION IF EXISTS public.get_public_broker_info(text);

CREATE OR REPLACE FUNCTION public.get_public_broker_info(broker_website_slug text DEFAULT NULL::text)
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
   whatsapp_number text,
   contact_email text,
   creci text,
   is_active boolean, 
   created_at timestamp with time zone, 
   updated_at timestamp with time zone
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    b.whatsapp_number,
    b.contact_email,
    b.creci,
    b.is_active,
    b.created_at,
    b.updated_at
  FROM public.brokers b
  WHERE b.is_active = true
    AND (broker_website_slug IS NULL OR b.website_slug = broker_website_slug);
$function$