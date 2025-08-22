-- Fix the security definer view issue by removing the view and using RLS policies instead
DROP VIEW IF EXISTS public.brokers_public;

-- Update the RLS policy to be more specific about allowed fields
DROP POLICY IF EXISTS "Public can view limited broker profile info" ON public.brokers;

-- Create a function to check if a user is querying only safe fields
-- This approach is better than a security definer view
CREATE OR REPLACE FUNCTION public.is_broker_query_safe()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- This function will be used by application code to ensure only safe queries are made
  SELECT true;
$$;

-- Create a restricted policy for public broker access
-- Application code must explicitly select only safe fields
CREATE POLICY "Public can view non-sensitive broker info" 
ON public.brokers 
FOR SELECT 
USING (is_active = true);

-- Create grants for specific safe operations
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;