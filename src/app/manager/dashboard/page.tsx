import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'

export default async function ManagerDashboard() {
  const supabase = await createClient()

  const cookieStore = await cookies()
  const authCookieStr = cookieStore.get('pitchpulse_auth')?.value
  
  if (!authCookieStr) redirect('/login')

  let authData;
  try {
    authData = JSON.parse(authCookieStr)
  } catch (e) {
    redirect('/login')
  }

  const clubId = authData.club_id;
  const isManager = authData.role === 'manager'
  const accessCode = authData.access_code;

  if (!clubId) redirect('/login')
  // Fetch all matches
  const { data: allMatches } = await supabase
    .from('matches')
    .select('id, status, max_overs, scheduled_time, season, result, home_team:clubs!matches_home_team_id_fkey(name), away_team:clubs!matches_away_team_id_fkey(name)')
    .order('scheduled_time', { ascending: true })

  const myMatches = allMatches?.filter(m => m.status === 'scheduled' || m.status === 'in_progress') || []
  const completedMatches = allMatches?.filter(m => m.status === 'completed' || m.status === 'abandoned') || []

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-12 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
              {isManager ? 'Manager Dashboard' : 'Scorer Dashboard'}
            </h1>

            {isManager && (
              <div className="flex gap-2 items-center mt-2">
                <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1.5 rounded font-mono border border-gray-700 select-all cursor-pointer hover:bg-gray-700 transition">
                  Access Code: <span className="font-bold text-white tracking-widest ml-1">{accessCode}</span>
                </div>
              </div>
            )}
          </div>
          
          {isManager && (
            <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/manager/matches/new"
              className="bg-pitch-green hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center flex-1 sm:flex-none text-sm shadow-lg shadow-emerald-900/30 border border-emerald-500/50"
            >
              + Score a Game
            </Link>
            
            <Link 
              href="/manager/players"
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center justify-center flex-1 sm:flex-none gap-2 text-sm shadow-lg shadow-purple-900/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              My Players
            </Link>

            <Link 
              href="/manager/fixtures"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center justify-center flex-1 sm:flex-none gap-2 text-sm shadow-lg shadow-indigo-900/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Bulk Fixtures
            </Link>

            <Link 
              href="/directory"
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center justify-center flex-1 sm:flex-none gap-2 text-sm shadow-lg shadow-orange-900/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Directory
            </Link>

            <form action={async () => {
              'use server'
              const { logoutUser } = await import('@/app/actions/auth')
              await logoutUser()
            }}>
              <button 
                type="submit"
                className="bg-gray-800 hover:bg-red-900/80 text-gray-300 hover:text-red-200 px-5 py-2.5 rounded-xl font-bold transition flex items-center justify-center flex-1 sm:flex-none text-sm border border-gray-700 hover:border-red-800"
              >
                Sign Out
              </button>
            </form>
          </div>
          )}
        </header>

        {/* My Matches / Scoring */}
        <section>
          <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-2">
            <h2 className="text-xl font-semibold text-white">Scheduled Matches</h2>
            {isManager && (
              <Link href="/manager/matches/new" className="text-sm font-bold text-blue-500 hover:text-blue-400">
                + New Match
              </Link>
            )}
          </div>
          
          {myMatches.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-4">No scheduled matches found.</p>
              {isManager && (
                <Link href="/manager/matches/new" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold inline-block">
                  Create Match
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myMatches.map((match) => {
                const date = match.scheduled_time ? new Date(match.scheduled_time) : null;
                const dateString = date ? date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD';
                const timeString = date ? date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
                
                // If scheduled, they need to setup squads. If in_progress, they can jump straight to scoring.
                const actionUrl = match.status === 'scheduled' ? `/matches/${match.id}/setup` : `/matches/${match.id}/score`;
                const actionText = match.status === 'scheduled' ? 'Score a Game' : 'Resume Scoring';
                const statusColor = match.status === 'scheduled' ? 'bg-gray-800 text-gray-400' : 'bg-green-900/50 text-green-400 border border-green-900/50';

                return (
                  <div key={match.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${statusColor}`}>
                          {match.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold bg-gray-800/50 px-2 py-0.5 rounded">{match.max_overs} Overs</span>
                        {match.season && (
                          <span className="text-xs text-blue-400 font-semibold bg-blue-900/20 px-2 py-0.5 rounded">{match.season}</span>
                        )}
                      </div>
                      <div className="text-xl font-bold text-white">
                        {(match.home_team as any).name} <span className="text-gray-600 mx-2 text-sm font-normal">vs</span> {(match.away_team as any).name}
                      </div>
                      {date && (
                        <div className="text-sm text-gray-400 mt-1">
                          {dateString} • {timeString}
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 md:pt-0 border-t md:border-t-0 border-gray-800">
                      <Link 
                        href={actionUrl}
                        className="block w-full md:w-auto text-center bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition whitespace-nowrap"
                      >
                        {actionText} →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Completed Matches */}
        {completedMatches.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">Completed Matches</h2>
            <div className="grid grid-cols-1 gap-4">
              {completedMatches.map((match) => {
                const date = match.scheduled_time ? new Date(match.scheduled_time) : null;
                const dateString = date ? date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '';
                
                return (
                  <div key={match.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider bg-gray-800 text-gray-500">
                          {match.status}
                        </span>
                        {match.season && (
                          <span className="text-xs text-blue-400 font-semibold bg-blue-900/20 px-2 py-0.5 rounded">{match.season}</span>
                        )}
                      </div>
                      <div className="text-xl font-bold text-white line-through decoration-gray-700">
                        {(match.home_team as any).name} <span className="text-gray-600 mx-2 text-sm font-normal line-through decoration-gray-700">vs</span> {(match.away_team as any).name}
                      </div>
                      {date && (
                        <div className="text-sm text-gray-500 mt-1">
                          {dateString}
                        </div>
                      )}
                      {match.result && (
                        <div className="mt-2 text-sm font-semibold text-green-400 bg-green-900/20 px-3 py-1.5 rounded inline-block border border-green-800/30">
                          {match.result}
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 md:pt-0 border-t md:border-t-0 border-gray-800">
                      <Link 
                        href={`/live/${match.id}`}
                        target="_blank"
                        className="block w-full md:w-auto text-center bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition whitespace-nowrap"
                      >
                        View Scorecard
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
