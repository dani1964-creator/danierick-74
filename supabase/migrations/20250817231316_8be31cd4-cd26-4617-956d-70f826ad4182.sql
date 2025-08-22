-- Remove the dangerous public SELECT policy that exposes all broker columns
DROP POLICY "Public can view essential business info only" ON public.brokers;

-- The security issue is now resolved:
-- 1. No direct public access to the brokers table
-- 2. Public access only through the secure get_public_broker_info() RPC function
-- 3. The RPC function controls exactly which fields are exposed safely

-- Add comment explaining the secure approach
COMMENT ON TABLE public.brokers IS 
'Broker data access: Authenticated users access their own data via RLS policies. Public access only via get_public_broker_info() RPC function which safely exposes business info while protecting personal contact details.';