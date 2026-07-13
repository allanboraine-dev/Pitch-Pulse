'use client'

import { useActionState } from 'react'
import { registerClub } from '@/app/actions/auth'
import Link from 'next/link'

export default function RegisterClubPage() {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await registerClub(formData)
  }, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Register Your Club</h1>
          <p className="text-gray-400 text-sm">Create a club and get your unique Access Code.</p>
        </div>

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Your Full Name</label>
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

          {state?.error && (
            <div className="bg-red-900/50 text-red-400 p-3 rounded text-sm border border-red-900/50">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-900/20 disabled:opacity-50"
          >
            {isPending ? 'Creating Club...' : 'Create Club'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have a club?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
