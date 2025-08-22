
-- Criar tabela para banners rotativos da home
CREATE TABLE public.home_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para links de redes sociais
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- facebook, instagram, youtube, linkedin, twitter, etc
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo WhatsApp na tabela brokers se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'brokers' AND column_name = 'whatsapp_number'
    ) THEN
        ALTER TABLE public.brokers ADD COLUMN whatsapp_number TEXT;
    END IF;
END $$;

-- RLS policies para home_banners
ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brokers can manage their own banners" 
  ON public.home_banners 
  FOR ALL 
  USING (broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  ))
  WITH CHECK (broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view active banners"
  ON public.home_banners
  FOR SELECT
  USING (is_active = true);

-- RLS policies para social_links
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brokers can manage their own social links" 
  ON public.social_links 
  FOR ALL 
  USING (broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  ))
  WITH CHECK (broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view active social links"
  ON public.social_links
  FOR SELECT
  USING (is_active = true);

-- Triggers para updated_at
CREATE TRIGGER update_home_banners_updated_at 
  BEFORE UPDATE ON public.home_banners 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at 
  BEFORE UPDATE ON public.social_links 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_home_banners_broker_active ON public.home_banners(broker_id, is_active);
CREATE INDEX idx_home_banners_order ON public.home_banners(display_order) WHERE is_active = true;
CREATE INDEX idx_social_links_broker_active ON public.social_links(broker_id, is_active);
CREATE INDEX idx_social_links_order ON public.social_links(display_order) WHERE is_active = true;
