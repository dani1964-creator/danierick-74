-- Criar tabela de redes sociais
CREATE TABLE public.social_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id uuid NOT NULL,
  platform text NOT NULL,
  url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Brokers can manage their own social links" 
ON public.social_links 
FOR ALL 
USING (broker_id IN ( 
  SELECT brokers.id
  FROM brokers
  WHERE (brokers.user_id = auth.uid())
))
WITH CHECK (broker_id IN ( 
  SELECT brokers.id
  FROM brokers
  WHERE (brokers.user_id = auth.uid())
));

CREATE POLICY "Anyone can view active social links" 
ON public.social_links 
FOR SELECT 
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();