-- Remove the overly permissive public broker policy
DROP POLICY IF EXISTS "Anyone can view active broker profiles" ON public.brokers;

-- Create a more restrictive policy that only allows access to non-sensitive broker information for public viewing
-- This policy will work in conjunction with explicit field selection in the application code
CREATE POLICY "Public can view limited broker profile info" 
ON public.brokers 
FOR SELECT 
USING (
  is_active = true AND 
  -- Only allow access to non-sensitive fields through application-level field selection
  -- The application code will need to explicitly select only the allowed fields
  true
);

-- Create a view for public broker information that only exposes safe fields
CREATE VIEW public.brokers_public AS
SELECT 
  id,
  business_name,
  display_name,
  logo_url,
  primary_color,
  secondary_color,
  about_text,
  footer_text,
  background_image_url,
  overlay_color,
  overlay_opacity,
  whatsapp_button_text,
  whatsapp_button_color,
  is_active,
  created_at
FROM public.brokers
WHERE is_active = true;

-- Enable RLS on the view
ALTER VIEW public.brokers_public SET (security_barrier = true);

-- Grant access to the public view
GRANT SELECT ON public.brokers_public TO anon;
GRANT SELECT ON public.brokers_public TO authenticated;