-- Add background style configuration fields to brokers table
ALTER TABLE public.brokers 
ADD COLUMN sections_background_style text DEFAULT 'style1',
ADD COLUMN sections_background_color_1 text DEFAULT '#2563eb',
ADD COLUMN sections_background_color_2 text DEFAULT '#64748b', 
ADD COLUMN sections_background_color_3 text DEFAULT '#ffffff';

-- Add comments for documentation
COMMENT ON COLUMN public.brokers.sections_background_style IS 'Selected background style for sections (style1, style2, style3, style4, style5)';
COMMENT ON COLUMN public.brokers.sections_background_color_1 IS 'Primary custom color for background styles';
COMMENT ON COLUMN public.brokers.sections_background_color_2 IS 'Secondary custom color for background styles';
COMMENT ON COLUMN public.brokers.sections_background_color_3 IS 'Tertiary custom color for background styles (optional)';