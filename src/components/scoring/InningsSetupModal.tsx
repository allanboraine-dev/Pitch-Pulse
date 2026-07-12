'use client'

import { useState } from 'react'
import { TeamInfo } from '@/hooks/useScoringEngine'

export default function InningsSetupModal({
  homeTeam,
  awayTeam,
  onComplete
}: {
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  onComplete: (battingId: string, bowlingId: string, batter1: string, batter2: string, bowler: string) => void
}) {
  const [battingTeamId, setBattingTeamId] = useState<string>('')
  const [batter1, setBatter1] = useState<string>('')
  const [batter2, setBatter2] = useState<string>('')
  const [bowler, setBowler] = useState<string>('')

  const battingTeam = battingTeamId === homeTeam.id ? homeTeam : battingTeamId === awayTeam.id ? awayTeam : null
  const bowlingTeam = battingTeamId === homeTeam.id ? awayTeam : battingTeamId === awayTeam.id ? homeTeam : null

  const handleStart = () => {
    if (battingTeam && bowlingTeam && batter1 && batter2 && bowler && batter1 !== batter2) {
      onComplete(battingTeam.id, bowlingTeam.id, batter1, batter2, bowler)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Match Setup</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Who is batting first?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setBattingTeamId(homeTeam.id); setBatter1(''); setBatter2(''); setBowler('') }}
                className={`py-3 rounded-lg text-sm font-semibold transition-all border ${battingTeamId === homeTeam.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
              >
                {homeTeam.name}
              </button>
              <button
                onClick={() => { setBattingTeamId(awayTeam.id); setBatter1(''); setBatter2(''); setBowler('') }}
                className={`py-3 rounded-lg text-sm font-semibold transition-all border ${battingTeamId === awayTeam.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
              >
                {awayTeam.name}
              </button>
            </div>
          </div>

          {battingTeam && bowlingTeam && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Striker</label>
                <select value={batter1} onChange={e => setBatter1(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500">
                  <option value="">Select Striker...</option>
                  {battingTeam.squad.map(p => <option key={p.id} value={p.id} disabled={p.id === batter2}>{p.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Non-Striker</label>
                <select value={batter2} onChange={e => setBatter2(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500">
                  <option value="">Select Non-Striker...</option>
                  {battingTeam.squad.map(p => <option key={p.id} value={p.id} disabled={p.id === batter1}>{p.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Opening Bowler</label>
                <select value={bowler} onChange={e => setBowler(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500">
                  <option value="">Select Bowler...</option>
                  {bowlingTeam.squad.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={!battingTeam || !batter1 || !batter2 || !bowler || batter1 === batter2}
          className="w-full mt-8 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Play Ball
        </button>
      </div>
    </div>
  )
}
