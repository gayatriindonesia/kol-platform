import { NextRequest } from 'next/server'

const VERIFY_TOKEN = 'secret_token_12345'

/**
 * Handle GET request (for webhook verification)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    console.log('✅ Webhook verified')
    return new Response(challenge, { status: 200 })
  }

  return new Response('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('📩 Webhook event received:', JSON.stringify(body, null, 2))

  // You can add logic to handle the webhook data here

  return new Response('EVENT_RECEIVED', { status: 200 })
}
