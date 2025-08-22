-- Verificar e remover políticas conflitantes
DROP POLICY IF EXISTS "Secure lead creation with broker validation" ON public.leads;

-- Criar uma política mais simples e funcional para criação pública de leads
CREATE POLICY "Allow public lead creation" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  -- Permitir inserção para qualquer usuário (autenticado ou não)
  -- desde que os dados básicos sejam válidos
  broker_id IS NOT NULL
  AND name IS NOT NULL 
  AND email IS NOT NULL
  AND source = 'site_publico'
);