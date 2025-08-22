-- SECURITY FIX: Remove public access to brokers table
-- This prevents direct harvesting of sensitive broker contact information
-- Public access must now go through the secure get_public_broker_info function

-- Remove the dangerous public access policy that exposes all broker fields
DROP POLICY IF EXISTS "Public can view safe broker info" ON public.brokers;

-- The remaining policies ensure:
-- 1. Only authenticated brokers can view their complete profiles (including sensitive data)
-- 2. Only authenticated brokers can modify their profiles
-- 3. Public access must use the get_public_broker_info function which filters sensitive fields

-- Verify the secure function exists and is properly filtering sensitive data
-- This function only returns safe fields: business_name, display_name, website_slug, 
-- logo_url, colors, about_text, footer_text, etc. 
-- It does NOT expose: email, phone, whatsapp_number, contact_email, address