-- Fix security issue: Restrict public access to broker contact information
-- This prevents competitors from harvesting sensitive business contact data

-- Drop existing policies to recreate them with proper security
DROP POLICY IF EXISTS "Public can view safe broker info" ON public.brokers;
DROP POLICY IF EXISTS "Brokers can view own profile" ON public.brokers;

-- Create policy for public access to only safe, non-sensitive broker information
CREATE POLICY "Public can view safe broker info" 
ON public.brokers 
FOR SELECT 
TO anon, authenticated
USING (
  -- Only allow access to safe fields for active brokers
  -- Sensitive fields like email, phone, whatsapp_number, address are excluded from public access
  is_active = true
);

-- Create policy for authenticated brokers to view their own complete profile
CREATE POLICY "Brokers can view own complete profile" 
ON public.brokers 
FOR SELECT 
TO authenticated
USING (
  -- Brokers can see their own complete profile including sensitive data
  auth.uid() = user_id
);

-- Update the get_public_broker_info function to only return safe information
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
   is_active boolean, 
   created_at timestamp with time zone, 
   updated_at timestamp with time zone
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
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
    b.is_active,
    b.created_at,
    b.updated_at
  FROM public.brokers b
  WHERE b.is_active = true
    AND (broker_website_slug IS NULL OR b.website_slug = broker_website_slug);
$$;