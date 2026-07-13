'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function createMatch(formData: FormData) {
  const homeTeamId = formData.get('homeTeamId') as string
  const awayTeamId = formData.get('awayTeamId') as string
  const maxOvers = parseInt(formData.get('maxOvers') as string) || 20

  if (homeTeamId === awayTeamId) {
    return { error: 'Home and Away teams must be different.' }
  }

  const supabase = await createClient()

  const cookieStore = await cookies()
  if (!cookieStore.get('pitchpulse_auth')?.value) return { error: 'Unauthorized' }

  // Insert match
  const { data: match, error } = await supabase
    .from('matches')
    .insert({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      max_overs: maxOvers,
      status: 'scheduled'
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  redirect(`/matches/${match.id}/setup`)
}

export async function saveSquads(matchId: string, homeTeamId: string, awayTeamId: string, homePlayers: string[], awayPlayers: string[]) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Unauthorized' }

  const squads = [
    ...homePlayers.map(playerId => ({ match_id: matchId, team_id: homeTeamId, player_id: playerId })),
    ...awayPlayers.map(playerId => ({ match_id: matchId, team_id: awayTeamId, player_id: playerId }))
  ]

  const { error: squadError } = await supabase.from('match_squads').insert(squads)
  if (squadError) return { error: squadError.message }

  const { error: matchError } = await supabase.from('matches').update({ 
    status: 'in_progress',
    home_team_id: homeTeamId,
    away_team_id: awayTeamId
  }).eq('id', matchId)
  if (matchError) return { error: matchError.message }

  redirect(`/matches/${matchId}/score`)
}
