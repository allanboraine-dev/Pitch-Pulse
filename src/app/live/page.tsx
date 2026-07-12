import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function LiveMatchesPage() {
  const supabase = await createClient()

  // Fetch all matches that are 'in_progress' or 'completed'
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, status, result, star_performers, home_team:clubs!matches_home_team_id_fkey(name), away_team:clubs!matches_away_team_id_fkey(name), max_overs')
    .in('status', ['in_progress', 'completed'])
    .order('created_at', { ascending: false })

  const liveMatches = matches?.filter(m => m.status === 'in_progress') || []
  const completedMatches = matches?.filter(m => m.status === 'completed') || []

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black tracking-tight">Live Matches <span className="text-red-500 animate-pulse">●</span></h1>
          <Link href="/" className="text-gray-400 hover:text-white transition">
            Home
          </Link>
        </div>

        {error ? (
          <div className="p-4 bg-red-900/20 text-red-400 rounded-xl border border-red-900">
            Failed to load live matches.
          </div>
        ) : (
          <div className="space-y-16">
            <section>
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-2">Live Now</h2>
              {liveMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveMatches.map((match) => (
                    <Link key={match.id} href={`/live/${match.id}`} className="block group">
                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all group-hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-900/20">
                        <div className="flex justify-between items-center mb-4">
                          <span className="px-3 py-1 bg-red-500/10 text-red-500 font-bold text-xs rounded-full uppercase tracking-wider animate-pulse">
                            Live
                          </span>
                          <span className="text-gray-500 text-sm font-semibold">{match.max_overs} Overs</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xl">{(match.home_team as any).name}</span>
                          </div>
                          <div className="text-gray-600 font-bold text-sm">vs</div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xl">{(match.away_team as any).name}</span>
                          </div>
                        </div>
                        <div className="mt-6 text-sm text-blue-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Scorecard <span>→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                  <p className="text-gray-500">No live matches right now.</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-800 pb-2">Completed Matches</h2>
              {completedMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedMatches.map((match) => (
                    <Link key={match.id} href={`/live/${match.id}`} className="block group">
                      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all group-hover:border-gray-600">
                        <div className="flex justify-between items-center mb-4">
                          <span className="px-3 py-1 bg-gray-800 text-gray-400 font-bold text-xs rounded-full uppercase tracking-wider">
                            Completed
                          </span>
                          <span className="text-gray-500 text-sm font-semibold">{match.max_overs} Overs</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xl">{(match.home_team as any).name}</span>
                          </div>
                          <div className="text-gray-600 font-bold text-sm">vs</div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xl">{(match.away_team as any).name}</span>
                          </div>
                        </div>
                        {match.result && (
                          <div className="mt-4 p-3 bg-green-900/20 border border-green-900/50 rounded-lg text-green-400 font-bold text-sm">
                            🏆 {match.result}
                          </div>
                        )}
                        {match.star_performers && (
                          <div className="mt-2 p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg text-blue-300 font-medium text-xs">
                            {match.star_performers}
                          </div>
                        )}
                        <div className="mt-4 text-sm text-gray-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Full Scorecard <span>→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
                  <p className="text-gray-500">No matches have been completed recently.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
