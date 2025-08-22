-- Remove a política conflitante que bloqueia acesso público
DROP POLICY IF EXISTS "No direct public access to brokers table" ON public.brokers;

-- Manter apenas as políticas específicas para brokers autenticados
-- As políticas existentes já protegem adequadamente os dados:
-- 1. "Brokers can only access their own data" - permite que brokers vejam apenas seus próprios dados
-- 2. "Authenticated users can create broker profile" - permite criação de perfil
-- 3. "Authenticated brokers can update own profile" - permite atualização do próprio perfil

-- Adicionar comentário explicativo para futura referência
COMMENT ON TABLE public.brokers IS 'Tabela de corretores com RLS habilitado. Acesso restrito apenas aos proprietários dos dados.';