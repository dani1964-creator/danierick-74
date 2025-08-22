-- Fix the security definer view issue by removing the problematic view
-- and creating a more secure function-based approach
DROP VIEW IF EXISTS public.public_properties;

-- Create a secure function to get public properties instead
CREATE OR REPLACE FUNCTION public.get_public_properties(
  property_limit INTEGER DEFAULT 50,
  property_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  property_type TEXT,
  transaction_type TEXT,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  uf TEXT,
  main_image_url TEXT,
  images TEXT[],
  features TEXT[],
  price NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,
  area_m2 NUMERIC,
  views_count INTEGER,
  is_featured BOOLEAN,
  status TEXT,
  slug TEXT,
  property_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  broker_business_name TEXT,
  broker_website_slug TEXT,
  broker_display_name TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    -- Only include safe broker business information
    b.business_name,
    b.website_slug,
    b.display_name
  FROM public.properties p
  JOIN public.brokers b ON p.broker_id = b.id
  WHERE p.is_active = true
    AND b.is_active = true
  ORDER BY p.created_at DESC
  LIMIT property_limit
  OFFSET property_offset;
END;
$$;

-- Remove the problematic RLS policy that was added
DROP POLICY IF EXISTS "Anyone can view public properties" ON public.properties;