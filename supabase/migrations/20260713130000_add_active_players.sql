-- Add active player columns to matches table to sync Live Scorecard before deliveries
ALTER TABLE public.matches
ADD COLUMN current_batter_id UUID REFERENCES public.profiles(id) NULL,
ADD COLUMN current_non_striker_id UUID REFERENCES public.profiles(id) NULL,
ADD COLUMN current_bowler_id UUID REFERENCES public.profiles(id) NULL;

-- Make sure Realtime is enabled for matches so Fan View can subscribe to it
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
