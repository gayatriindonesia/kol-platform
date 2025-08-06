'use server'

import { db } from "./db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OAuthState } from "@prisma/client";
import * as crypto from 'crypto';
import { createRateCardIfNeeded } from "./rateCard.actions";

// TikTok API configuration
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI!;

// TikTok API URLs
const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
const TIKTOK_VIDEO_LIST_URL = 'https://open.tiktokapis.com/v2/video/list/';

// PKCE utility functions
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// Utility function to safely parse JSON response
async function safeJsonParse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Failed to parse JSON:', text);
    throw new Error(`Invalid JSON response: ${text.substring(0, 200)}...`);
  }
}

// Get TikTok connections for the logged-in user
export async function getTikTokConnections() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id },
    include: {
      platforms: {
        where: {
          platform: {
            name: 'TikTok'
          }
        },
        include: {
          platform: true
        }
      }
    }
  });

  return influencer?.platforms || [];
}

// Initiate TikTok OAuth flow with PKCE
export async function initiateTikTokAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect('/signin');

  // First, ensure the user has an influencer account
  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id },
  });

  if (!influencer) {
    // If not, create one
    await db.influencer.create({
      data: {
        userId: session.user.id,
      },
    });
  }

  // Ensure TikTok platform exists
  let tiktokPlatform = await db.platform.findFirst({
    where: { name: 'TikTok' },
  });

  if (!tiktokPlatform) {
    tiktokPlatform = await db.platform.create({
      data: {
        name: 'TikTok',
      },
    });
  }

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomUUID();

  // Store PKCE state
  await db.oAuthState.create({
    data: {
      state,
      codeVerifier,
      userId: session.user.id,
      provider: 'Tiktok',
      redirectUri: TIKTOK_REDIRECT_URI,
    },
  });

  // Build TikTok authorization URL
  const authUrl = new URL(TIKTOK_AUTH_URL);
  authUrl.searchParams.append('client_key', TIKTOK_CLIENT_KEY);
  authUrl.searchParams.append('response_type', 'code');
  
  // Perbaikan: Scope yang lebih minimal dan umum tersedia
  authUrl.searchParams.append('scope', 'user.info.basic,user.info.profile,user.info.stats');
  authUrl.searchParams.append('redirect_uri', TIKTOK_REDIRECT_URI);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');

  console.log("REDIRECT URI : ", TIKTOK_REDIRECT_URI);
  console.log("CLIENT_KEY : ", TIKTOK_CLIENT_KEY);
  console.log("CLIENT_SECRET : ", TIKTOK_CLIENT_SECRET);
  console.log("AUTH_URL : ", authUrl.toString());

  return redirect(authUrl.toString());
}

