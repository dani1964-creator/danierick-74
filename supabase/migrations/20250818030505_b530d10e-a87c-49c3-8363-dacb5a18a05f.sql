-- Fix critical security issue: Restrict public access to sensitive broker data
-- The current setup allows public access to all broker data including sensitive contact info

-- First, check the existing policies
DROP POLICY IF EXISTS "Anyone can view broker profiles" ON public.brokers;

-- Create a secure public access policy that only exposes safe business information
-- and requires the get_public_broker_info function for public access
CREATE POLICY "Public can view limited broker info via function" 
ON public.brokers 
FOR SELECT 
USING (false);  -- Block direct public access

-- Add specific policy for authenticated broker access (keep existing functionality)
-- This policy already exists: "Brokers can only access their own data"

-- Fix security_logs exposure issue
DROP POLICY IF EXISTS "Authenticated users can view security logs" ON public.security_logs;

CREATE POLICY "Users can only view their own security logs" 
ON public.security_logs 
FOR SELECT 
USING (user_id = auth.uid());

-- Add system admin access to security logs (optional, for system monitoring)
CREATE POLICY "System monitoring access to security logs" 
ON public.security_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.brokers 
    WHERE user_id = auth.uid() 
    AND email IN ('admin@example.com') -- Replace with actual admin emails
  )
);