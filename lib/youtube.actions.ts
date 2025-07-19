"use server";

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { google } from "googleapis"

// Ensure these are set in your .env file
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI!

// Create OAuth2 client
function createOAuth2Client() {
  return new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    YOUTUBE_REDIRECT_URI
  )
}

// Tambahkan fungsi untuk mendapatkan koneksi YouTube
export async function getYouTubeConnections() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id },
    });

    if (!influencer) return [];

    const youtubePlatform = await db.platform.findFirst({
       where: { name: "YouTube" }
    });

    if (!youtubePlatform) return [];

    const youtubeConnections = await db.influencerPlatform.findMany({
      where: {
        influencerId: influencer.id,
        platformId: youtubePlatform.id
      },
      include: {
        platform: true
      }
    });

    return youtubeConnections;
  } catch (error) {
    console.error('Error fetching YouTube connections:', error);
    return [];
  }
}

export async function disconnectYouTubeAccount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    });

    if (!influencer) {
      throw new Error("Influencer profile not found");
    }

    const youtubePlatform = await db.platform.findFirst({
      where: { name: "YouTube" }
    });

    if (!youtubePlatform) {
      throw new Error("YouTube platform not found");
    }

    // Delete the connection
    await db.influencerPlatform.deleteMany({
      where: {
        influencerId: influencer.id,
        platformId: youtubePlatform.id
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting YouTube account:", error);
    throw new Error("Failed to disconnect YouTube account");
  }
}

// Generate authorization URL
export async function generateYouTubeAuthUrl() {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    throw new Error("Not authenticated")
  }

  // Check if user is an Influencer
  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id }
  })

  if (!influencer) {
    throw new Error("Only influencers can connect YouTube accounts")
  }

  const oauth2Client = createOAuth2Client()

  // Scopes for YouTube data
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]

  // Generate a unique state to prevent CSRF
  const state = Math.random().toString(36).substring(2)

  // Store state in database for verification
  await db.oAuthState.create({
    data: {
      state,
      userId: session.user.id,
      provider: 'youtube',
      codeVerifier: '', // For PKCE if needed
      redirectUri: YOUTUBE_REDIRECT_URI
    }
  })

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    prompt: 'consent' // Always show consent screen
  })

  return authUrl
}

// Handle YouTube callback
export async function handleYouTubeCallback(searchParams: URLSearchParams) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Not authenticated")
  }

  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    throw new Error("Missing code or state")
  }

  // Verify state to prevent CSRF
  const storedState = await db.oAuthState.findUnique({
    where: { state, provider: 'youtube', userId: session.user.id }
  })

  if (!storedState) {
    throw new Error("Invalid state")
  }

  const oauth2Client = createOAuth2Client()

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get YouTube channel information
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
    const channelResponse = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true
    })

    const channel = channelResponse.data.items?.[0]
    if (!channel) {
      throw new Error("Could not retrieve YouTube channel")
    }

    // Find or create Platform for YouTube
    let platform = await db.platform.findUnique({
      where: { name: 'YouTube' }
    })

    if (!platform) {
      platform = await db.platform.create({
        data: { name: 'YouTube' }
      })
    }

    // Find the Influencer
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    })

    if (!influencer) {
      throw new Error("Influencer profile not found")
    }

    // Create or update InfluencerPlatform
    await db.influencerPlatform.upsert({
      where: {
        influencerId_platformId: {
          influencerId: influencer.id,
          platformId: platform.id
        }
      },
      update: {
        username: channel.snippet?.title || '',
        followers: channel.statistics?.subscriberCount ? 
          parseInt(channel.statistics.subscriberCount) : 0,
        posts: channel.statistics?.videoCount ? 
          parseInt(channel.statistics.videoCount) : 0,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expiry_date ? 
          new Date(tokens.expiry_date) : undefined,
        platformData: {
          channelId: channel.id,
          description: channel.snippet?.description,
          thumbnailUrl: channel.snippet?.thumbnails?.default?.url
        },
        lastSynced: new Date()
      },
      create: {
        influencerId: influencer.id,
        platformId: platform.id,
        username: channel.snippet?.title || '',
        followers: channel.statistics?.subscriberCount ? 
          parseInt(channel.statistics.subscriberCount) : 0,
        posts: channel.statistics?.videoCount ? 
          parseInt(channel.statistics.videoCount) : 0,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expiry_date ? 
          new Date(tokens.expiry_date) : undefined,
        platformData: {
          channelId: channel.id,
          description: channel.snippet?.description,
          thumbnailUrl: channel.snippet?.thumbnails?.default?.url
        },
        lastSynced: new Date()
      }
    })

    // Delete the used state
    await db.oAuthState.delete({
      where: { id: storedState.id }
    })

    return { success: true, channelName: channel.snippet?.title }
  } catch (error) {
    console.error("YouTube connection error:", error)
    throw new Error("Failed to connect YouTube account")
  }
}

// Server action to initiate YouTube connection
export async function connectYouTubeAccount() {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Not authenticated")
  }

  // Ensure user is an Influencer
  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id }
  })

  if (!influencer) {
    throw new Error("Only influencers can connect YouTube accounts")
  }

  // Generate and redirect to YouTube auth URL
  const authUrl = await generateYouTubeAuthUrl()
  redirect(authUrl)
}