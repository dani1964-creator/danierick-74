-- Fix RLS policy for leads table to allow public lead creation
-- Drop the existing temp policy and create a proper one

DROP POLICY IF EXISTS "temp_allow_all_lead_inserts" ON public.leads;

-- Create a new policy that allows anyone to insert leads (for public contact forms)
CREATE POLICY "Allow public lead insertion" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Also ensure the table has RLS enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;