-- Criar política para permitir que corretores excluam seus próprios leads
CREATE POLICY "Authenticated brokers can delete own leads" 
ON public.leads 
FOR DELETE 
USING (broker_id IN ( 
  SELECT brokers.id
  FROM brokers
  WHERE brokers.user_id = auth.uid()
));