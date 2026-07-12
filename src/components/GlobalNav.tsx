'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function GlobalNav() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show the back button on the very root home page if we don't want to,
  // but showing it is fine. It just won't do much if there's no history.
  // Actually, it's better to hide the nav entirely on the root page or just show the logo.
  const isHome = pathname === '/'
  
  // We don't want to show the global nav on the print screen for PDF generation
  return (
    <nav className="no-print bg-gray-900 border-b border-gray-800 text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isHome && (
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors flex items-center gap-2 text-gray-300 hover:text-white"
              title="Go Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline font-semibold">Back</span>
            </button>
          )}
          
          {/* Logo / Home Link */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity ml-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:inline">Pitch Pulse</span>
          </Link>
        </div>

        {/* Optional Right Side (e.g. quick dashboard link) */}
        {!isHome && (
          <div className="flex items-center gap-6">
             <Link 
              href="/directory"
              className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
             >
               Directory
             </Link>
             <Link 
              href="/manager/dashboard"
              className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
             >
               Dashboard
             </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
