-- Add overlay configuration fields to brokers table
ALTER TABLE public.brokers 
ADD COLUMN overlay_color TEXT DEFAULT '#000000',
ADD COLUMN overlay_opacity TEXT DEFAULT '50';