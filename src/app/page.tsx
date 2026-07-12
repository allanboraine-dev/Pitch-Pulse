import Link from "next/link";
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: scheduledMatches } = await supabase
    .from('matches')
    .select('id, status, max_overs, scheduled_time, season, home_team:clubs!matches_home_team_id_fkey(name), away_team:clubs!matches_away_team_id_fkey(name)')
    .eq('status', 'scheduled')
    .order('scheduled_time', { ascending: true })
    .limit(5)
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-transparent font-sans text-white">
      <main className="flex flex-col items-center justify-center p-8 max-w-2xl w-full text-center">
        
        <div className="mb-12">
          <h1 className="text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Pitch Pulse
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            Live Cricket Scoring & Fan Engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Fan Route */}
          <Link href="/live" className="group flex flex-col p-8 bg-gray-900 border border-gray-800 hover:border-red-500/50 rounded-3xl transition-all hover:shadow-2xl hover:shadow-red-500/10 items-center justify-center">
            <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Fan View</h2>
            <p className="text-gray-500">Watch live matches in real-time.</p>
          </Link>

          {/* Manager/Scorer Route */}
          <Link href="/manager/dashboard" className="group flex flex-col p-8 bg-gray-900 border border-gray-800 hover:border-blue-500/50 rounded-3xl transition-all hover:shadow-2xl hover:shadow-blue-500/10 items-center justify-center">
            <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Manager & Scorer</h2>
            <p className="text-gray-500">Manage clubs, squads, and score live.</p>
          </Link>
        </div>

        {/* Scheduled Matches Section */}
        <div className="mt-16 w-full text-left">
          <h3 className="text-2xl font-bold text-gray-300 mb-6 border-b border-gray-800 pb-2">
            Scheduled for Today
          </h3>
          
          {!scheduledMatches || scheduledMatches.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
              <p className="text-gray-500">No matches scheduled for today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {scheduledMatches.map((match) => {
                const date = match.scheduled_time ? new Date(match.scheduled_time) : null;
                const dateString = date ? date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD';
                const timeString = date ? date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
                
                const actionUrl = match.status === 'scheduled' ? `/matches/${match.id}/setup` : `/matches/${match.id}/score`;
                
                return (
                  <Link href={actionUrl} key={match.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(37,99,235,0.15)] hover:bg-gray-800/80 transition-all gap-4 group cursor-pointer block">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-bold rounded uppercase tracking-wider">Scheduled</span>
                        <span className="text-xs text-gray-500 font-semibold bg-gray-800/50 px-2 py-0.5 rounded">{match.max_overs} Overs</span>
                        {match.season && (
                          <span className="text-xs text-blue-400 font-semibold bg-blue-900/20 px-2 py-0.5 rounded">{match.season}</span>
                        )}
                      </div>
                      <div className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                        {(match.home_team as any).name} <span className="text-gray-600 mx-2 text-sm font-normal">vs</span> {(match.away_team as any).name}
                      </div>
                    </div>
                    
                    <div className="md:text-right border-t md:border-t-0 md:border-l border-gray-800 pt-3 md:pt-0 md:pl-5 flex md:flex-col items-center md:items-end justify-between">
                      <div>
                        <div className="text-lg font-bold text-gray-300">{dateString}</div>
                        <div className="text-sm text-gray-500 font-medium">{timeString}</div>
                      </div>
                      <div className="md:hidden mt-2 text-sm font-bold text-blue-500 group-hover:text-blue-400">Score Match →</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
