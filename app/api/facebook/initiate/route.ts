import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const state = `user_${session.user.id}_${Date.now()}`
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_read_user_content',
      'instagram_basic',
      'instagram_manage_insights',
      'public_profile',
      'email'
    ].join(',')

    const redirectUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
    redirectUrl.searchParams.set('client_id', process.env.FACEBOOK_CLIENT_ID!)
    redirectUrl.searchParams.set('redirect_uri', process.env.FACEBOOK_REDIRECT_URI!)
    redirectUrl.searchParams.set('scope', scopes)
    redirectUrl.searchParams.set('state', state)
    redirectUrl.searchParams.set('response_type', 'code')
    redirectUrl.searchParams.set('display', 'popup')

    return NextResponse.json({ url: redirectUrl.toString() })
  } catch (error) {
    console.error('[facebook/initiate] Error:', error)
    return NextResponse.json({ error: 'Failed to initiate Facebook auth' }, { status: 500 })
  }
}
