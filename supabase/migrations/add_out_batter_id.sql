-- Fix for missing out_batter_id column in deliveries table
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS out_batter_id UUID REFERENCES public.profiles(id);
