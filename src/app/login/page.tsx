'use client'

import { useActionState } from 'react'
import { loginUser } from '@/app/actions/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await loginUser(formData)
  }, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Manager Login</h1>
          <p className="text-gray-400 text-sm">Enter your Club Access Code to manage your team.</p>
        </div>

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Club Access Code</label>
            <input 
              name="accessCode" 
              required 
              type="text" 
              placeholder="e.g. THNDR1"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none uppercase font-mono tracking-wider text-center text-lg" 
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
            {isPending ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have a club yet?{' '}
            <Link href="/register-club" className="text-blue-400 hover:text-blue-300 font-medium">
              Register Club
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
