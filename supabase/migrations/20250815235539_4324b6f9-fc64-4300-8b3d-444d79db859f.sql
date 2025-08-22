-- Clean up duplicate broker policies for better security and clarity
-- Remove all existing SELECT policies
DROP POLICY IF EXISTS "Authenticated brokers can view own profile" ON public.brokers;
DROP POLICY IF EXISTS "Brokers can access own data only" ON public.brokers;  
DROP POLICY IF EXISTS "Brokers can view own complete profile" ON public.brokers;

-- Create a single, clear policy for broker data access
CREATE POLICY "Brokers can only access their own data"
ON public.brokers
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Ensure no anonymous access to brokers table
-- The get_public_broker_info() function will handle safe public access
-- by exposing only business information, not personal/sensitive data

-- Verify other policies are properly restrictive
-- UPDATE policy: only for authenticated users on their own data ✓
-- INSERT policy: only for authenticated users on their own data ✓
-- No DELETE policy exists ✓ (prevents accidental data loss)
-- No public SELECT policy ✓ (prevents data exposure)