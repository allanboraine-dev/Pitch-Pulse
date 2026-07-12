'use client'

import { useState } from 'react'
import { addPlayerToClub } from '@/app/actions/players'

export default function AddPlayerButton({ clubId, clubName }: { clubId: string, clubName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!playerName.trim()) return

    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('clubId', clubId)
    
    const res = await addPlayerToClub(formData)
    
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
        className="text-xs font-bold bg-pitch-green/20 text-pitch-green hover:bg-pitch-green hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-pitch-green/50"
      >
        + Add Player
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl max-w-sm w-full p-8 shadow-2xl">
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Add Player</h3>
        <p className="text-sm text-gray-400 mb-6 font-medium">Assign a new player to {clubName}.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Full Name</label>
            <input 
              type="text" 
              name="playerName"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-gray-950/50 border border-gray-700 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Profile Picture <span className="text-gray-500 font-normal lowercase tracking-normal">(Optional)</span></label>
            <input 
              type="file" 
              name="avatar"
              accept="image/*"
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-800 file:text-white hover:file:bg-gray-700 transition-all"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
