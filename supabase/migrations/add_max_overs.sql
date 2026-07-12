-- Add max_overs to matches table
ALTER TABLE public.matches 
ADD COLUMN max_overs INT NOT NULL DEFAULT 20;

-- (Optional) Update existing matches to 20 overs just in case
UPDATE public.matches SET max_overs = 20 WHERE max_overs IS NULL;
