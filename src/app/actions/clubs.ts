'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addClub(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const managerName = formData.get('manager_name') as string | null

  if (!name) {
    return { error: 'Club name is required' }
  }

  // Insert club
  const { data: clubData, error: clubError } = await supabase
    .from('clubs')
    .insert([{
      name,
      description: description || null
    }])
    .select()
    .single()

  if (clubError) {
    console.error('Add club error:', clubError)
    return { error: clubError.message }
  }

  // Optionally insert a manager profile if a manager name was provided
  if (managerName) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(), // Offline profile bypassing auth
        full_name: managerName,
        club_id: clubData.id,
        role: 'manager',
        status: 'active' // Auto-approve offline managers
      })

    if (profileError) {
      console.error('Error creating manager profile:', profileError)
      // Continue anyway, we created the club.
    }
  }

  revalidatePath('/directory')
  return { success: true, club: clubData }
}
