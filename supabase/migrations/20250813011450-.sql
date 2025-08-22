-- Fix function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.brokers (
    user_id, 
    business_name, 
    email,
    primary_color,
    secondary_color,
    plan_type,
    is_active,
    max_properties
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Minha Imobiliária'),
    NEW.email,
    '#2563eb',
    '#64748b', 
    'free',
    true,
    5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';