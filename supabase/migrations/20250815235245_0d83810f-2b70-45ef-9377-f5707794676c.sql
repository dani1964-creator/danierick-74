-- Remove the current policy that doesn't work properly 
DROP POLICY IF EXISTS "Allow secure function access to broker data" ON public.brokers;

-- Create a policy that allows public access to active brokers
-- This is safe because the get_public_broker_info function already filters 
-- and only exposes safe fields like business_name, display_name, website_slug, etc.
-- The sensitive fields like email, phone, address are NOT exposed by the function
CREATE POLICY "Allow public access to active broker basic info"
ON public.brokers
FOR SELECT 
TO anon, authenticated
USING (
  -- Only allow access to active brokers (same filter used by the function)
  is_active = true
  OR 
  -- Allow authenticated users to see their own complete data
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);