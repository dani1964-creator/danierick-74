-- Remover todas as políticas de INSERT existentes para leads
DROP POLICY IF EXISTS "Allow public lead creation from website" ON public.leads;
DROP POLICY IF EXISTS "Allow public lead creation" ON public.leads;

-- Criar política temporária muito permissiva para debug
CREATE POLICY "temp_allow_all_lead_inserts" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Verificar se há triggers que podem estar causando problemas
SELECT tgname, tgtype, proname 
FROM pg_trigger 
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid 
WHERE tgrelid = 'public.leads'::regclass;