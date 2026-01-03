-- Create public storage bucket for assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to all files in the assets bucket
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Allow uploads for authenticated users"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets');

-- Allow service role to manage all files
CREATE POLICY IF NOT EXISTS "Allow service role full access"
ON storage.objects FOR ALL
USING (bucket_id = 'assets' AND auth.role() = 'service_role');
