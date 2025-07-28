"use server";

import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { generateRandomString } from "@/lib/utils";
import { auth } from "@/auth";
import { db } from "./db";

// Instagram OAuth Configuration with validation
const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

// Validate environment variables
export async function validateConfig() {
  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_APP_SECRET || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram environment variables not configured. Please set INSTAGRAM_CLIENT_ID, INSTAGRAM_APP_SECRET, and INSTAGRAM_REDIRECT_URI");
  }
}

/**
 * Get or create Instagram platform record
 */
async function getInstagramPlatform() {
  let instagramPlatform = await db.platform.findFirst({
    where: { name: "Instagram" }
  });

  if (!instagramPlatform) {
    // Create Instagram platform if it doesn't exist
    instagramPlatform = await db.platform.create({
      data: { name: "Instagram" }
    });
    console.log("✅ Created Instagram platform record");
  }

  return instagramPlatform;
}

/**
 * Get or create influencer record for user
 */
async function getOrCreateInfluencer(userId: string) {
  let influencer = await db.influencer.findUnique({
    where: { userId }
  });

  if (!influencer) {
    influencer = await db.influencer.create({
      data: { userId }
    });
    console.log("✅ Created influencer record for user");
  }

  return influencer;
}

/**
 * Initiate Instagram OAuth - Redirect user to Instagram authentication page
 */
export async function initiateInstagramAuth() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to connect Instagram");
  }

  try {
    // Validate configuration
    validateConfig();

    // Generate state and code verifier for PKCE
    const state = uuidv4();
    const codeVerifier = generateRandomString(64);
    
    // Save state and code verifier to database for verification later
    await db.oAuthState.create({
      data: {
        state,
        codeVerifier,
        userId: session.user.id,
        provider: "instagram",
        redirectUri: "/kol/platform", // Redirect after successful authentication
      }
    });
    
    // Log configuration for debugging (omit sensitive parts)
    console.log("📱 Instagram OAuth Config:", {
      clientIdExists: Boolean(INSTAGRAM_CLIENT_ID),
      redirectUri: INSTAGRAM_REDIRECT_URI,
      state,
    });
    
    // Create Instagram authentication URL
    const instagramAuthUrl = new URL("https://api.instagram.com/oauth/authorize");
    instagramAuthUrl.searchParams.append("client_id", INSTAGRAM_CLIENT_ID!);
    instagramAuthUrl.searchParams.append("redirect_uri", INSTAGRAM_REDIRECT_URI!);
    instagramAuthUrl.searchParams.append("scope", "user_profile,user_media,user_profile,instagram_basic");
    instagramAuthUrl.searchParams.append("response_type", "code");
    instagramAuthUrl.searchParams.append("state", state);
    
    console.log("🔗 Redirecting to Instagram auth URL:", instagramAuthUrl.toString());
    
    // Redirect to Instagram authentication page
    return redirect(instagramAuthUrl.toString());
  } catch (error) {
    console.error("❌ Error initiating Instagram auth:", error);
    throw error;
  }
}

/**
 * Handle callback from Instagram OAuth
 * Receive code and state from Instagram, get access token, and save profile data
 */
