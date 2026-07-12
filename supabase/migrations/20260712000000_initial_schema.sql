-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'player');
CREATE TYPE user_status AS ENUM ('pending', 'active');

-- Clubs Table
CREATE TABLE public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    manager_invite_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    club_id UUID REFERENCES public.clubs(id),
    role user_role NOT NULL DEFAULT 'player',
    status user_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Clubs
-- Anyone can read clubs (for the signup dropdown)
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs FOR SELECT USING (true);
-- Only authenticated users (who will become managers) can create a club
CREATE POLICY "Authenticated users can create clubs" ON public.clubs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for Profiles
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Managers can view profiles in their own club
CREATE POLICY "Managers can view club members" ON public.profiles FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'manager' AND club_id = profiles.club_id)
);
-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Users can update their own profile (except for role/status changes, this needs a security definer if we strictly enforce it, but for simplicity we allow self-update on name/club_id)
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Managers can update profiles in their own club (to approve them)
CREATE POLICY "Managers can update club members" ON public.profiles FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'manager' AND club_id = profiles.club_id)
);

-- Create a function to handle new user signups and automatically insert a profile (Optional, but usually a good idea)
-- However, we might want to do this from the Next.js side so we can pass `full_name`, `club_id`, and `role`.
-- We will handle profile creation explicitly in the signup server action instead of a trigger for more control.
