'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// Helper to generate a random 6 character code
function generateAccessCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function registerClub(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const clubName = formData.get('clubName') as string

  const supabase = await createClient()

  // Generate unique access code
  let accessCode = generateAccessCode()
  let isUnique = false
  
  // Very basic retry loop to ensure uniqueness
  for(let i=0; i<3; i++) {
    const { data } = await supabase.from('clubs').select('id').eq('access_code', accessCode).single()
    if (!data) {
      isUnique = true
      break
    }
    accessCode = generateAccessCode()
  }

  if (!isUnique) {
    return { error: 'Failed to generate unique access code. Please try again.' }
  }

  // 1. Create the club
  const { data: clubData, error: clubError } = await supabase
    .from('clubs')
    .insert({
      name: clubName,
      access_code: accessCode
    })
    .select('id, access_code')
    .single()

  if (clubError) {
    return { error: 'Failed to create club: ' + clubError.message }
  }

  // Set the custom auth cookie
  const cookieStore = await cookies()
  cookieStore.set('pitchpulse_auth', JSON.stringify({
    club_id: clubData.id,
    access_code: clubData.access_code,
    role: 'manager'
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  // We don't bother creating a `profiles` row for the manager because they are anonymous!
  // If we need a profile, we can insert an offline one later if desired.

  revalidatePath('/manager/dashboard')
  redirect('/manager/dashboard')
}

export async function loginUser(formData: FormData) {
  const accessCode = (formData.get('accessCode') as string)?.toUpperCase()?.trim()

  if (!accessCode) {
    return { error: 'Access Code is required' }
  }

  const supabase = await createClient()

  // Find club by access code
  const { data: club, error } = await supabase
    .from('clubs')
    .select('id')
    .eq('access_code', accessCode)
    .single()

  if (error || !club) {
    return { error: 'Invalid Access Code' }
  }

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('pitchpulse_auth', JSON.stringify({
    club_id: club.id,
    access_code: accessCode,
    role: 'manager'
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  redirect('/manager/dashboard')
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('pitchpulse_auth')
  redirect('/login')
}
