'use client'

import { useState, useTransition } from 'react'
import { saveSquads } from '@/app/actions/match'

type Player = { id: string, full_name: string, club_id: string }
type Club = { id: string, name: string }

export default function SquadSelectionForm({
  matchId,
  initialHomeTeamId,
  initialAwayTeamId,
  clubs,
  allPlayers
}: {
  matchId: string,
  initialHomeTeamId: string,
  initialAwayTeamId: string,
  clubs: Club[],
  allPlayers: Player[]
}) {
  const [homeTeamId, setHomeTeamId] = useState(initialHomeTeamId)
  const [awayTeamId, setAwayTeamId] = useState(initialAwayTeamId)
  
  const [selectedHome, setSelectedHome] = useState<Set<string>>(new Set())
  const [selectedAway, setSelectedAway] = useState<Set<string>>(new Set())
  
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Filter players based on current selected clubs
  const homePlayers = allPlayers.filter(p => p.club_id === homeTeamId)
  const awayPlayers = allPlayers.filter(p => p.club_id === awayTeamId)

  const togglePlayer = (id: string, isHome: boolean) => {
    if (isHome) {
      const newSet = new Set(selectedHome)
      if (newSet.has(id)) newSet.delete(id)
      else if (newSet.size < 11) newSet.add(id)
      setSelectedHome(newSet)
    } else {
      const newSet = new Set(selectedAway)
      if (newSet.has(id)) newSet.delete(id)
      else if (newSet.size < 11) newSet.add(id)
      setSelectedAway(newSet)
    }
  }

  const handleSubmit = () => {
    if (selectedHome.size !== 11 || selectedAway.size !== 11) {
      setError('You must select exactly 11 players for each team.')
      return
    }
    setError('')
    startTransition(() => {
      saveSquads(matchId, homeTeamId, awayTeamId, Array.from(selectedHome), Array.from(selectedAway))
    })
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Home Team */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="mb-4 border-b border-gray-700 pb-4">
            <label className="block text-sm text-gray-400 mb-2">Home Team</label>
            <select 
              value={homeTeamId} 
              onChange={(e) => {
                setHomeTeamId(e.target.value)
                setSelectedHome(new Set()) // Reset selections when team changes
              }}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-2 text-lg font-bold"
            >
              <option value="">Select Home Team</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Playing XI</h2>
            <span className={`text-sm font-bold px-2 py-1 rounded ${selectedHome.size === 11 ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
              {selectedHome.size} / 11
            </span>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {homePlayers.length === 0 ? <p className="text-gray-500">No active players found.</p> : null}
            {homePlayers.map(p => (
              <button
                key={p.id}
                onClick={() => togglePlayer(p.id, true)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  selectedHome.has(p.id) 
                    ? 'bg-blue-600/20 border border-blue-500 text-white' 
                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {p.full_name}
              </button>
            ))}
          </div>
        </div>

        {/* Away Team */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="mb-4 border-b border-gray-700 pb-4">
            <label className="block text-sm text-gray-400 mb-2">Away Team</label>
            <select 
              value={awayTeamId} 
              onChange={(e) => {
                setAwayTeamId(e.target.value)
                setSelectedAway(new Set()) // Reset selections when team changes
              }}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded p-2 text-lg font-bold"
            >
              <option value="">Select Away Team</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Playing XI</h2>
            <span className={`text-sm font-bold px-2 py-1 rounded ${selectedAway.size === 11 ? 'bg-green-600/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
              {selectedAway.size} / 11
            </span>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {awayPlayers.length === 0 ? <p className="text-gray-500">No active players found.</p> : null}
            {awayPlayers.map(p => (
              <button
                key={p.id}
                onClick={() => togglePlayer(p.id, false)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  selectedAway.has(p.id) 
                    ? 'bg-blue-600/20 border border-blue-500 text-white' 
                    : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {p.full_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/30 text-lg"
      >
        {isPending ? 'Saving Squads...' : 'Confirm Squads & Start Match'}
      </button>
    </div>
  )
}
