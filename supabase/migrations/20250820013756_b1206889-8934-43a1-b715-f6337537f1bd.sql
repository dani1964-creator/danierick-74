-- Remove duplicate triggers that might be causing issues
DROP TRIGGER IF EXISTS validate_lead_input_trigger ON public.leads;
DROP TRIGGER IF EXISTS leads_audit_trigger ON public.leads;

-- Keep only the essential triggers  
-- validate_lead_before_insert_update and audit_leads_trigger should remain

-- Also check if there are any issues with the audit trigger for anonymous users
-- Modify audit function to handle anonymous users
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    operation,
    user_id,
    record_id,
    old_data,
    new_data
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(), -- This can be NULL for anonymous users
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';