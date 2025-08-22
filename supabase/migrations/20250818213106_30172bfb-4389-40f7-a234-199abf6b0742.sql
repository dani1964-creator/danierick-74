-- Create contact access logging table
CREATE TABLE public.contact_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL,
  user_ip INET,
  user_agent TEXT,
  access_type TEXT NOT NULL DEFAULT 'contact_info',
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT
);

-- Enable RLS
ALTER TABLE public.contact_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for brokers to view their own contact access logs
CREATE POLICY "Brokers can view their own contact access logs"
ON public.contact_access_logs 
FOR SELECT 
USING (broker_id IN (
  SELECT id FROM public.brokers WHERE user_id = auth.uid()
));

-- Create policy for public insertion (for logging)
CREATE POLICY "Allow contact access logging"
ON public.contact_access_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to log contact access with rate limiting
CREATE OR REPLACE FUNCTION public.log_contact_access(
  p_broker_id UUID,
  p_user_ip INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_access_type TEXT DEFAULT 'contact_info'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check rate limit: max 10 contact accesses per IP per hour
  IF (
    SELECT COUNT(*)
    FROM public.contact_access_logs
    WHERE user_ip = p_user_ip
    AND accessed_at > NOW() - INTERVAL '1 hour'
  ) >= 10 THEN
    RETURN FALSE;
  END IF;

  -- Log the access
  INSERT INTO public.contact_access_logs (
    broker_id,
    user_ip,
    user_agent,
    access_type
  ) VALUES (
    p_broker_id,
    p_user_ip,
    p_user_agent,
    p_access_type
  );

  RETURN TRUE;
END;
$$;

-- Create enhanced public property view that excludes sensitive broker data
CREATE OR REPLACE VIEW public.public_properties AS
SELECT 
  p.id,
  p.title,
  p.description,
  p.property_type,
  p.transaction_type,
  p.address,
  p.neighborhood,
  p.city,
  p.uf,
  p.main_image_url,
  p.images,
  p.features,
  p.price,
  p.bedrooms,
  p.bathrooms,
  p.parking_spaces,
  p.area_m2,
  p.views_count,
  p.is_featured,
  p.status,
  p.slug,
  p.property_code,
  p.created_at,
  p.updated_at,
  -- Only include broker business name, not sensitive broker_id or personal data
  b.business_name AS broker_business_name,
  b.website_slug AS broker_website_slug,
  b.display_name AS broker_display_name
FROM public.properties p
JOIN public.brokers b ON p.broker_id = b.id
WHERE p.is_active = true
AND b.is_active = true;

-- Create RLS policy for public properties view
CREATE POLICY "Anyone can view public properties"
ON public.properties
FOR SELECT
USING (
  is_active = true 
  AND broker_id IN (
    SELECT id FROM public.brokers WHERE is_active = true
  )
);

-- Add indexes for performance and security monitoring
CREATE INDEX IF NOT EXISTS idx_contact_access_logs_ip_time ON public.contact_access_logs(user_ip, accessed_at);
CREATE INDEX IF NOT EXISTS idx_contact_access_logs_broker_time ON public.contact_access_logs(broker_id, accessed_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_type_time ON public.security_logs(ip_address, event_type, created_at);

-- Update the get_broker_contact_info function to include logging
CREATE OR REPLACE FUNCTION public.get_broker_contact_info_with_logging(
  broker_website_slug TEXT,
  user_ip INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(whatsapp_number TEXT, contact_email TEXT, creci TEXT, access_allowed BOOLEAN)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  broker_record RECORD;
  access_allowed BOOLEAN;
BEGIN
  -- Get broker info
  SELECT id, whatsapp_number, contact_email, creci, is_active
  INTO broker_record
  FROM public.brokers
  WHERE website_slug = broker_website_slug AND is_active = true;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    RETURN;
  END IF;

  -- Log and check rate limit
  SELECT public.log_contact_access(
    broker_record.id,
    user_ip,
    user_agent,
    'contact_info'
  ) INTO access_allowed;

  IF access_allowed THEN
    RETURN QUERY SELECT 
      broker_record.whatsapp_number,
      broker_record.contact_email, 
      broker_record.creci,
      TRUE;
  ELSE
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
  END IF;
END;
$$;