
-- Critical Security Fixes for ImóvelSaaS

-- 1. Strengthen broker table security - remove any potential public access
-- Drop existing policies to rebuild them securely
DROP POLICY IF EXISTS "Brokers can view their own profile" ON public.brokers;
DROP POLICY IF EXISTS "Brokers can update their own profile" ON public.brokers;
DROP POLICY IF EXISTS "Users can create their broker profile" ON public.brokers;

-- Create secure RLS policies for brokers table
CREATE POLICY "Authenticated brokers can view own profile" 
  ON public.brokers 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated brokers can update own profile" 
  ON public.brokers 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create broker profile" 
  ON public.brokers 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Strengthen leads table security
-- Drop existing policies to rebuild them securely
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Brokers can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Brokers can update their own leads" ON public.leads;

-- Create secure RLS policies for leads table
CREATE POLICY "Public can create leads anonymously" 
  ON public.leads 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated brokers can view own leads" 
  ON public.leads 
  FOR SELECT 
  TO authenticated
  USING (broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated brokers can update own leads" 
  ON public.leads 
  FOR UPDATE 
  TO authenticated
  USING (broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  ));

-- 3. Add input validation function for properties
CREATE OR REPLACE FUNCTION public.validate_property_input()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Apply validation trigger to properties table
CREATE TRIGGER validate_property_before_insert_update
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_property_input();

-- 4. Add input validation function for brokers
CREATE OR REPLACE FUNCTION public.validate_broker_input()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Apply validation trigger to brokers table
CREATE TRIGGER validate_broker_before_insert_update
  BEFORE INSERT OR UPDATE ON public.brokers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_broker_input();

-- 5. Add input validation function for leads
CREATE OR REPLACE FUNCTION public.validate_lead_input()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Apply validation trigger to leads table
CREATE TRIGGER validate_lead_before_insert_update
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lead_input();

-- 6. Create audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view their own audit logs
CREATE POLICY "Users can view own audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- 7. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_brokers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.brokers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_properties_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_leads_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
