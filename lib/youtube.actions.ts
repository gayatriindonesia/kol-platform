"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { google } from "googleapis";
import { redirect } from "next/navigation";

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI!;

function createOAuth2Client() {
  return new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    YOUTUBE_REDIRECT_URI
  );
}

const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/youtube.force-ssl"
];

export async function generateYouTubeAuthUrl() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id },
  });
  if (!influencer) throw new Error("Only influencers can connect YouTube");

  const oauth2Client = createOAuth2Client();
  const state = Math.random().toString(36).substring(2);

  await db.oAuthState.create({
    data: {
      state,
      userId: session.user.id,
      provider: "youtube",
      redirectUri: YOUTUBE_REDIRECT_URI,
      codeVerifier: "",
    },
  });

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: YOUTUBE_SCOPES,
    state,
  });
}

export async function handleYouTubeCallback(searchParams: URLSearchParams) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) throw new Error("Missing code or state");

  const storedState = await db.oAuthState.findUnique({
    where: { state, provider: "youtube", userId: session.user.id },
  });
  if (!storedState) throw new Error("Invalid state");

  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  console.log("✅ YouTube Tokens:", tokens);

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const channelResponse = await youtube.channels.list({
    part: ["snippet", "statistics"],
    mine: true,
  });
  console.log("channelResponse", JSON.stringify(channelResponse.data, null, 2));
  if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
    throw new Error("No YouTube channel found for the authenticated user");
  }

  const channel = channelResponse.data.items?.[0];
  if (!channel) throw new Error("Could not retrieve YouTube channel");

  let platform = await db.platform.findUnique({ where: { name: "YouTube" } });
  if (!platform) {
    platform = await db.platform.create({ data: { name: "YouTube" } });
  }

  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id },
  });
  if (!influencer) throw new Error("Influencer not found");

  await db.influencerPlatform.upsert({
    where: {
      influencerId_platformId: {
        influencerId: influencer.id,
        platformId: platform.id,
      },
    },
    update: {
      username: channel.snippet?.title || "",
      followers: parseInt(channel.statistics?.subscriberCount || "0"),
      posts: parseInt(channel.statistics?.videoCount || "0"),
      views: channel.statistics?.viewCount ?
        parseInt(channel.statistics.viewCount) : 0,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      platformData: {
        channelId: channel.id,
        description: channel.snippet?.description,
        thumbnailUrl: channel.snippet?.thumbnails?.default?.url,
      },
      lastSynced: new Date(),
    },
    create: {
      influencerId: influencer.id,
      platformId: platform.id,
      username: channel.snippet?.title || "",
      followers: parseInt(channel.statistics?.subscriberCount || "0"),
      posts: parseInt(channel.statistics?.videoCount || "0"),
      views: channel.statistics?.viewCount
        ? parseInt(channel.statistics.viewCount)
        : 0,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      platformData: {
        channelId: channel.id,
        description: channel.snippet?.description,
        thumbnailUrl: channel.snippet?.thumbnails?.default?.url,
      },
      lastSynced: new Date(),
    },
  });

  await db.oAuthState.delete({ where: { id: storedState.id } });
  return { success: true, channelName: channel.snippet?.title };
}

export async function disconnectYouTubeAccount() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id },
    });
    if (!influencer) throw new Error("Influencer profile not found");

    const youtubePlatform = await db.platform.findFirst({ where: { name: "YouTube" } });
    if (!youtubePlatform) throw new Error("YouTube platform not found");

    await db.influencerPlatform.deleteMany({
      where: {
        influencerId: influencer.id,
        platformId: youtubePlatform.id,
      },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error disconnecting YouTube account:", error);
    throw new Error("Failed to disconnect YouTube account");
  }
}

export async function connectYouTubeAccount() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id },
  });
  if (!influencer) throw new Error("Only influencers can connect YouTube");

  const authUrl = await generateYouTubeAuthUrl();
  redirect(authUrl);
}

export async function getYouTubeConnections() {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id },
    });
    if (!influencer) return [];

    const youtubePlatform = await db.platform.findFirst({ where: { name: "YouTube" } });
    if (!youtubePlatform) return [];

    return await db.influencerPlatform.findMany({
      where: {
        influencerId: influencer.id,
        platformId: youtubePlatform.id,
      },
      include: { platform: true },
    });
  } catch (error) {
    console.error("Error fetching YouTube connections:", error);
    return [];
  }
}
