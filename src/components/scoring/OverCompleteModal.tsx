'use client'

import { useState } from 'react'

export default function OverCompleteModal({
  bowlingSquad,
  currentBowlerId,
  onComplete
}: {
  bowlingSquad: { id: string; full_name: string }[]
  currentBowlerId: string
  onComplete: (newBowlerId: string) => void
}) {
  const [newBowlerId, setNewBowlerId] = useState<string>('')

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-blue-900/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Over Complete!</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Select the bowler for the next over.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Bowler</label>
            <select 
              value={newBowlerId} 
              onChange={e => setNewBowlerId(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Select Bowler...</option>
              {bowlingSquad.map(p => (
                <option 
                  key={p.id} 
                  value={p.id} 
                  disabled={p.id === currentBowlerId}
                >
                  {p.full_name} {p.id === currentBowlerId ? '(Just bowled)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => onComplete(newBowlerId)}
          disabled={!newBowlerId}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30"
        >
          Start Next Over
        </button>
      </div>
    </div>
  )
}
