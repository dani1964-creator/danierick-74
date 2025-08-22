-- Update the get_public_properties_with_realtor function to include new fields
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