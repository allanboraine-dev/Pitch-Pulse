-- Add access_code column to clubs
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS access_code TEXT UNIQUE;

-- Create an index on access_code since we'll query by it often during login
CREATE INDEX IF NOT EXISTS idx_clubs_access_code ON public.clubs(access_code);

-- Open up RLS for clubs so we can query them without auth during registration/login flow
DROP POLICY IF EXISTS "Clubs are viewable by everyone." ON clubs;
CREATE POLICY "Clubs are viewable by everyone." ON clubs FOR SELECT USING (true);
