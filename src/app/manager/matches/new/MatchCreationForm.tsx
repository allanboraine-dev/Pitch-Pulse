'use client'

import { useActionState } from 'react'
import { createMatch } from '@/app/actions/match'

export default function MatchCreationForm({ clubs }: { clubs: { id: string, name: string }[] }) {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await createMatch(formData)
  }, null)

  return (
    <form action={action} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Home Team</label>
        <select
          name="homeTeamId"
          required
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
        >
          <option value="">Select Home Team...</option>
          {clubs.map(club => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Away Team</label>
        <select
          name="awayTeamId"
          required
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
        >
          <option value="">Select Away Team...</option>
          {clubs.map(club => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Match Format</label>
        <select
          name="maxOvers"
          required
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
        >
          <option value="20">T20 (20 Overs)</option>
          <option value="50">ODI (50 Overs)</option>
          <option value="10">T10 (10 Overs)</option>
        </select>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
      >
        {isPending ? 'Preparing Match...' : 'Continue to Player Selection →'}
      </button>
    </form>
  )
}
