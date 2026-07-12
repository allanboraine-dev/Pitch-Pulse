import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ScorerDashboard from '@/components/scoring/ScorerDashboard'

export default async function ScoreMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Verify Manager Auth
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) redirect('/register-club')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (profile?.role !== 'manager') redirect('/dashboard')

  // Fetch Match Details
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, status, max_overs, home_team_id, away_team_id, home_team:clubs!matches_home_team_id_fkey(name), away_team:clubs!matches_away_team_id_fkey(name)')
    .eq('id', id)
    .single()

  if (matchError || !match) {
    return <div>Match not found</div>
  }

  // Fetch Squads
  const { data: squads } = await supabase
    .from('match_squads')
    .select('team_id, profiles(id, full_name)')
    .eq('match_id', id)

  if (!squads || squads.length === 0) {
    redirect(`/matches/${id}/setup`)
  }

  const homeSquad = squads.filter(s => s.team_id === match.home_team_id).map(s => s.profiles) as {id: string, full_name: string}[]
  const awaySquad = squads.filter(s => s.team_id === match.away_team_id).map(s => s.profiles) as {id: string, full_name: string}[]

  return (
    <ScorerDashboard 
      matchId={match.id}
      maxOvers={match.max_overs || 20}
      homeTeam={{ id: match.home_team_id, name: (match.home_team as any).name, squad: homeSquad }}
      awayTeam={{ id: match.away_team_id, name: (match.away_team as any).name, squad: awaySquad }}
    />
  )
}
