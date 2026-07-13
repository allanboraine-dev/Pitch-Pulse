import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditPlayerModal from '@/components/manager/EditPlayerModal'

export default async function ManagerPlayersPage() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id, role')
    .eq('id', userData.user.id)
    .single()

  if (!profile || !profile.club_id || profile.role !== 'manager') {
    redirect('/')
  }

  // Fetch all players for this club
  const { data: players } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, status')
    .eq('club_id', profile.club_id)
    .order('full_name')

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-12 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6 gap-6">
          <div>
            <Link href="/manager/dashboard" className="text-blue-500 hover:text-blue-400 text-sm font-bold mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Player Roster
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/signup" 
              className="bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 hover:text-blue-300 px-5 py-2.5 rounded-xl font-bold transition flex items-center justify-center text-sm shadow-lg border border-blue-900/50"
            >
              Copy Signup Link
            </Link>
          </div>
        </header>

        <section>
          {!players || players.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400">No players found in your club.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <div key={player.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center text-center gap-4 group hover:border-gray-600 transition-colors">
                  {player.avatar_url ? (
                    <img src={player.avatar_url} alt={player.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-700" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500">
                      {player.full_name.substring(0,2).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-bold text-white">{player.full_name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-800 px-2 py-0.5 rounded">
                        {player.role}
                      </span>
                    </div>
                  </div>

                  <EditPlayerModal player={player} />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
