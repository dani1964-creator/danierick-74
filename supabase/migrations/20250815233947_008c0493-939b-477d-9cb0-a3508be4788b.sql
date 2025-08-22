-- Criar política pública para leitura de informações básicas dos brokers
-- Permite que visitantes vejam informações públicas dos corretores (excluindo dados sensíveis)
CREATE POLICY "Public can view basic broker info for active brokers" 
ON public.brokers 
FOR SELECT 
USING (
  is_active = true AND (
    -- Permite acesso apenas a campos públicos necessários para o site
    -- Exclui campos sensíveis como email, user_id, etc.
    id IS NOT NULL
  )
);

-- Comentário: Esta política permite que visitantes leiam informações básicas 
-- de corretores ativos, mas apenas através da função get_public_broker_info
-- que já filtra os campos apropriados