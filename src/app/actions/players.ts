'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createJSClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function addPlayerToClub(formData: FormData) {
  const clubId = formData.get('clubId') as string
  const playerName = formData.get('playerName') as string
  const avatarFile = formData.get('avatar') as File | null

  if (!clubId || !playerName) {
    return { error: 'Club ID and Player Name are required' }
  }

  const supabase = await createClient()

  // Generate a random UUID for the offline player
  const playerId = crypto.randomUUID()
  
  let avatar_url = null;

  // Handle avatar upload if provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${playerId}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      // We can decide to either fail the whole process or just continue without the avatar.
      // We'll continue but log the error.
    } else if (uploadData) {
      // Get the public URL for the uploaded avatar
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
        
      avatar_url = publicUrlData.publicUrl
    }
  }

  // Insert the profile directly! 
  const { error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: playerId,
      full_name: playerName,
      club_id: clubId,
      status: 'active',
      role: 'player',
      ...(avatar_url ? { avatar_url } : {})
    })

  if (insertError) {
    return { error: 'Failed to create offline player: ' + insertError.message }
  }

  revalidatePath('/directory')
  revalidatePath('/manager/players')
  return { success: true }
}

export async function editPlayerProfile(formData: FormData) {
  const playerId = formData.get('playerId') as string
  const playerName = formData.get('playerName') as string
  const avatarFile = formData.get('avatar') as File | null

  if (!playerId || !playerName) {
    return { error: 'Player ID and Player Name are required' }
  }

  const supabase = await createClient()

  // Verify Manager Auth
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  let avatar_url = undefined;

  // Handle avatar upload if provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${playerId}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
    } else if (uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
        
      avatar_url = publicUrlData.publicUrl
    }
  }

  // Update the profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name: playerName,
      ...(avatar_url ? { avatar_url } : {})
    })
    .eq('id', playerId)

  if (updateError) {
    return { error: 'Failed to update player: ' + updateError.message }
  }

  revalidatePath('/manager/players')
  return { success: true }
}
