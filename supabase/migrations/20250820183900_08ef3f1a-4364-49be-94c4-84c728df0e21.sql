-- Fix RLS policies issue
-- The error might be related to the new policy I created. Let me fix it using a security definer function

-- Drop the problematic policy first
DROP POLICY IF EXISTS "Brokers can view realtors through properties" ON public.realtors;

-- Create a security definer function to check if user can access realtor data
CREATE OR REPLACE FUNCTION public.user_can_access_realtor(realtor_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.properties p
    JOIN public.brokers b ON p.broker_id = b.id
    WHERE p.realtor_id = $1
    AND b.user_id = auth.uid()
  );
$$;

-- Create a better policy using the security definer function
CREATE POLICY "Brokers can view realtors through properties" 
ON public.realtors 
FOR SELECT 
USING (
  broker_id IN (
    SELECT id 
    FROM public.brokers 
    WHERE user_id = auth.uid()
  ) OR public.user_can_access_realtor(id)
);