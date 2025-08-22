-- Remove the remaining dangerous public SELECT policy
DROP POLICY "Public can view basic business information" ON public.brokers;

-- Verify no public policies remain - only authenticated user policies should exist
-- This ensures broker contact information cannot be harvested by competitors or spammers

-- The secure architecture is now:
-- 1. NO direct public access to brokers table
-- 2. Authenticated brokers can only access their own data
-- 3. Public access ONLY via get_public_broker_info() RPC function which safely controls field exposure