-- Disable Row Level Security completely on leads table
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies on leads table
DROP POLICY IF EXISTS "Allow public lead insertion" ON public.leads;
DROP POLICY IF EXISTS "Authenticated brokers can view own leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated brokers can update own leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated brokers can delete own leads" ON public.leads;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'leads' AND schemaname = 'public';