-- Adicionar campos para título e subtítulo do hero banner
ALTER TABLE public.brokers 
ADD COLUMN hero_title text DEFAULT 'Encontre o lar dos seus sonhos',
ADD COLUMN hero_subtitle text DEFAULT 'Oferecemos os melhores imóveis da região';