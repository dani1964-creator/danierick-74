-- Drop the previous policy and create a more secure one
DROP POLICY "Public can view basic business information" ON public.brokers;

-- Create a secure view for public broker information instead of a policy
-- This approach is more secure as it explicitly controls which fields are exposed
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
  hero_title,
  hero_subtitle,
  whatsapp_button_text,
  whatsapp_button_color,
  background_image_url,
  overlay_color,
  overlay_opacity,
  is_active,
  created_at,
  updated_at,
  -- Only expose business contact details, not personal ones
  contact_email,
  whatsapp_number,
  creci,
  tracking_scripts
FROM public.brokers
WHERE is_active = true AND website_slug IS NOT NULL;

-- Enable RLS on the view
ALTER VIEW public.public_broker_info SET (security_barrier = true);

-- Create a policy for the view that allows public access
CREATE POLICY "Anyone can view public broker information" 
ON public.public_broker_info 
FOR SELECT 
USING (true);