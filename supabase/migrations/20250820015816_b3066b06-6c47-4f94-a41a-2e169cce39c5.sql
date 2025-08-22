-- Add financial fields to leads table for converted leads
ALTER TABLE public.leads 
ADD COLUMN deal_value NUMERIC(12,2) NULL,
ADD COLUMN commission_value NUMERIC(12,2) NULL,
ADD COLUMN deal_closed_at TIMESTAMP WITH TIME ZONE NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.leads.deal_value IS 'Total deal value when lead is converted';
COMMENT ON COLUMN public.leads.commission_value IS 'Commission amount from the deal';
COMMENT ON COLUMN public.leads.deal_closed_at IS 'Date when the deal was closed';