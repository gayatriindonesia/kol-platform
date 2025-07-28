"use server";

import { auth } from "@/auth";
import { db } from "./db";

// Instagram Business API endpoints and functionality
const INSTAGRAM_GRAPH_BASE_URL = "https://graph.instagram.com";

interface InstagramInsight {
  name: string;
  period: string;
  values: Array<{
    value: number;
    end_time: string;
  }>;
  title: string;
  description: string;
}

interface InstagramMediaInsight {
  name: string;
  values: Array<{
    value: number;
  }>;
}

/**
 * Get Instagram Business Account insights (requires Business/Creator account)
 */
export async function getInstagramInsights(dateRange: { since: string; until: string }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    });

    if (!influencer) {
      throw new Error("Influencer profile not found");
    }

    const instagramPlatform = await db.platform.findFirst({
      where: { name: "Instagram" }
    });

    if (!instagramPlatform) {
      throw new Error("Instagram platform not found");
    }

    const connection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: instagramPlatform.id
      }
    });

    if (!connection || !connection.accessToken) {
      throw new Error("Instagram not connected or access token missing");
    }

    // Check if it's a business account
    if (connection.igAccountType !== "BUSINESS" && connection.igAccountType !== "CREATOR") {
      throw new Error("Instagram insights are only available for Business and Creator accounts");
    }

    const insights = await fetchInstagramAccountInsights(
      connection.igUserId!,
      connection.accessToken,
      dateRange
    );

    return { success: true, data: insights };
  } catch (error) {
    console.error("❌ Instagram insights error:", error);
    throw error;
  }
}

/**
 * Fetch Instagram account insights from API
 */
async function fetchInstagramAccountInsights(
  igUserId: string,
  accessToken: string,
  dateRange: { since: string; until: string }
) {
  const metrics = [
    'impressions',
    'reach',
    'website_clicks',
    'profile_views',
    'get_directions_clicks',
    'text_message_clicks',
    'email_contacts',
    'phone_call_clicks'
  ];

  const url = `${INSTAGRAM_GRAPH_BASE_URL}/${igUserId}/insights` +
    `?metric=${metrics.join(',')}` +
    `&period=day` +
    `&since=${dateRange.since}` +
    `&until=${dateRange.until}` +
    `&access_token=${accessToken}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Instagram Insights API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Instagram Insights API error: ${data.error.message}`);
  }

  return data.data as InstagramInsight[];
}

/**
 * Get detailed media insights for specific posts
 */
export async function getInstagramMediaInsights(mediaIds: string[]) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    });

    if (!influencer) {
      throw new Error("Influencer profile not found");
    }

    const instagramPlatform = await db.platform.findFirst({
      where: { name: "Instagram" }
    });

    if (!instagramPlatform) {
      throw new Error("Instagram platform not found");
    }

    const connection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: instagramPlatform.id
      }
    });

    if (!connection || !connection.accessToken) {
      throw new Error("Instagram not connected or access token missing");
    }

    const mediaInsights = await Promise.all(
      mediaIds.map(async (mediaId) => {
        return await fetchInstagramMediaInsights(mediaId, connection.accessToken!);
      })
    );

    return { success: true, data: mediaInsights };
  } catch (error) {
    console.error("❌ Instagram media insights error:", error);
    throw error;
  }
}

/**
 * Fetch insights for a specific media post
 */
