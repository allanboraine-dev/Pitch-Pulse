'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addClub(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null

  if (!name) {
    return { error: 'Club name is required' }
  }

  // Insert club
  const { data, error } = await supabase
    .from('clubs')
    .insert([{
      name,
      description: description || null
    }])
    .select()
    .single()

  if (error) {
    console.error('Add club error:', error)
    return { error: error.message }
  }

  revalidatePath('/directory')
  return { success: true, club: data }
}
