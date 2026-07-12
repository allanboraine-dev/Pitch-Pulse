-- Add Fixture Support to Matches Table
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS season TEXT;

-- Update Database Schema Artifact reference
-- This is just a patch, no destructive actions needed.
