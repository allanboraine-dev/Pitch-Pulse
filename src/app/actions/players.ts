'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createJSClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function addPlayerToClub(clubId: string, playerName: string) {
  const supabase = await createClient()

  // Verify auth: Logged in users can add players
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  // Generate a random UUID for the offline player
  const playerId = crypto.randomUUID()

  // Insert the profile directly! 
  // (Requires dropping the profiles_id_fkey constraint in Supabase)
  const { error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: playerId,
      full_name: playerName,
      club_id: clubId,
      status: 'active',
      role: 'player'
    })

  if (insertError) {
    return { error: 'Failed to create offline player: ' + insertError.message }
  }

  revalidatePath('/directory')
  return { success: true }
}
