import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import LiveScorecard from '@/components/live/LiveScorecard'

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch Match Details
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, status, result, max_overs, home_team_id, away_team_id, home_team:clubs!matches_home_team_id_fkey(name), away_team:clubs!matches_away_team_id_fkey(name)')
    .eq('id', id)
    .single()

  if (matchError || !match) {
    notFound()
  }

  // Fetch Squads
  const { data: squads, error: squadsError } = await supabase
    .from('match_squads')
    .select('team_id, profiles(id, full_name)')
    .eq('match_id', id)

  if (squadsError || !squads) {
    return <div>Error loading squads</div>
  }

  const homeSquad = squads
    .filter(s => s.team_id === match.home_team_id)
    .map(s => s.profiles)
  const awaySquad = squads
    .filter(s => s.team_id === match.away_team_id)
    .map(s => s.profiles)

  return (
    <LiveScorecard 
      matchId={match.id}
      status={match.status}
      result={match.result}
      maxOvers={match.max_overs || 20}
      homeTeam={{ id: match.home_team_id, name: (match.home_team as any).name, squad: homeSquad as any[] }}
      awayTeam={{ id: match.away_team_id, name: (match.away_team as any).name, squad: awaySquad as any[] }}
    />
  )
}
