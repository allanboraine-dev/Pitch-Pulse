import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import AddPlayerButton from '@/components/directory/AddPlayerButton'
import AddClubButton from '@/components/directory/AddClubButton'

export const revalidate = 60 // Revalidate every minute

export default async function DirectoryPage() {
  const supabase = await createClient()

  // Fetch all clubs
  const { data: clubs, error: clubsError } = await supabase
    .from('clubs')
    .select('*')
    .order('name', { ascending: true })

  // Fetch all active profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, role, club_id, avatar_url')
    .eq('status', 'active')
    .order('full_name', { ascending: true })

  if (clubsError || profilesError) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-8">
        <div className="text-center text-red-500 bg-red-900/20 p-6 rounded-xl border border-red-500/50">
          <h2 className="text-xl font-bold mb-2">Error loading directory</h2>
          <p>{clubsError?.message || profilesError?.message}</p>
        </div>
      </div>
    )
  }

  // Group profiles by club
  const clubMap = new Map<string, typeof profiles>()
  clubs?.forEach(club => {
    clubMap.set(club.id, [])
  })
  
  // Unassigned players (shouldn't happen often, but just in case)
  const unassigned: typeof profiles = []

  profiles?.forEach(profile => {
    if (profile.club_id && clubMap.has(profile.club_id)) {
      clubMap.get(profile.club_id)?.push(profile)
    } else {
      unassigned.push(profile)
    }
  })

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-12 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-800 pb-8 text-center md:text-left">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">League Directory</h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Browse all registered clubs, their active player rosters, and manager information.
            </p>
          </div>
          <div>
            <AddClubButton />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {clubs?.map((club) => {
            const roster = clubMap.get(club.id) || []
            const managers = roster.filter(p => p.role === 'manager')
            const players = roster.filter(p => p.role === 'player')

            return (
              <div key={club.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors shadow-lg shadow-black/50">
                <div className="bg-gray-800/50 p-6 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl shadow-inner">
                      {club.name.charAt(0)}
                    </div>
                    {club.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <AddPlayerButton clubId={club.id} clubName={club.name} />
                    <span className="text-xs font-semibold text-gray-400 bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
                      {roster.length} Members
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  {roster.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-4">No active members yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {/* Managers */}
                      {managers.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Management</h3>
                          <div className="flex flex-wrap gap-2">
                            {managers.map(m => (
                              <div key={m.id} className="bg-blue-900/20 border border-blue-800/50 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                                {m.full_name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Players */}
                      {players.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Players</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {players.map(p => (
                              <div key={p.id} className="bg-gray-950/60 backdrop-blur-md border border-gray-800/80 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 flex items-center gap-3 hover:bg-gray-800 hover:border-gray-600 transition-all shadow-md">
                                {p.avatar_url ? (
                                  <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-600 bg-gray-800 shrink-0 shadow-inner">
                                    <img src={p.avatar_url} alt={p.full_name} className="h-full w-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="h-8 w-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 shrink-0 shadow-inner border border-gray-700">
                                    {p.full_name.charAt(0)}
                                  </div>
                                )}
                                <span className="font-bold tracking-wide">{p.full_name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {unassigned.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-400 mb-4">Unassigned Players</h3>
            <div className="flex flex-wrap gap-2">
              {unassigned.map(p => (
                <div key={p.id} className="bg-gray-800 text-gray-400 px-3 py-1 rounded-lg text-sm">
                  {p.full_name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
