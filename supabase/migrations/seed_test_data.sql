-- Seed Script to generate 2 Clubs and 22 Active Players
-- This bypasses the Auth API rate limits so you can test Module 2!

DO $$
DECLARE
    club1_id UUID := gen_random_uuid();
    club2_id UUID := gen_random_uuid();
    i INT;
    new_user_id UUID;
BEGIN
    -- 1. Create 2 Clubs
    INSERT INTO public.clubs (id, name, manager_invite_code)
    VALUES 
        (club1_id, 'Thunder Strikers CC', 'THUNDER2024'),
        (club2_id, 'Royal Challengers', 'ROYAL2024');

    -- 2. Create 11 Players for Club 1
    FOR i IN 1..11 LOOP
        new_user_id := gen_random_uuid();
        
        -- Insert into auth.users (dummy password)
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'thunder_player' || i || '@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());
        
        -- Insert into public.profiles
        INSERT INTO public.profiles (id, full_name, club_id, role, status)
        VALUES (new_user_id, 'Thunder Player ' || i, club1_id, 'player', 'active');
    END LOOP;

    -- 3. Create 11 Players for Club 2
    FOR i IN 1..11 LOOP
        new_user_id := gen_random_uuid();
        
        -- Insert into auth.users (dummy password)
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'royal_player' || i || '@test.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());
        
        -- Insert into public.profiles
        INSERT INTO public.profiles (id, full_name, club_id, role, status)
        VALUES (new_user_id, 'Royal Player ' || i, club2_id, 'player', 'active');
    END LOOP;

END $$;
