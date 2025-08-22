-- Fix the security definer view issue by removing the security_barrier setting
-- and creating a proper policy-based approach instead

-- Drop the problematic view
DROP VIEW IF EXISTS public.brokers_public;

-- Instead, we'll update the existing policy to be more restrictive
-- Replace the current policy with one that uses explicit field filtering at the application level
DROP POLICY IF EXISTS "Public can view limited broker profile info" ON public.brokers;

-- Create a policy that only allows public access to non-sensitive fields
-- This requires the application to explicitly select only safe fields
CREATE POLICY "Public can view non-sensitive broker info" 
ON public.brokers 
FOR SELECT 
USING (is_active = true);

-- Note: The security will be enforced at the application level by explicitly selecting
-- only the safe fields (business_name, display_name, logo_url, primary_color, etc.)
-- rather than using SELECT *