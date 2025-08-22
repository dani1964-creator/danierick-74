
-- Remover a política restritiva atual e criar uma mais apropriada
DROP POLICY IF EXISTS "Public can view safe broker info" ON public.brokers;

-- Criar uma política que permite acesso público apenas aos dados necessários para o site
-- Vamos usar uma view pública ao invés de política direta para maior controle
CREATE OR REPLACE VIEW public.public_broker_info AS
SELECT 
  id,
  business_name,
  display_name,
  website_slug,
  logo_url,
  primary_color,
  secondary_color,
  about_text,
  footer_text,
  whatsapp_button_color,
  whatsapp_button_text,
  background_image_url,
  overlay_color,
  overlay_opacity,
  contact_email,
  phone,
  whatsapp_number,
  address,
  is_active,
  created_at,
  updated_at
FROM public.brokers
WHERE is_active = true;

-- Permitir acesso público à view
GRANT SELECT ON public.public_broker_info TO anon;
GRANT SELECT ON public.public_broker_info TO authenticated;

-- Atualizar a função para usar dados mais completos mas ainda seguros
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
   contact_email text,
   phone text,
   whatsapp_number text,
   address text,
   is_active boolean, 
   created_at timestamp with time zone, 
   updated_at timestamp with time zone
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    pbi.id,
    pbi.business_name,
    pbi.display_name,
    pbi.website_slug,
    pbi.logo_url,
    pbi.primary_color,
    pbi.secondary_color,
    pbi.about_text,
    pbi.footer_text,
    pbi.whatsapp_button_color,
    pbi.whatsapp_button_text,
    pbi.background_image_url,
    pbi.overlay_color,
    pbi.overlay_opacity,
    pbi.contact_email,
    pbi.phone,
    pbi.whatsapp_number,
    pbi.address,
    pbi.is_active,
    pbi.created_at,
    pbi.updated_at
  FROM public.public_broker_info pbi
  WHERE pbi.is_active = true
    AND (broker_website_slug IS NULL OR pbi.website_slug = broker_website_slug);
$function$
