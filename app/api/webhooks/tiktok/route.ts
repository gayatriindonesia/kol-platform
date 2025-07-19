import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (implement sesuai TikTok webhook requirements)
    // const signature = request.headers.get('x-tiktok-signature');
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Handle different webhook events
    if (body.event === 'user.data.updated') {
      const { open_id, user_data } = body;
      
      // Update database
      await db.influencerPlatform.updateMany({
        where: { openId: open_id },
        data: {
          followers: user_data.follower_count,
          posts: user_data.video_count,
          lastSynced: new Date(),
          platformData: {
            ...user_data
          }
        }
      });

      console.log(`Updated TikTok data for open_id: ${open_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}