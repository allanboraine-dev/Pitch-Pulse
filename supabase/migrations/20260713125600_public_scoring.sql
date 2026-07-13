-- Remove restricted insert and update policies for matches, squads, and deliveries
DROP POLICY IF EXISTS "Managers can create matches" ON public.matches;
DROP POLICY IF EXISTS "Managers can update matches" ON public.matches;
DROP POLICY IF EXISTS "Managers can insert match squads" ON public.match_squads;
DROP POLICY IF EXISTS "Managers can insert deliveries (Scorers)" ON public.deliveries;

-- Create open public insert/update policies for the MVP
CREATE POLICY "Everyone can create matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can update matches" ON public.matches FOR UPDATE USING (true);
CREATE POLICY "Everyone can insert match squads" ON public.match_squads FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can insert deliveries" ON public.deliveries FOR INSERT WITH CHECK (true);