// Function to fetch TikTok videos with proper error handling
async function fetchTikTokVideos(accessToken: string, cursor?: string) {
  try {
    // Fixed: Use correct TikTok API fields
    const url = new URL(TIKTOK_VIDEO_LIST_URL);
    
    // Correct fields based on TikTok API documentation
    const validFields = [
      'id',
      'video_description', 
      'create_time',
      'cover_image_url',
      'share_url',
      'embed_html',
      'embed_link',
      'like_count',
      'comment_count',
      'share_count',
      'view_count'
    ];
    
    url.searchParams.append('fields', validFields.join(','));
    url.searchParams.append('max_count', '20');
    
    if (cursor) {
      url.searchParams.append('cursor', cursor);
    }

    console.log('🎬 Fetching videos from URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    console.log('📊 Video Response Status:', response.status);
    console.log('📊 Video Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📊 Video API Error Response:', errorText);
      
      // If endpoint is not available, try alternative
      if (response.status === 404) {
        console.log('🔄 Trying alternative video fetch method...');
        return await fetchTikTokVideosAlternative(accessToken);
      }
      
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await safeJsonParse(response);
    console.log('📊 Video Data Structure:', JSON.stringify(data, null, 2));

    // Fixed: Handle the actual API response structure
    if (data.error) {
      console.error('📊 API returned error:', data.error);
      return { success: false, error: data.error.message || 'API Error' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('📊 Video Fetch Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Alternative method for fetch videos if main endpoint is not available
async function fetchTikTokVideosAlternative(accessToken: string) {
  try {
    console.log('🔄 Using alternative video fetch method...');
    
    // Try to get user info with video count
    const userInfoUrl = new URL(TIKTOK_USER_INFO_URL);
    userInfoUrl.searchParams.append('fields', 'video_count,follower_count');
    
    const response = await fetch(userInfoUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, error: 'Alternative method also failed' };
    }
    
    // Return mock structure that's compatible
    return {
      success: true,
      data: {
        data: {
          videos: [], // Empty array since we can't fetch video details
          cursor: 0,
          has_more: false
        }
      }
    };
  } catch (error) {
    console.error('Alternative video fetch error:', error);
    return { success: false, error: 'Alternative method failed' };
  }
}

// Handle TikTok OAuth callback
export async function handleTikTokCallback(code: string, state: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    console.log('=== TikTok Callback Debug Started ===');

    const storedState: OAuthState | null = await db.oAuthState.findUnique({ where: { state } });
    if (!storedState || storedState.userId !== session.user.id) {
      return { success: false, error: 'Invalid state' };
    }

    const tokenResponse = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
        code_verifier: storedState.codeVerifier,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return { success: false, error: `Token exchange failed: ${errorText}` };
    }

    const tokenData = await safeJsonParse(tokenResponse);
    const { access_token, refresh_token, expires_in, open_id } = tokenData;

    const userInfoFields = [
      'open_id', 'union_id', 'avatar_url', 'display_name', 'username',
      'follower_count', 'following_count', 'video_count', 'bio', 'is_verified'
    ];
    const userInfoUrl = `${TIKTOK_USER_INFO_URL}?fields=${userInfoFields.join(',')}`;

    const userResponse = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return { success: false, error: `Failed to fetch user data: ${errorText}` };
    }

    const userData = await safeJsonParse(userResponse);
    if (!userData.data || !userData.data.user) {
      return { success: false, error: 'Unexpected API response structure' };
    }

    const userInfo = userData.data.user;
    // let totalLikes = 0, totalComments = 0, totalShares = 0, totalSaves = 0, totalViews = 0, engagementRate = 0;
    let totalLikes = 0, totalComments = 0, totalShares = 0, totalSaves = 0, engagementRate = 0;
    const videoResult = await fetchTikTokVideos(access_token);

    if (videoResult.success && videoResult.data?.data?.videos) {
      const videos = videoResult.data.data.videos;
      videos.forEach((video: any) => {
        totalLikes += video.like_count || 0;
        totalComments += video.comment_count || 0;
        totalShares += video.share_count || 0;
        totalSaves += video.save_count || 0;
        // totalViews += video.view_count || 0;
      });
      const totalFollowers = userInfo.follower_count || 1;
      const totalPosts = Math.max(videos.length, 1);
      const totalEngagement = totalLikes + totalComments + totalShares + totalSaves;
      engagementRate = (totalEngagement / (totalFollowers * totalPosts)) * 100;
    } else {
      engagementRate = calculateEstimatedEngagementRate(userInfo);
    }

    const requiredFields = ['username', 'follower_count', 'avatar_url', 'display_name'];
    const missingFields = requiredFields.filter(f => !userInfo[f]);
    if (missingFields.length > 0) {
      return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
    }

    const tiktokPlatform = await db.platform.findFirst({ where: { name: 'TikTok' } });
    if (!tiktokPlatform) return { success: false, error: 'TikTok platform not found' };

    const influencer = await db.influencer.findUnique({ where: { userId: session.user.id } });
    if (!influencer) return { success: false, error: 'Influencer not found' };

    const existingConnection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: tiktokPlatform.id,
      },
    });

    const platformData = {
      bio: userInfo.bio || '',
      avatarUrl: userInfo.avatar_url || '',
      displayName: userInfo.display_name || '',
      isVerified: userInfo.is_verified || false,
      followingCount: userInfo.following_count || 0,
    };

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

    const commonData = {
      username: userInfo.username || '',
      followers: userInfo.follower_count || 0,
      posts: userInfo.video_count || 0,
      accessToken: access_token,
      refreshToken: refresh_token || null,
      tokenExpiresAt: expiresAt,
      lastSynced: new Date(),
      platformData,
      likesCount: totalLikes,
      commentsCount: totalComments,
      sharesCount: totalShares,
      savesCount: totalSaves,
      engagementRate: Math.round(engagementRate * 100) / 100,
    };

    let influencerPlatformId: string;
    if (existingConnection) {
      const updateResult = await db.influencerPlatform.update({
        where: { id: existingConnection.id },
        data: commonData,
      });
      console.log('Updated influencerPlatform:', updateResult);
      influencerPlatformId = existingConnection.id;
    } else {
      const createResult = await db.influencerPlatform.create({
        data: {
          influencerId: influencer.id,
          platformId: tiktokPlatform.id,
          openId: open_id,
          ...commonData,
        },
      });
      influencerPlatformId = createResult.id;
    }

    await createRateCardIfNeeded(influencerPlatformId, engagementRate);

    await db.oAuthState.delete({ where: { state } });
    return { success: true };
  } catch (error) {
    console.error('TikTok callback error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Internal server error' };
  }
}

// Disconnect TikTok
export async function disconnectTikTok(connectionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const connection = await db.influencerPlatform.findUnique({
      where: { id: connectionId },
      include: {
        influencer: true,
      },
    });

    if (!connection || connection.influencer.userId !== session.user.id) {
      return { success: false, error: 'Connection not found or not authorized' };
    }

    await db.influencerPlatform.delete({
      where: { id: connectionId },
    });

    return { success: true };
  } catch (error) {
    console.error('Disconnect TikTok error:', error);
    return { success: false, error: 'Failed to disconnect' };
  }
}

