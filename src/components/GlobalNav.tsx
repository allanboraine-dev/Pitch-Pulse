'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function GlobalNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasAccess(!!user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setHasAccess(!!session?.user)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const isHome = pathname === '/'
  
  // We don't want to show the global nav on the print screen for PDF generation
  return (
    <nav className="bg-gray-950/40 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50 shadow-lg shadow-black/40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            {!isHome && (
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800/80 rounded-full transition-colors flex items-center gap-2 text-gray-300 hover:text-white"
                title="Go Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline font-bold">Back</span>
              </button>
            )}
            
            {/* Logo / Home Link */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity ml-2">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-black text-xl tracking-tight hidden sm:inline text-white">Pitch Pulse</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {hasAccess && (
              <Link 
                href="/directory" 
                className="text-sm font-bold text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-700/50"
              >
                Directory
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
