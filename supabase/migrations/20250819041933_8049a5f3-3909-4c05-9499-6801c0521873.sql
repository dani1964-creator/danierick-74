-- Add missing fields to brokers table for proper organization
ALTER TABLE public.brokers 
ADD COLUMN IF NOT EXISTS about_text text,
ADD COLUMN IF NOT EXISTS footer_text text DEFAULT 'Todos os direitos reservados';