// Refresh TikTok data
export async function refreshTikTokData(connectionId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const connection = await db.influencerPlatform.findUnique({
      where: { id: connectionId },
      include: {
        influencer: true,
      },
    });

    if (!connection || connection.influencer.userId !== session.user.id) {
      return { success: false, error: 'Connection not found or not authorized' };
    }

    // Refresh token if expired
    const now = new Date();
    if (connection.tokenExpiresAt && connection.tokenExpiresAt < now) {
      if (!connection.refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }
      
      const tokenResponse = await fetch(TIKTOK_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: connection.refreshToken,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('TikTok refresh token error:', errorText);
        return { success: false, error: 'Failed to refresh token' };
      }

      const tokenData = await safeJsonParse(tokenResponse);
      const { access_token, refresh_token, expires_in } = tokenData;
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      await db.influencerPlatform.update({
        where: { id: connectionId },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiresAt: expiresAt,
        },
      });

      connection.accessToken = access_token;
    }

    // Fetch user info
    if (!connection.accessToken) {
      return { success: false, error: 'No access token available' };
    }
    
    const userResponse = await fetch(`${TIKTOK_USER_INFO_URL}?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,video_count,bio,is_verified`, {
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('TikTok user info error:', errorText);
      return { success: false, error: 'Failed to fetch user data' };
    }

    const userData = await safeJsonParse(userResponse);
    if (!userData.data?.user) {
      console.error('TikTok user info error:', userData);
      return { success: false, error: 'Failed to fetch user data' };
    }

    const userInfo = userData.data.user;

    // Fetch videos
    if (!connection.accessToken) {
      return { success: false, error: 'No access token available' };
    }
    
    const videoResult = await fetchTikTokVideos(connection.accessToken);
    
    // Initialize engagement metrics
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalSaves = 0;
    let engagementRate = 0;

    // Calculate engagement metrics
    if (videoResult.success && videoResult.data?.data?.videos) {
      const videos = videoResult.data.data.videos;
      videos.forEach((video: any) => {
        totalLikes += video.like_count || 0;
        totalComments += video.comment_count || 0;
        totalShares += video.share_count || 0;
        totalSaves += video.save_count || 0;
      });

      const totalFollowers = userInfo.follower_count || 1;
      const totalPosts = Math.max(videos.length, 1);
      const totalEngagement = totalLikes + totalComments + totalShares + totalSaves;
      engagementRate = totalPosts > 0 ? (totalEngagement / (totalFollowers * totalPosts)) * 100 : 0;
    }

    // Update database
    const platformData = {
      bio: userInfo.bio || '',
      avatarUrl: userInfo.avatar_url || '',
      displayName: userInfo.display_name || '',
      isVerified: userInfo.is_verified || false,
      followingCount: userInfo.following_count || 0,
    };

    await db.influencerPlatform.update({
      where: { id: connectionId },
      data: {
        username: userInfo.username || '',
        followers: userInfo.follower_count || 0,
        posts: userInfo.video_count || 0,
        lastSynced: new Date(),
        platformData,
        // Update engagement metrics
        likesCount: totalLikes,
        commentsCount: totalComments,
        sharesCount: totalShares,
        savesCount: totalSaves,
        engagementRate: Math.round(engagementRate * 100) / 100,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Refresh TikTok data error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to refresh data' };
  }
}

// Helper function untuk menghitung estimasi engagement rate
function calculateEstimatedEngagementRate(userInfo: any): number {
  const followers = userInfo.follower_count || 1;
  const posts = userInfo.video_count || 1;
  
  // Estimasi berdasarkan rata-rata industri TikTok
  // Akun kecil (<10K): 5-10%
  // Akun menengah (10K-100K): 3-7%
  // Akun besar (>100K): 1-5%
  
  let estimatedRate = 0;
  
  if (followers < 10000) {
    estimatedRate = 7.5; // 7.5% untuk akun kecil
  } else if (followers < 100000) {
    estimatedRate = 5; // 5% untuk akun menengah
  } else {
    estimatedRate = 3; // 3% untuk akun besar
  }
  
  // Adjust berdasarkan jumlah posts (lebih banyak post = engagement rate lebih rendah)
  if (posts > 100) {
    estimatedRate *= 0.8;
  } else if (posts > 50) {
    estimatedRate *= 0.9;
  }
  
  return Math.round(estimatedRate * 100) / 100;
}

export async function batchRefreshTikTokData(connectionIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  const results = await Promise.allSettled(
    connectionIds.map(id => refreshTikTokData(id))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    success: failed === 0,
    summary: `${successful} successful, ${failed} failed`
  };
}