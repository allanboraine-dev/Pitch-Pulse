import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // Check for our custom pitchpulse_auth cookie
  const authCookie = request.cookies.get('pitchpulse_auth')?.value
  
  // Protect /manager and /matches
  if (request.nextUrl.pathname.startsWith('/manager') || request.nextUrl.pathname.startsWith('/matches')) {
    if (!authCookie) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // We are not using Supabase Auth anymore, so just proceed!
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
