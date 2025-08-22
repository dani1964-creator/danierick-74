
-- Verificar e adicionar campos que podem estar faltando na tabela properties
-- O campo 'neighborhood' (bairro) já existe
-- O campo 'uf' existe mas vamos adicionar 'city' (cidade) se não existir
-- O campo 'property_code' (código do imóvel) já existe
-- O campo 'is_featured' (destaque) já existe
-- O campo 'transaction_type' já existe para venda/aluguel
-- O campo 'status' já existe

-- Adicionar campo 'city' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'city'
    ) THEN
        ALTER TABLE public.properties ADD COLUMN city text;
    END IF;
END $$;

-- Criar índices para melhorar performance nas consultas filtradas
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON public.properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_uf ON public.properties(uf);
CREATE INDEX IF NOT EXISTS idx_properties_property_code ON public.properties(property_code);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON public.properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_transaction_type ON public.properties(transaction_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties(is_active);

-- Índice composto para consultas com múltiplos filtros
CREATE INDEX IF NOT EXISTS idx_properties_filters ON public.properties(is_active, transaction_type, property_type, neighborhood, city);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_active, is_featured) WHERE is_featured = true;
