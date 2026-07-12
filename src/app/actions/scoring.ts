'use server'

import { createClient } from '@/utils/supabase/server'
import { DeliveryEvent } from '@/hooks/useScoringEngine'

export async function syncDeliveries(deliveries: DeliveryEvent[]) {
  if (!deliveries || deliveries.length === 0) return { success: true }

  const supabase = await createClient()

  // Verify Manager Auth
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('deliveries')
    .insert(deliveries)

  if (error) {
    throw new Error('Failed to sync deliveries: ' + error.message)
  }

  return { success: true }
}

export async function closeMatch(matchId: string, resultString: string, starPerformers?: string) {
  const supabase = await createClient()

  // Verify auth
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  // Update match status to completed and save result and performers
  const { error } = await supabase
    .from('matches')
    .update({ 
      status: 'completed',
      result: resultString,
      star_performers: starPerformers
    })
    .eq('id', matchId)

  if (error) {
    return { error: 'Failed to close match: ' + error.message }
  }

  return { success: true }
}

export async function resetMatch(matchId: string) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  // Delete all deliveries
  const { error: delError } = await supabase
    .from('deliveries')
    .delete()
    .eq('match_id', matchId)
  
  if (delError) return { error: 'Failed to clear deliveries: ' + delError.message }

  // Delete match squads so they can be re-picked
  const { error: sqError } = await supabase
    .from('match_squads')
    .delete()
    .eq('match_id', matchId)

  if (sqError) return { error: 'Failed to clear squads: ' + sqError.message }

  // Reset match status to scheduled
  const { error: matchError } = await supabase
    .from('matches')
    .update({ status: 'scheduled', result: null })
    .eq('id', matchId)

  if (matchError) return { error: 'Failed to reset match status: ' + matchError.message }

  return { success: true }
}
