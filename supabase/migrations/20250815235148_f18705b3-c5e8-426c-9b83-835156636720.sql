-- Create a secure policy for the get_public_broker_info function
-- This policy allows access only through the secure RPC function while maintaining data protection
CREATE POLICY "Allow secure function access to broker data"
ON public.brokers
FOR SELECT 
TO authenticated, anon
USING (
  -- This policy allows access when called through our secure function
  -- The function get_public_broker_info is SECURITY DEFINER so it runs with elevated privileges
  -- but only exposes safe fields for public consumption
  current_setting('role') = 'service_role' 
  OR 
  -- Allow authenticated users to see their own data
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Also ensure the function can work for anonymous users by allowing it through service role
-- The get_public_broker_info function is already SECURITY DEFINER and properly filters sensitive fields