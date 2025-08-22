-- Remove a política pública insegura que expõe dados sensíveis dos corretores
DROP POLICY IF EXISTS "Public can view basic broker info for active brokers" ON public.brokers;

-- O acesso público às informações dos corretores deve ser feito exclusivamente 
-- através da função get_public_broker_info() que já filtra os campos apropriados
-- e expõe apenas: business_name, display_name, website_slug, logo_url, 
-- primary_color, secondary_color, about_text, footer_text, etc.
-- sem expor dados sensíveis como email pessoal, telefone, endereço, etc.

-- Comentário: Agora apenas usuários autenticados (donos do perfil) podem 
-- acessar diretamente a tabela brokers. Visitantes públicos devem usar 
-- a função get_public_broker_info() para informações seguras.