-- Add new address fields to properties table
ALTER TABLE public.properties 
ADD COLUMN neighborhood text,
ADD COLUMN uf text,
ADD COLUMN status text DEFAULT 'active';

-- Update existing properties status
UPDATE public.properties SET status = 'active' WHERE status IS NULL;

-- Add background_image_url to brokers table for public site customization
ALTER TABLE public.brokers 
ADD COLUMN background_image_url text;