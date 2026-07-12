'use client'

import { useActionState } from 'react'
import { registerClub } from '@/app/actions/auth'

export default function RegisterClubPage() {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await registerClub(formData)
  }, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Register Your Club</h1>
          <p className="text-gray-400 text-sm">Create a club and manager account to get started.</p>
        </div>

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input 
              name="fullName" 
              required 
              type="text" 
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Club Name</label>
            <input 
              name="clubName" 
              required 
              type="text" 
              placeholder="e.g. Thunderbolts CC"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              name="email" 
              required 
              type="email" 
              placeholder="manager@club.com"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              name="password" 
              required 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
            />
          </div>

          {state?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
          >
            {isPending ? 'Registering...' : 'Register Club'}
          </button>
        </form>
      </div>
    </div>
  )
}
