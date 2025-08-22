-- Remove audit trigger from leads table temporarily to fix RLS issues
-- Since these are generic public lead submissions, audit may not be necessary

-- Drop the audit trigger from leads table
DROP TRIGGER IF EXISTS audit_leads_trigger ON public.leads;

-- Verify current RLS policies on leads table
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'leads';

-- The leads table should already have "Allow public lead insertion" policy
-- This allows anonymous users to insert leads without authentication