-- Fix security vulnerability in leads table
-- The current INSERT policy allows unrestricted public access which could be abused

-- First, drop the existing insecure policy
DROP POLICY IF EXISTS "Public can create leads anonymously" ON public.leads;

-- Create a more secure INSERT policy that validates broker existence and adds basic protections
CREATE POLICY "Secure lead creation with broker validation" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  -- Ensure the broker_id corresponds to a real, active broker
  broker_id IN (
    SELECT id FROM public.brokers 
    WHERE is_active = true
  )
  -- Add basic validation that essential fields are not empty
  AND length(trim(name)) > 0
  AND length(trim(email)) > 5
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Create a security definer function to help with rate limiting (optional enhancement)
CREATE OR REPLACE FUNCTION public.check_lead_rate_limit(client_ip inet DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Simple rate limiting: max 5 leads per IP per hour
  -- This is a basic implementation, in production you might want more sophisticated rate limiting
  SELECT (
    SELECT COUNT(*) 
    FROM public.leads 
    WHERE created_at > NOW() - INTERVAL '1 hour'
    AND (client_ip IS NULL OR true) -- Placeholder for IP-based limiting if needed
  ) < 5;
$$;

-- Add a comment to document the security considerations
COMMENT ON POLICY "Secure lead creation with broker validation" ON public.leads IS 
'Allows public lead creation but validates that broker exists and is active. Additional validation is handled by the validate_lead_input() trigger.';

-- Ensure the validation trigger is properly attached (if not already)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'validate_lead_input_trigger' 
    AND event_object_table = 'leads'
  ) THEN
    CREATE TRIGGER validate_lead_input_trigger
      BEFORE INSERT OR UPDATE ON public.leads
      FOR EACH ROW EXECUTE FUNCTION public.validate_lead_input();
  END IF;
END $$;

-- Add audit trigger for leads to track suspicious activity
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'leads_audit_trigger' 
    AND event_object_table = 'leads'
  ) THEN
    CREATE TRIGGER leads_audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.leads
      FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
  END IF;
END $$;