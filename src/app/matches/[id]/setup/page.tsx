import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SquadSelectionForm from './SquadSelectionForm'

export default async function SquadSetupPage({ params }: { params: Promise<{ id: string }> }) {
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
    .select('id, status, home_team_id, away_team_id, home_team:clubs!matches_home_team_id_fkey(name), away_team:clubs!matches_away_team_id_fkey(name)')
    .eq('id', id)
    .single()

  if (matchError || !match) {
    return <div>Match not found</div>
  }

  if (match.status !== 'scheduled') {
    redirect(`/matches/${id}/score`)
  }

  // Fetch all clubs to allow team changes
  const { data: clubs } = await supabase.from('clubs').select('id, name').order('name')

  // Fetch all active players in the league
  const { data: allPlayers } = await supabase
    .from('profiles')
    .select('id, full_name, club_id')
    .eq('status', 'active')
    .order('full_name')

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Select Playing XI</h1>
          <p className="text-gray-400 text-sm">
            {/* @ts-ignore */}
            {match.home_team.name} vs {match.away_team.name}
          </p>
        </div>

        <SquadSelectionForm 
          matchId={id}
          initialHomeTeamId={match.home_team_id}
          initialAwayTeamId={match.away_team_id}
          clubs={clubs || []}
          allPlayers={allPlayers || []} 
        />
      </div>
    </div>
  )
}
