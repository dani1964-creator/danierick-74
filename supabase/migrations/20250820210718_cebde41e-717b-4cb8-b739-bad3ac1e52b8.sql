-- Add WhatsApp button text field to realtors table
ALTER TABLE public.realtors 
ADD COLUMN whatsapp_button_text TEXT DEFAULT 'Tire suas dúvidas!' NOT NULL;