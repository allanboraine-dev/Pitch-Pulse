-- Seed 11 Dummy Players for West End Club
-- Run this in the Supabase SQL Editor

DO $$
DECLARE
    west_end_id UUID;
    dummy_auth_id UUID;
    i INT;
    player_name TEXT;
BEGIN
    -- 1. Find the Club ID for 'West End'
    SELECT id INTO west_end_id FROM public.clubs WHERE name = 'West End' LIMIT 1;
    
    IF west_end_id IS NULL THEN
        RAISE EXCEPTION 'Club "West End" not found. Please ensure the club is created first.';
    END IF;

    -- 2. Insert 11 Players
    FOR i IN 1..11 LOOP
        -- Generate a unique auth ID for the foreign key constraint
        dummy_auth_id := gen_random_uuid();
        
        -- Generate a classic cricket name
        player_name := CASE i
            WHEN 1 THEN 'Gordon Greenidge'
            WHEN 2 THEN 'Desmond Haynes'
            WHEN 3 THEN 'Viv Richards'
            WHEN 4 THEN 'Brian Lara'
            WHEN 5 THEN 'Clive Lloyd'
            WHEN 6 THEN 'Garfield Sobers'
            WHEN 7 THEN 'Malcolm Marshall'
            WHEN 8 THEN 'Michael Holding'
            WHEN 9 THEN 'Joel Garner'
            WHEN 10 THEN 'Andy Roberts'
            WHEN 11 THEN 'Courtney Walsh'
        END;

        -- We must first insert into auth.users to satisfy the foreign key constraint on profiles
        -- Since this is just test data, we insert a minimal auth.user record
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (
            dummy_auth_id, 
            '00000000-0000-0000-0000-000000000000', 
            'westendplayer' || i || '@test.com', 
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
            west_end_id,
            'player',
            'active', -- Auto-approve them
            now(),
            now()
        );
    END LOOP;
END $$;
