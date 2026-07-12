'use client'

import { useState, useTransition } from 'react'
import { addClub } from '@/app/actions/clubs'

export default function AddClubButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const res = await addClub(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    })
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 border border-green-500/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Register New Club
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black text-white mb-6">Register New Club</h2>
            
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Club Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Thunder Strikers CC"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Description (Optional)</label>
                <textarea 
                  name="description" 
                  rows={3}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Club home ground, history, etc..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-bold transition-all"
                >
                  {isPending ? 'Registering...' : 'Register Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
