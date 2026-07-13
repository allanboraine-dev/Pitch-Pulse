import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MatchCreationForm from './MatchCreationForm'

export default async function NewMatchPage() {
  const supabase = await createClient()

  // MVP: Bypassing auth to allow public testing


  // Fetch all clubs
  const { data: clubs } = await supabase.from('clubs').select('id, name').order('name')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Score a Game</h1>
          <p className="text-gray-400 text-sm font-medium">Select the home and away teams to begin.</p>
        </div>

        <MatchCreationForm clubs={clubs || []} />
      </div>
    </div>
  )
}
