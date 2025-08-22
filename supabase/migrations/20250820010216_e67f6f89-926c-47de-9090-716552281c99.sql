-- Criar política para permitir criação pública de leads (visitantes do site)
CREATE POLICY "Allow public lead creation from website" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  -- Permitir inserção de leads apenas se:
  -- 1. O broker existe e está ativo
  broker_id IN (
    SELECT id FROM public.brokers 
    WHERE is_active = true
  )
  -- 2. Dados básicos estão válidos
  AND length(TRIM(BOTH FROM name)) > 0
  AND length(TRIM(BOTH FROM email)) > 5
  AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  -- 3. Source é do site público
  AND source = 'site_publico'
);