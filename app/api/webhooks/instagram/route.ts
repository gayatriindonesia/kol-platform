import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'meatyhammock';
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

// Untuk verifikasi awal dari Meta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    console.log("✅ Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Untuk menerima notifikasi webhook Instagram
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature if APP_SECRET is available
    if (APP_SECRET) {
      const signature = req.headers.get('X-Hub-Signature-256');
      if (!signature) {
        console.error('Missing X-Hub-Signature-256 header');
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const bodyText = await req.text();
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', APP_SECRET)
        .update(bodyText)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return new NextResponse('Unauthorized', { status: 401 });
      }
      
      const body = JSON.parse(bodyText);
      await processInstagramWebhook(body);
    } else {
      const body = await req.json();
      await processInstagramWebhook(body);
    }

    return new NextResponse('ok', { status: 200 });
  } catch (error) {
    console.error('❌ Instagram webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Process Instagram webhook events
async function processInstagramWebhook(body: any) {
  console.log('📩 Instagram webhook received:', JSON.stringify(body, null, 2));
  
  if (!body.entry || !Array.isArray(body.entry)) {
    console.log('No entries found in webhook payload');
    return;
  }

  for (const entry of body.entry) {
    const userId = entry.id; // Instagram user ID
    const changes = entry.changes || [];

    for (const change of changes) {
      const field = change.field;
      const value = change.value;

      console.log(`Processing change for user ${userId}, field: ${field}`);

      try {
        switch (field) {
          case 'media':
            await handleMediaUpdate(userId, value);
            break;
          case 'user_media':
            await handleUserMediaUpdate(userId, value);
            break;
          default:
            console.log(`Unhandled webhook field: ${field}`);
        }
      } catch (error) {
        console.error(`Error processing ${field} update for user ${userId}:`, error);
      }
    }
  }
}

// Handle media updates
async function handleMediaUpdate(igUserId: string, mediaData: any) {
  console.log(`📱 Media update for user ${igUserId}:`, mediaData);
  
  // Find the influencer platform record
  const influencerPlatform = await db.influencerPlatform.findFirst({
    where: {
      igUserId: igUserId,
      platform: {
        name: "Instagram"
      }
    },
    include: {
      influencer: {
        include: {
          user: true
        }
      }
    }
  });

  if (!influencerPlatform) {
    console.log(`No influencer platform found for Instagram user ${igUserId}`);
    return;
  }

  // Trigger a data sync for this user
  if (influencerPlatform.accessToken) {
    try {
      await syncInstagramDataForUser(
        influencerPlatform.influencerId,
        influencerPlatform.platformId,
        influencerPlatform.accessToken
      );
      console.log(`✅ Synced data for Instagram user ${igUserId}`);
    } catch (error) {
      console.error(`Failed to sync data for Instagram user ${igUserId}:`, error);
    }
  }
}

// Handle user media updates
async function handleUserMediaUpdate(igUserId: string, mediaData: any) {
  console.log(`👤 User media update for user ${igUserId}:`, mediaData);
  await handleMediaUpdate(igUserId, mediaData);
}

// Sync Instagram data for a specific user (internal function)
async function syncInstagramDataForUser(influencerId: string, platformId: string, accessToken: string) {
  try {
    // Get Instagram profile data
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count&access_token=${accessToken}`
    );

    if (!profileResponse.ok) {
      throw new Error(`Instagram API error: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();

    if (profileData.error) {
      throw new Error(`Instagram API error: ${profileData.error.message}`);
    }

    // Get recent media for engagement calculation
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,like_count,comments_count,timestamp&limit=25&access_token=${accessToken}`
    );

    let mediaData: any = { data: [] };
    if (mediaResponse.ok) {
      mediaData = await mediaResponse.json();
    }

    // Calculate engagement rate
    let engagementRate = 0;
    if (mediaData.data && mediaData.data.length > 0 && profileData.followers_count > 0) {
      let totalEngagement = 0;
      let validPosts = 0;
      
      for (const media of mediaData.data) {
        if (media.like_count !== undefined && media.comments_count !== undefined) {
          totalEngagement += (media.like_count || 0) + (media.comments_count || 0);
          validPosts++;
        }
      }
      
      if (validPosts > 0) {
        const avgEngagement = totalEngagement / validPosts;
        engagementRate = (avgEngagement / profileData.followers_count) * 100;
      }
    }

    // Update the database
    await db.influencerPlatform.update({
      where: {
        influencerId_platformId: {
          influencerId,
          platformId
        }
      },
      data: {
        username: profileData.username || "",
        lastSynced: new Date(),
        igMediaCount: profileData.media_count || 0,
        igAccountType: profileData.account_type || "PERSONAL",
        igEngagementRate: Math.round(engagementRate * 100) / 100,
        posts: profileData.media_count || 0,
        followers: profileData.followers_count || 0,
        platformData: {
          profile: profileData,
          recentMedia: mediaData.data || [],
          lastSync: new Date().toISOString(),
          webhookTriggered: true
        }
      }
    });

    console.log(`✅ Updated Instagram data for influencer ${influencerId}`);
  } catch (error) {
    console.error('❌ Instagram webhook sync error:', error);
    throw error;
  }
}
