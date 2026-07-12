-- Add result column to matches table
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS result TEXT;
