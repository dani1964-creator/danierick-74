-- Fix audit_logs RLS to allow system inserts from triggers
-- First check current policies
SELECT policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'audit_logs';

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;

-- Create policies that allow system operations
CREATE POLICY "Users can view own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);