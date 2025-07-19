import { handleYouTubeCallback } from '@/lib/youtube.actions'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store'; // ⬅️ Mencegah caching

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    await handleYouTubeCallback(searchParams)
    
    // Redirect to success page or dashboard
    return NextResponse.redirect(new URL('/kol/platform', request.url))
  } catch (error) {
    console.error('YouTube callback error:', error)
    
    // Redirect to error page
    return NextResponse.redirect(new URL('/kol/platform?error=youtube_connection_failed', request.url))
  }
}