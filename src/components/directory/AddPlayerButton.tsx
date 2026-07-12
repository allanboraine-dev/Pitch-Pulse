'use client'

import { useState } from 'react'
import { addPlayerToClub } from '@/app/actions/players'

export default function AddPlayerButton({ clubId, clubName }: { clubId: string, clubName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerName.trim()) return

    setIsSubmitting(true)
    const res = await addPlayerToClub(clubId, playerName.trim())
    setIsSubmitting(false)

    if (res.error) {
      alert(res.error)
    } else {
      setPlayerName('')
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-green-600/50"
      >
        + Add Player
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Add Player</h3>
        <p className="text-sm text-gray-400 mb-6">Assign a new player to {clubName}.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
