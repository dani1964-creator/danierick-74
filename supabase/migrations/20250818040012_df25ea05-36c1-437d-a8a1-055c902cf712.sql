-- Add slug column to properties table
ALTER TABLE public.properties 
ADD COLUMN slug TEXT;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Update existing properties with slugs
UPDATE public.properties 
SET slug = generate_slug(title) || '-' || SUBSTRING(id::text, 1, 8);

-- Create unique index on slug
CREATE UNIQUE INDEX idx_properties_slug ON public.properties(slug);

-- Add constraint to make slug not null for future inserts
ALTER TABLE public.properties 
ALTER COLUMN slug SET NOT NULL;

-- Create trigger to auto-generate slug for new properties
CREATE OR REPLACE FUNCTION set_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title) || '-' || SUBSTRING(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_property_slug
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION set_property_slug();