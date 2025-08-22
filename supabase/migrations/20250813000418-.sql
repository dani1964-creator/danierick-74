-- Criação da estrutura multi-tenant para o SaaS de imobiliária

-- Tabela de perfis dos corretores (tenants)
CREATE TABLE public.brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  display_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website_slug TEXT UNIQUE, -- slug único para o site público (ex: joao-corretor)
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb', -- cor primária personalizada
  secondary_color TEXT DEFAULT '#64748b', -- cor secundária personalizada
  about_text TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  plan_type TEXT DEFAULT 'free', -- free, basic, premium
  max_properties INTEGER DEFAULT 5, -- limite baseado no plano
  domain_config JSONB, -- configurações de domínio personalizado
  tracking_scripts JSONB, -- pixels de rastreamento
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de imóveis
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL, -- casa, apartamento, terreno, comercial
  transaction_type TEXT NOT NULL, -- venda, aluguel
  price DECIMAL(15,2) NOT NULL,
  address TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_m2 DECIMAL(10,2),
  parking_spaces INTEGER,
  features TEXT[], -- array de características (piscina, churrasqueira, etc)
  images TEXT[], -- array de URLs das imagens
  main_image_url TEXT, -- imagem principal
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- imóvel em destaque
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de leads/contatos
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT, -- origem do lead (site, whatsapp, etc)
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para brokers
CREATE POLICY "Brokers can view their own profile" 
ON public.brokers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Brokers can update their own profile" 
ON public.brokers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their broker profile" 
ON public.brokers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para properties
CREATE POLICY "Brokers can view their own properties" 
ON public.properties 
FOR SELECT 
USING (
  broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Brokers can insert their own properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (
  broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Brokers can update their own properties" 
ON public.properties 
FOR UPDATE 
USING (
  broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Brokers can delete their own properties" 
ON public.properties 
FOR DELETE 
USING (
  broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  )
);

-- Políticas RLS para leads
CREATE POLICY "Brokers can view their own leads" 
ON public.leads 
FOR SELECT 
USING (
  broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Brokers can update their own leads" 
ON public.leads 
FOR UPDATE 
USING (
  broker_id IN (
    SELECT id FROM public.brokers WHERE user_id = auth.uid()
  )
);

-- Política pública para inserir leads (formulário de contato público)
CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Função para criar perfil do corretor automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_broker()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.brokers (user_id, business_name, display_name, email, website_slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'business_name', 'Minha Imobiliária'),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    NEW.email,
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email), ' ', '-')) || '-' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente no cadastro
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_broker();

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_brokers_updated_at
  BEFORE UPDATE ON public.brokers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_brokers_user_id ON public.brokers(user_id);
CREATE INDEX idx_brokers_website_slug ON public.brokers(website_slug);
CREATE INDEX idx_properties_broker_id ON public.properties(broker_id);
CREATE INDEX idx_properties_is_active ON public.properties(is_active);
CREATE INDEX idx_properties_is_featured ON public.properties(is_featured);
CREATE INDEX idx_leads_broker_id ON public.leads(broker_id);
CREATE INDEX idx_leads_property_id ON public.leads(property_id);

-- Bucket para imagens dos imóveis
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Políticas de storage para imagens
CREATE POLICY "Brokers can upload property images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Brokers can view all property images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-images');

CREATE POLICY "Brokers can update their property images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'property-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Brokers can delete their property images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'property-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);