'use client'

import { useState } from 'react'

export default function WicketModal({
  currentBatterId,
  nonStrikerId,
  battingSquad,
  onComplete,
  onCancel
}: {
  currentBatterId: string
  nonStrikerId: string
  battingSquad: { id: string; full_name: string }[]
  onComplete: (wicketType: string, outBatterId: string, runs: number, incomingBatterId: string) => void
  onCancel: () => void
}) {
  const [wicketType, setWicketType] = useState<string>('bowled')
  const [outBatterId, setOutBatterId] = useState<string>(currentBatterId)
  const [runs, setRuns] = useState<number>(0)
  const [incomingBatterId, setIncomingBatterId] = useState<string>('')

  const handleConfirm = () => {
    if (incomingBatterId) {
      onComplete(wicketType, outBatterId, runs, incomingBatterId)
    }
  }

  const currentBatter = battingSquad.find(p => p.id === currentBatterId)
  const nonStriker = battingSquad.find(p => p.id === nonStrikerId)

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black text-red-500 mb-6 uppercase tracking-widest text-center">Wicket!</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">How out?</label>
            <select 
              value={wicketType} 
              onChange={e => setWicketType(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-red-500"
            >
              <option value="bowled">Bowled</option>
              <option value="caught">Caught</option>
              <option value="lbw">LBW</option>
              <option value="run_out">Run Out</option>
              <option value="stumped">Stumped</option>
              <option value="hit_wicket">Hit Wicket</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Who is out?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOutBatterId(currentBatterId)}
                className={`py-3 rounded-lg text-sm font-semibold transition-all border ${outBatterId === currentBatterId ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
              >
                {currentBatter?.full_name} (Striker)
              </button>
              <button
                onClick={() => setOutBatterId(nonStrikerId)}
                className={`py-3 rounded-lg text-sm font-semibold transition-all border ${outBatterId === nonStrikerId ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
              >
                {nonStriker?.full_name} (Non-Striker)
              </button>
            </div>
          </div>

          {wicketType === 'run_out' && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Runs completed before run out?</label>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3].map(r => (
                  <button
                    key={`run-${r}`}
                    onClick={() => setRuns(r)}
                    className={`flex-1 py-2 rounded-lg text-lg font-bold border ${runs === r ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Incoming Batter</label>
            <select 
              value={incomingBatterId} 
              onChange={e => setIncomingBatterId(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Select New Batter...</option>
              {battingSquad.map(p => (
                <option key={p.id} value={p.id} disabled={p.id === currentBatterId || p.id === nonStrikerId}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!incomingBatterId}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-red-600/30"
          >
            Confirm Out
          </button>
        </div>
      </div>
    </div>
  )
}
