-- Seed 11 Dummy Players for West End Dummy Club
-- Run this in the Supabase SQL Editor

DO $$
DECLARE
    target_club_id UUID;
    dummy_auth_id UUID;
    i INT;
    player_name TEXT;
BEGIN
    -- 1. Find the Club ID for 'West End Dummy'
    SELECT id INTO target_club_id FROM public.clubs WHERE name = 'West End Dummy' LIMIT 1;
    
    IF target_club_id IS NULL THEN
        RAISE EXCEPTION 'Club "West End Dummy" not found. Please ensure the club is created first.';
    END IF;

    -- 2. Insert 11 Players
    FOR i IN 1..11 LOOP
        -- Generate a unique auth ID for the foreign key constraint
        dummy_auth_id := gen_random_uuid();
        
        -- Generate modern cricket names for the opposition
        player_name := CASE i
            WHEN 1 THEN 'Rohit Sharma'
            WHEN 2 THEN 'Quinton de Kock'
            WHEN 3 THEN 'Virat Kohli'
            WHEN 4 THEN 'Babar Azam'
            WHEN 5 THEN 'Steve Smith'
            WHEN 6 THEN 'Ben Stokes'
            WHEN 7 THEN 'MS Dhoni'
            WHEN 8 THEN 'Rashid Khan'
            WHEN 9 THEN 'Pat Cummins'
            WHEN 10 THEN 'Kagiso Rabada'
            WHEN 11 THEN 'Jasprit Bumrah'
        END;

        -- We must first insert into auth.users to satisfy the foreign key constraint on profiles
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (
            dummy_auth_id, 
            '00000000-0000-0000-0000-000000000000', 
            'westenddummy' || i || '@test.com', 
            'dummy_pass', 
            now(), 
            '{"provider":"email","providers":["email"]}', 
            '{}', 
            now(), 
            now(), 
            '', '', '', ''
        );

        -- Insert into public.profiles
        INSERT INTO public.profiles (id, full_name, club_id, role, status, created_at, updated_at)
        VALUES (
            dummy_auth_id,
            player_name,
            target_club_id,
            'player',
            'active', -- Auto-approve them
            now(),
            now()
        );
    END LOOP;
END $$;