export async function handleInstagramCallback(code: string, state: string) {
  const session = await auth();

  if (!session?.user?.id) {
    console.error("❌ Unauthorized access - no session");
    throw new Error("Unauthorized: You must be logged in");
  }

  console.log("✅ Session user:", session.user.id);
  console.log("📥 Received code:", code ? "***" : "missing");
  console.log("📥 Received state:", state);

  // Validate OAuth state
  const savedOAuthState = await db.oAuthState.findUnique({ where: { state } });

  if (!savedOAuthState) {
    console.error("❌ Invalid OAuth state (not found in DB)");
    throw new Error("Invalid OAuth state");
  }

  if (savedOAuthState.userId !== session.user.id) {
    console.error("❌ OAuth state user mismatch");
    throw new Error("OAuth state does not belong to the current user");
  }

  const redirectAfter = savedOAuthState.redirectUri || "/kol/platform";

  try {
    // Validate configuration
    validateConfig();

    const requestBody = {
      client_id: INSTAGRAM_CLIENT_ID!,
      client_secret: INSTAGRAM_APP_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: INSTAGRAM_REDIRECT_URI!,
      code
    };

    console.log("🚀 Sending token request to Instagram");

    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams(requestBody)
    });

    const rawResponse = await tokenResponse.text();

    console.log("📦 Instagram token response status:", tokenResponse.status);
    
    if (!tokenResponse.ok) {
      console.error("❌ Token exchange failed:", rawResponse);
      throw new Error(`Failed to exchange code: ${tokenResponse.status} - ${rawResponse}`);
    }

    let tokenData: any = {};
    try {
      tokenData = JSON.parse(rawResponse);
    } catch (err) {
      console.error("❌ Error parsing token response JSON:", err);
      console.error("Raw response:", rawResponse);
      throw new Error("Invalid JSON response from Instagram");
    }

    const { access_token, user_id } = tokenData;
    if (!access_token || !user_id) {
      console.error("❌ Missing access_token or user_id in response:", tokenData);
      throw new Error("Incomplete access token data from Instagram");
    }

    console.log("✅ Received access token & user ID");

    // Get or create influencer and platform records
    const [influencer, instagramPlatform] = await Promise.all([
      getOrCreateInfluencer(session.user.id),
      getInstagramPlatform()
    ]);

    // Save data to influencerPlatform
    await db.influencerPlatform.upsert({
      where: {
        influencerId_platformId: {
          influencerId: influencer.id,
          platformId: instagramPlatform.id
        }
      },
      update: {
        accessToken: access_token,
        igUserId: user_id,
        lastSynced: new Date(),
        username: "" // Will be updated on first sync
      },
      create: {
        username: "", // Instagram username will be fetched during sync
        influencerId: influencer.id,
        platformId: instagramPlatform.id,
        accessToken: access_token,
        igUserId: user_id,
        lastSynced: new Date(),
        followers: 0,
        posts: 0
      }
    });

    console.log("✅ Instagram connection saved to database");

    // Clean up state
    await db.oAuthState.delete({ where: { id: savedOAuthState.id } });

    // Try to sync initial data
    try {
      await syncInstagramDataInternal(influencer.id, instagramPlatform.id, access_token);
      console.log("✅ Initial Instagram data sync completed");
    } catch (syncError) {
      console.warn("⚠️ Initial sync failed, but connection saved:", syncError);
      // Don't throw error here, connection is still valid
    }

    return redirect(redirectAfter);
  } catch (error) {
    console.error("❌ Instagram callback error:", error);

    // Clean up state on error
    try {
      await db.oAuthState.delete({ where: { id: savedOAuthState.id } });
    } catch (cleanupError) {
      console.error("❌ Error cleaning up OAuth state:", cleanupError);
    }

    throw error;
  }
}

/**
 * Internal function to sync Instagram data
 */
