-- Add star_performers column to matches table
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS star_performers TEXT;
