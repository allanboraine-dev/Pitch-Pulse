'use client'

import { useState } from 'react'
import { editPlayerProfile } from '@/app/actions/players'

type Player = {
  id: string
  full_name: string
  avatar_url: string | null
  role: string
  status: string
}

export default function EditPlayerModal({ player }: { player: Player }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('playerId', player.id)
    
    const res = await editPlayerProfile(formData)
    
    if (res.error) {
      setError(res.error)
      setIsSubmitting(false)
    } else {
      setIsOpen(false)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold py-2 rounded-lg transition-colors border border-gray-700"
      >
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <h2 className="text-2xl font-bold text-white mb-6">Edit {player.full_name}</h2>
            
            {error && (
              <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4 text-sm border border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="playerName"
                  defaultValue={player.full_name}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">New Profile Picture (Optional)</label>
                <input 
                  type="file" 
                  name="avatar"
                  accept="image/*"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/50 file:text-blue-400 hover:file:bg-blue-900/70 cursor-pointer"
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
