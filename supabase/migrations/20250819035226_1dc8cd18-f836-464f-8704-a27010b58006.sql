-- Fix the ambiguous column reference in the contact info function
CREATE OR REPLACE FUNCTION public.get_broker_contact_info_with_logging(
  broker_website_slug text, 
  user_ip inet DEFAULT NULL::inet, 
  user_agent text DEFAULT NULL::text
)
RETURNS TABLE(
  whatsapp_number text, 
  contact_email text, 
  creci text, 
  access_allowed boolean
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  broker_record RECORD;
  access_allowed BOOLEAN;
BEGIN
  -- Get broker info with explicit column references
  SELECT 
    b.id, 
    b.whatsapp_number, 
    b.contact_email, 
    b.creci, 
    b.is_active
  INTO broker_record
  FROM public.brokers b
  WHERE b.website_slug = broker_website_slug AND b.is_active = true;

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
$function$;