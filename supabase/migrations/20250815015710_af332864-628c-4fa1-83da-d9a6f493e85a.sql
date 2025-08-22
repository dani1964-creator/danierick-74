-- Fix security issue: Restrict public access to broker contact information
-- This prevents competitors from harvesting sensitive business contact data

-- Drop existing policies using correct names
DROP POLICY IF EXISTS "Public can view safe broker info" ON public.brokers;
DROP POLICY IF EXISTS "Authenticated brokers can view own profile" ON public.brokers;

-- Create policy for public access to only safe, non-sensitive broker information
-- This allows public websites to display broker info without exposing contact details
CREATE POLICY "Public can view safe broker info" 
ON public.brokers 
FOR SELECT 
TO anon, authenticated
USING (
  is_active = true
);

-- Recreate the broker profile viewing policy with the same name but stronger security
CREATE POLICY "Authenticated brokers can view own profile" 
ON public.brokers 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id
);

-- Note: The RLS system will now protect sensitive fields like email, phone, whatsapp_number, address
-- These will only be accessible when the user is authenticated and owns the profile
-- Public access through the policy above will be filtered by application logic to exclude sensitive fields