async function fetchInstagramMediaInsights(mediaId: string, accessToken: string) {
  // Different metrics for different media types
  const photoMetrics = ['impressions', 'reach', 'saved', 'likes', 'comments'];
  const videoMetrics = ['impressions', 'reach', 'saved', 'video_views', 'likes', 'comments'];
  const reelsMetrics = ['impressions', 'reach', 'saved', 'video_views', 'likes', 'comments', 'shares', 'plays'];

  // First, get media info to determine type
  const mediaInfoUrl = `${INSTAGRAM_GRAPH_BASE_URL}/${mediaId}?fields=media_type&access_token=${accessToken}`;
  const mediaInfoResponse = await fetch(mediaInfoUrl);
  
  if (!mediaInfoResponse.ok) {
    throw new Error(`Instagram Media API error: ${mediaInfoResponse.status}`);
  }

  const mediaInfo = await mediaInfoResponse.json();
  
  // Choose metrics based on media type
  let metrics = photoMetrics;
  if (mediaInfo.media_type === 'VIDEO') {
    metrics = videoMetrics;
  } else if (mediaInfo.media_type === 'REELS') {
    metrics = reelsMetrics;
  }

  // Get insights
  const insightsUrl = `${INSTAGRAM_GRAPH_BASE_URL}/${mediaId}/insights` +
    `?metric=${metrics.join(',')}` +
    `&access_token=${accessToken}`;

  const insightsResponse = await fetch(insightsUrl);
  
  if (!insightsResponse.ok) {
    throw new Error(`Instagram Media Insights API error: ${insightsResponse.status}`);
  }

  const insightsData = await insightsResponse.json();
  
  if (insightsData.error) {
    throw new Error(`Instagram Media Insights API error: ${insightsData.error.message}`);
  }

  return {
    mediaId,
    mediaType: mediaInfo.media_type,
    insights: insightsData.data as InstagramMediaInsight[]
  };
}

/**
 * Get Instagram hashtag performance
 */
export async function getInstagramHashtagInsights(hashtag: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    });

    if (!influencer) {
      throw new Error("Influencer profile not found");
    }

    const instagramPlatform = await db.platform.findFirst({
      where: { name: "Instagram" }
    });

    if (!instagramPlatform) {
      throw new Error("Instagram platform not found");
    }

    const connection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: instagramPlatform.id
      }
    });

    if (!connection || !connection.accessToken) {
      throw new Error("Instagram not connected or access token missing");
    }

    // Search for hashtag (requires Business account)
    const hashtagSearchUrl = `${INSTAGRAM_GRAPH_BASE_URL}/ig_hashtag_search` +
      `?user_id=${connection.igUserId}` +
      `&q=${encodeURIComponent(hashtag)}` +
      `&access_token=${connection.accessToken}`;

    const searchResponse = await fetch(hashtagSearchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Instagram Hashtag Search API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (searchData.error) {
      throw new Error(`Instagram Hashtag Search API error: ${searchData.error.message}`);
    }

    if (!searchData.data || searchData.data.length === 0) {
      return { success: false, message: "Hashtag not found", data: null };
    }

    const hashtagId = searchData.data[0].id;

    // Get hashtag insights
    const insightsUrl = `${INSTAGRAM_GRAPH_BASE_URL}/${hashtagId}` +
      `?fields=id,name,media_count` +
      `&access_token=${connection.accessToken}`;

    const insightsResponse = await fetch(insightsUrl);
    
    if (!insightsResponse.ok) {
      throw new Error(`Instagram Hashtag Insights API error: ${insightsResponse.status}`);
    }

    const insightsData = await insightsResponse.json();
    
    if (insightsData.error) {
      throw new Error(`Instagram Hashtag Insights API error: ${insightsData.error.message}`);
    }

    return { success: true, data: insightsData };
  } catch (error) {
    console.error("❌ Instagram hashtag insights error:", error);
    throw error;
  }
}

/**
 * Advanced Instagram data sync with detailed analytics
 */
