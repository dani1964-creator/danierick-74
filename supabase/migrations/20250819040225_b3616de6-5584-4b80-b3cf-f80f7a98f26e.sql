-- Create a public RPC to expose non-sensitive contact info for public site
CREATE OR REPLACE FUNCTION public.get_public_broker_contact(
  broker_website_slug text
)
RETURNS TABLE(
  whatsapp_number text,
  contact_email text,
  creci text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.whatsapp_number,
    b.contact_email,
    b.creci
  FROM public.brokers b
  WHERE b.website_slug = broker_website_slug
    AND b.is_active = true;
END;
$$;