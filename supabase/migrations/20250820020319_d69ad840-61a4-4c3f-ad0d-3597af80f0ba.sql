-- Create realtors table for individual realtors working under a brokerage
CREATE TABLE public.realtors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  creci TEXT,
  commission_percentage NUMERIC(5,2) DEFAULT 50.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT realtors_broker_id_fkey FOREIGN KEY (broker_id) REFERENCES public.brokers(id) ON DELETE CASCADE,
  CONSTRAINT realtors_email_unique UNIQUE (broker_id, email),
  CONSTRAINT realtors_commission_check CHECK (commission_percentage >= 0 AND commission_percentage <= 100)
);

-- Enable RLS on realtors table
ALTER TABLE public.realtors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for realtors
CREATE POLICY "Brokers can view their own realtors"
ON public.realtors
FOR SELECT
USING (broker_id IN (
  SELECT id FROM public.brokers WHERE user_id = auth.uid()
));

CREATE POLICY "Brokers can insert their own realtors"
ON public.realtors
FOR INSERT
WITH CHECK (broker_id IN (
  SELECT id FROM public.brokers WHERE user_id = auth.uid()
));

CREATE POLICY "Brokers can update their own realtors"
ON public.realtors
FOR UPDATE
USING (broker_id IN (
  SELECT id FROM public.brokers WHERE user_id = auth.uid()
));

CREATE POLICY "Brokers can delete their own realtors"
ON public.realtors
FOR DELETE
USING (broker_id IN (
  SELECT id FROM public.brokers WHERE user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_realtors_updated_at
  BEFORE UPDATE ON public.realtors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtor_id to leads table to track which realtor is handling the lead
ALTER TABLE public.leads 
ADD COLUMN realtor_id UUID NULL,
ADD CONSTRAINT leads_realtor_id_fkey FOREIGN KEY (realtor_id) REFERENCES public.realtors(id) ON DELETE SET NULL;

-- Add comments for clarity
COMMENT ON TABLE public.realtors IS 'Individual realtors working under a brokerage';
COMMENT ON COLUMN public.realtors.commission_percentage IS 'Percentage of commission this realtor receives (default 50%)';
COMMENT ON COLUMN public.leads.realtor_id IS 'ID of the realtor assigned to handle this lead';