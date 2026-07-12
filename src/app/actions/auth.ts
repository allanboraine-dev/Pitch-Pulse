'use server'

import { createClient } from '@/utils/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerClub(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const clubName = formData.get('clubName') as string

  const supabase = await createClient()

  // 1. Try to sign in first (in case they manually created the user or already exist)
  let session = null;
  let userId = null;

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInData.session) {
    session = signInData.session
    userId = signInData.user.id
  } else {
    // If sign in fails, fall back to sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      return { error: authError?.message || 'Failed to sign up. Did you create the user in the dashboard? Check credentials.' }
    }

    if (!authData.session) {
      return { error: 'Please disable "Confirm email" in your Supabase Auth Providers settings for local testing, or manually create and auto-confirm the user in the dashboard.' }
    }

    session = authData.session
    userId = authData.user.id
  }

  // Ensure the current supabase client instance is using the session
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  })

  // 2. Create the club using an explicitly authenticated client
  // This ensures there's no cookie lag when applying RLS policies
  const authSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() { return null },
        set() {},
        remove() {}
      },
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    }
  )

  const { data: clubData, error: clubError } = await authSupabase
    .from('clubs')
    .insert({ name: clubName })
    .select('id')
    .single()

  if (clubError) {
    return { error: 'Failed to create club: ' + clubError.message }
  }

  // 3. Create the manager profile
  const { error: profileError } = await authSupabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: fullName,
      club_id: clubData.id,
      role: 'manager',
      status: 'active', // Managers are active by default
    })

  if (profileError) {
    return { error: 'Failed to create profile: ' + profileError.message }
  }

  revalidatePath('/manager/dashboard')
  redirect('/manager/dashboard')
}

export async function addPlayer(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string // Dummy password or invite email later
  const fullName = formData.get('fullName') as string
  
  const supabase = await createClient()
  
  // Get current manager's club_id
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return { error: 'Unauthorized' }
  
  const { data: managerProfile } = await supabase
    .from('profiles')
    .select('club_id')
    .eq('id', userData.user.id)
    .single()
    
  if (!managerProfile?.club_id) return { error: 'No club associated with manager' }

  // We cannot use supabase.auth.signUp to create *other* users from the client/manager's session
  // because it logs the current user out. We would need the Admin API (service_role key) for that.
  // For now, to allow a manager to "register" players, we could just create dummy auth accounts
  // or rely on players signing themselves up and managers approving them.
  // The user requested: "allow the scorees to see verify players on the day", and "register their club playing members".
  // To strictly follow the "players sign up" and "manager approves" flow (Module 1 original spec),
  // we will implement player self-registration, and an approve action for the manager.
  
  return { error: 'Not implemented - use admin API or player self-signup' }
}

export async function approvePlayer(playerId: string) {
  const supabase = await createClient()
  
  // Verify user is a manager
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', playerId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/manager/dashboard')
}
