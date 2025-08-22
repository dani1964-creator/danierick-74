-- Add new fields to brokers table for WhatsApp button customization and property code editing
ALTER TABLE public.brokers 
ADD COLUMN whatsapp_button_text TEXT DEFAULT 'Fale com um corretor',
ADD COLUMN whatsapp_button_color TEXT DEFAULT '#25D366';

-- Add property code field to properties table
ALTER TABLE public.properties 
ADD COLUMN property_code TEXT;