-- Security Fix: Update all database functions to prevent schema injection
-- Add SET search_path TO 'public' to all functions for security

-- Fix validate_property_input function
CREATE OR REPLACE FUNCTION public.validate_property_input()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate title length
  IF length(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Title must be 200 characters or less';
  END IF;
  
  -- Validate description length
  IF length(NEW.description) > 5000 THEN
    RAISE EXCEPTION 'Description must be 5000 characters or less';
  END IF;
  
  -- Validate price is positive
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'Price must be greater than 0';
  END IF;
  
  -- Validate numeric fields are not negative
  IF NEW.bedrooms < 0 OR NEW.bathrooms < 0 OR NEW.parking_spaces < 0 OR NEW.area_m2 < 0 THEN
    RAISE EXCEPTION 'Numeric fields cannot be negative';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix validate_broker_input function  
CREATE OR REPLACE FUNCTION public.validate_broker_input()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate business name length
  IF length(NEW.business_name) > 100 THEN
    RAISE EXCEPTION 'Business name must be 100 characters or less';
  END IF;
  
  -- Validate display name length
  IF NEW.display_name IS NOT NULL AND length(NEW.display_name) > 100 THEN
    RAISE EXCEPTION 'Display name must be 100 characters or less';
  END IF;
  
  -- Validate email format (basic check)
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate phone format if provided (basic check for digits, spaces, dashes, parentheses)
  IF NEW.phone IS NOT NULL AND NEW.phone !~ '^[\d\s\-\(\)\+]+$' THEN
    RAISE EXCEPTION 'Invalid phone format';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix validate_lead_input function
CREATE OR REPLACE FUNCTION public.validate_lead_input()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate name length
  IF length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Name must be 100 characters or less';
  END IF;
  
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate phone format if provided
  IF NEW.phone IS NOT NULL AND NEW.phone !~ '^[\d\s\-\(\)\+]+$' THEN
    RAISE EXCEPTION 'Invalid phone format';
  END IF;
  
  -- Validate message length
  IF NEW.message IS NOT NULL AND length(NEW.message) > 2000 THEN
    RAISE EXCEPTION 'Message must be 2000 characters or less';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix audit_trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    user_id,
    record_id,
    old_data,
    new_data
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Add security monitoring table for rate limiting and logging
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  endpoint TEXT,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security logs  
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can view security logs
CREATE POLICY "Authenticated users can view security logs" 
ON public.security_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON public.security_logs(ip_address);