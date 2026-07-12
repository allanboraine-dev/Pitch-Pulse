-- Remove restricted insert policies
DROP POLICY IF EXISTS "Authenticated users can create clubs" ON public.clubs;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create open public insert policies for the MVP
CREATE POLICY "Everyone can create clubs" ON public.clubs FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
