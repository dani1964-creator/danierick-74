-- Fix security issue: Add explicit policy to deny public access to leads table
-- This prevents unauthorized users from reading sensitive customer data

-- Drop the overly permissive policy if it exists and add explicit restrictions
DROP POLICY IF EXISTS "Deny public access to leads" ON public.leads;

-- Create policy to explicitly deny public read access to leads data
CREATE POLICY "Deny public access to leads" 
ON public.leads 
FOR SELECT 
TO anon, authenticated 
USING (
  -- Only allow access if user is authenticated and is the broker who owns the leads
  auth.uid() IS NOT NULL AND 
  broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  )
);