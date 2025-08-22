-- Fix security warnings for functions by adding search_path
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  slug_text TEXT;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug_text := LOWER(title);
  slug_text := REGEXP_REPLACE(slug_text, '[àáâãäå]', 'a', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '[èéêë]', 'e', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '[ìíîï]', 'i', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '[òóôõö]', 'o', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '[ùúûü]', 'u', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '[ç]', 'c', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '[ñ]', 'n', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '[^a-z0-9\s\-]', '', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '\s+', '-', 'g');
  slug_text := REGEXP_REPLACE(slug_text, '-+', '-', 'g');
  slug_text := TRIM(BOTH '-' FROM slug_text);
  
  RETURN slug_text;
END;
$$;

-- Fix security warnings for trigger function by adding search_path
CREATE OR REPLACE FUNCTION set_property_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title) || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;