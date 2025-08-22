-- Create RLS policies for property-images storage bucket

-- Allow authenticated users to upload their own property images
CREATE POLICY "Users can upload property images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Allow public access to view property images
CREATE POLICY "Property images are publicly accessible" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'property-images');

-- Allow authenticated users to update their own property images
CREATE POLICY "Users can update property images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'property-images');

-- Allow authenticated users to delete their own property images
CREATE POLICY "Users can delete property images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'property-images');