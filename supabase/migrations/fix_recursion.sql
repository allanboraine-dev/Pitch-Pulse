-- 1. Drop the recursive policies
DROP POLICY IF EXISTS "Managers can view all profiles in their own club" ON public.profiles;
DROP POLICY IF EXISTS "Managers can update club members" ON public.profiles;

-- 2. Create secure functions in the public schema instead of auth schema
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_club_id() RETURNS UUID AS $$
    SELECT club_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Add the safe policies back using the public functions
CREATE POLICY "Managers can view all profiles in their own club" ON public.profiles 
FOR SELECT USING (
    public.get_user_role() = 'manager' AND club_id = public.get_user_club_id()
);

CREATE POLICY "Managers can update club members" ON public.profiles 
FOR UPDATE USING (
    public.get_user_role() = 'manager' AND club_id = public.get_user_club_id()
);