async function syncInstagramDataInternal(influencerId: string, platformId: string, accessToken: string) {
  try {
    // Get Instagram profile data with more comprehensive fields
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

    // Get recent media for engagement calculation with more detailed metrics
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,like_count,comments_count,timestamp,permalink,media_url,thumbnail_url,caption&limit=25&access_token=${accessToken}`
    );

    let mediaData: any = { data: [] };
    if (mediaResponse.ok) {
      mediaData = await mediaResponse.json();
    }

    // Calculate engagement rate
    let engagementRate = 0;
    if (mediaData.data && mediaData.data.length > 0) {
      let totalEngagement = 0;
      let validPosts = 0;
      
      for (const media of mediaData.data) {
        if (media.like_count !== undefined && media.comments_count !== undefined) {
          totalEngagement += (media.like_count || 0) + (media.comments_count || 0);
          validPosts++;
        }
      }
      
      if (validPosts > 0 && profileData.media_count > 0) {
        const avgEngagement = totalEngagement / validPosts;
        engagementRate = (avgEngagement / profileData.media_count) * 100;
      }
    }

    // Update connection with fetched data
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
        igEngagementRate: Math.round(engagementRate * 100) / 100, // Round to 2 decimal places
        posts: profileData.media_count || 0,
        followers: profileData.followers_count || 0,
        platformData: {
          profile: profileData,
          recentMedia: mediaData.data || [],
          lastSync: new Date().toISOString()
        }
      }
    });

    return { success: true, data: profileData };
  } catch (error) {
    console.error("❌ Instagram sync error:", error);
    throw error;
  }
}

/**
 * Disconnect Instagram connection
 */
export async function disconnectInstagram() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to disconnect Instagram");
  }
  
  try {
    // Get influencer account
    const influencer = await getOrCreateInfluencer(session.user.id);
    const instagramPlatform = await getInstagramPlatform();
    
    // Find existing Instagram connection
    const instagramConnection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: instagramPlatform.id
      }
    });
    
    if (!instagramConnection) {
      return { success: false, message: "No Instagram connection found" };
    }
    
    // Try to revoke access from Instagram (optional, may fail)
    if (instagramConnection.accessToken && instagramConnection.igUserId) {
      try {
        const revokeResponse = await fetch(
          `https://graph.instagram.com/${instagramConnection.igUserId}/permissions?access_token=${instagramConnection.accessToken}`,
          { method: "DELETE" }
        );
        console.log("Instagram access revoked:", revokeResponse.status);
      } catch (error) {
        console.warn("Failed to revoke Instagram access (continuing with disconnect):", error);
      }
    }
    
    // Delete connection from database
    await db.influencerPlatform.delete({
      where: { id: instagramConnection.id }
    });
    
    console.log("✅ Instagram connection removed");
    return { success: true, message: "Instagram disconnected successfully" };
    
  } catch (error) {
    console.error("❌ Error disconnecting Instagram:", error);
    throw new Error("Failed to disconnect Instagram");
  }
}

/**
 * Sync Instagram data - Fetch latest data from Instagram API and update database
 */
export async function syncInstagramData() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to sync Instagram data");
  }
  
  try {
    // Get influencer account and platform
    const influencer = await getOrCreateInfluencer(session.user.id);
    const instagramPlatform = await getInstagramPlatform();
    
    // Find existing Instagram connection
    const instagramConnection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: instagramPlatform.id
      }
    });
    
    if (!instagramConnection || !instagramConnection.accessToken) {
      throw new Error("Instagram not connected or access token missing");
    }
    
    // Sync data using internal function
    const result = await syncInstagramDataInternal(
      influencer.id,
      instagramPlatform.id,
      instagramConnection.accessToken
    );
    
    console.log("✅ Instagram data sync completed");
    return { success: true, message: "Instagram data synced successfully", data: result.data };
    
  } catch (error) {
    console.error("❌ Instagram sync error:", error);
    
    // Check if it's a token error
    if (error instanceof Error && error.message.includes("token")) {
      throw new Error("Instagram access token expired. Please reconnect your account.");
    }
    
    throw new Error("Failed to sync Instagram data. Please try again later.");
  }
}

/**
 * Get Instagram connection status for a user
 */
export async function getInstagramConnection() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }
  
  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!influencer) {
      return null;
    }
    
    const instagramPlatform = await db.platform.findFirst({
      where: { name: "Instagram" }
    });
    
    if (!instagramPlatform) {
      return null;
    }
    
    const connection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: instagramPlatform.id
      }
    });
    
    return connection;
  } catch (error) {
    console.error("Error getting Instagram connection:", error);
    return null;
  }
}