export async function advancedInstagramSync() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    });

    if (!influencer) {
      throw new Error("Influencer profile not found");
    }

    const instagramPlatform = await db.platform.findFirst({
      where: { name: "Instagram" }
    });

    if (!instagramPlatform) {
      throw new Error("Instagram platform not found");
    }

    const connection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: instagramPlatform.id
      }
    });

    if (!connection || !connection.accessToken) {
      throw new Error("Instagram not connected or access token missing");
    }

    // Get comprehensive profile data
    const profileResponse = await fetch(
      `${INSTAGRAM_GRAPH_BASE_URL}/me?fields=id,username,account_type,media_count,followers_count,follows_count,biography,website&access_token=${connection.accessToken}`
    );

    if (!profileResponse.ok) {
      throw new Error(`Instagram API error: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();

    if (profileData.error) {
      throw new Error(`Instagram API error: ${profileData.error.message}`);
    }

    // Get detailed media information
    const mediaResponse = await fetch(
      `${INSTAGRAM_GRAPH_BASE_URL}/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count,is_comment_enabled,is_shared_to_feed&limit=50&access_token=${connection.accessToken}`
    );

    let mediaData: any = { data: [] };
    if (mediaResponse.ok) {
      mediaData = await mediaResponse.json();
    }

    // Calculate advanced engagement metrics
    const analytics = calculateAdvancedEngagementMetrics(profileData, mediaData.data || []);

    // Update database with comprehensive data
    await db.influencerPlatform.update({
      where: {
        influencerId_platformId: {
          influencerId: influencer.id,
          platformId: instagramPlatform.id
        }
      },
      data: {
        username: profileData.username || "",
        lastSynced: new Date(),
        igMediaCount: profileData.media_count || 0,
        igAccountType: profileData.account_type || "PERSONAL",
        igEngagementRate: analytics.engagementRate,
        posts: profileData.media_count || 0,
        followers: profileData.followers_count || 0,
        platformData: {
          profile: profileData,
          recentMedia: mediaData.data || [],
          analytics: analytics,
          lastSync: new Date().toISOString(),
          syncType: "advanced"
        }
      }
    });

    console.log("✅ Advanced Instagram sync completed");
    return {
      success: true,
      message: "Advanced Instagram data synced successfully",
      data: { profile: profileData, analytics }
    };

  } catch (error) {
    console.error("❌ Advanced Instagram sync error:", error);
    throw error;
  }
}

/**
 * Calculate advanced engagement metrics
 */
function calculateAdvancedEngagementMetrics(profileData: any, mediaData: any[]) {
  const analytics = {
    engagementRate: 0,
    avgLikes: 0,
    avgComments: 0,
    totalEngagement: 0,
    topPerformingPost: null as any,
    postFrequency: 0,
    mediaTypeDistribution: {
      IMAGE: 0,
      VIDEO: 0,
      CAROUSEL_ALBUM: 0
    },
    engagementTrend: [] as any[]
  };

  if (!mediaData || mediaData.length === 0 || !profileData.followers_count) {
    return analytics;
  }

  let totalLikes = 0;
  let totalComments = 0;
  let totalEngagement = 0;
  let topPost = null;
  let maxEngagement = 0;

  // Process each media post
  for (const media of mediaData) {
    const likes = media.like_count || 0;
    const comments = media.comments_count || 0;
    const engagement = likes + comments;

    totalLikes += likes;
    totalComments += comments;
    totalEngagement += engagement;

    // Track top performing post
    if (engagement > maxEngagement) {
      maxEngagement = engagement;
      topPost = media;
    }

    // Track media type distribution
    if (analytics.mediaTypeDistribution.hasOwnProperty(media.media_type)) {
      analytics.mediaTypeDistribution[media.media_type as keyof typeof analytics.mediaTypeDistribution]++;
    }

    // Track engagement trend (last 10 posts)
    if (analytics.engagementTrend.length < 10) {
      analytics.engagementTrend.push({
        timestamp: media.timestamp,
        engagement: engagement,
        engagementRate: (engagement / profileData.followers_count) * 100
      });
    }
  }

  // Calculate averages
  const postCount = mediaData.length;
  analytics.avgLikes = Math.round(totalLikes / postCount);
  analytics.avgComments = Math.round(totalComments / postCount);
  analytics.totalEngagement = totalEngagement;
  analytics.topPerformingPost = topPost;
  
  // Calculate overall engagement rate
  const avgEngagementPerPost = totalEngagement / postCount;
  analytics.engagementRate = Math.round((avgEngagementPerPost / profileData.followers_count) * 100 * 100) / 100;

  // Calculate posting frequency (posts per week based on last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentPosts = mediaData.filter(media => 
    new Date(media.timestamp) > thirtyDaysAgo
  );
  
  analytics.postFrequency = Math.round((recentPosts.length / 30) * 7 * 100) / 100; // posts per week

  // Sort engagement trend by timestamp
  analytics.engagementTrend.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return analytics;
}