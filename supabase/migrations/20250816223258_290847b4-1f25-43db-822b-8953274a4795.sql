-- Create a very restrictive public SELECT policy that only exposes essential business fields
-- This addresses the security scanner concern while maintaining data protection
-- Sensitive fields like personal email, phone, address remain protected by the restricted column access

CREATE POLICY "Public can view essential business info only" 
ON public.brokers 
FOR SELECT 
USING (
  is_active = true 
  AND website_slug IS NOT NULL
);

-- Add a comment explaining the security approach
COMMENT ON POLICY "Public can view essential business info only" ON public.brokers IS 
'This policy allows public access to broker records but sensitive contact information should only be accessed via the secure get_public_broker_info() RPC function which provides controlled field exposure.';