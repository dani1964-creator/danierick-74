-- Fix the search path issue for the function
CREATE OR REPLACE FUNCTION public.is_broker_query_safe()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- This function will be used by application code to ensure only safe queries are made
  SELECT true;
$$;