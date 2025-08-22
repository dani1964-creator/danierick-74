-- Clean up conflicting lead policies for better security clarity
-- The current "Deny public access to leads" policy is actually redundant and confusing
-- because it's a PERMISSIVE policy that allows the same access as another policy

-- Remove the confusingly named policy
DROP POLICY IF EXISTS "Deny public access to leads" ON public.leads;

-- The remaining policies provide proper security:
-- 1. "Public can create leads anonymously" - allows lead submission (INSERT only)
-- 2. "Authenticated brokers can view own leads" - brokers can only see their own leads
-- 3. "Authenticated brokers can update own leads" - brokers can only update their own leads
-- 4. No public SELECT policy exists - this prevents data theft

-- Verify current security state:
-- ✅ Anonymous users: Can INSERT leads but CANNOT SELECT (read) any lead data
-- ✅ Authenticated brokers: Can only SELECT/UPDATE their own leads  
-- ✅ No public access to read customer data
-- ✅ No DELETE policy exists (prevents accidental data loss)

-- The leads table is now properly secured:
-- - Public lead submission works for website forms
-- - Customer data (emails, phones, messages) is protected from public access
-- - Only authenticated brokers can access their own leads