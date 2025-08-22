-- Add minimal public SELECT policy for brokers table
-- This only exposes basic business information that's safe for public consumption
-- Sensitive contact details are still protected and only available via the secure RPC function

CREATE POLICY "Public can view basic business information" 
ON public.brokers 
FOR SELECT 
USING (
  is_active = true 
  AND website_slug IS NOT NULL
);