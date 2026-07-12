-- Add avatar_url column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Grant public access to read and insert avatars
-- Allow public select
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Allow public insert (for MVP, anyone can upload)
CREATE POLICY "Anyone can upload an avatar." 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'avatars' );
