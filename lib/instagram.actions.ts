"use server";

import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { generateRandomString } from "@/lib/utils";
import { auth } from "@/auth";
import { db } from "./db";

// Instagram OAuth Configuration
const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID!;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI!;

/**
 * Inisiasi OAuth Instagram - Mengarahkan pengguna ke halaman otentikasi Instagram
 * Ini akan membuat state OAuth dan menyimpannya di database
 */
// lib/instagram.actions.ts (Updated key functions)

/**
 * Inisiasi OAuth Instagram - Mengarahkan pengguna ke halaman otentikasi Instagram
 * Ini akan membuat state OAuth dan menyimpannya di database
 */
export async function initiateInstagramAuth() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to connect Instagram");
  }
  
  try {
    // Generate state dan code verifier untuk PKCE
    const state = uuidv4();
    const codeVerifier = generateRandomString(64);
    
    // Simpan state dan code verifier ke database untuk verifikasi nanti
    await db.oAuthState.create({
      data: {
        state,
        codeVerifier,
        userId: session.user.id,
        provider: "Instagram",
        redirectUri: "/kol/platform", // Redirect setelah otentikasi berhasil
      }
    });
    
    // Log configuration for debugging (omit sensitive parts)
    console.log("Instagram OAuth Config:", {
      clientIdExists: Boolean(INSTAGRAM_CLIENT_ID),
      redirectUri: INSTAGRAM_REDIRECT_URI,
      state,
    });
    
    // Buat URL otentikasi Instagram
    const instagramAuthUrl = new URL("https://api.instagram.com/oauth/authorize");
    instagramAuthUrl.searchParams.append("client_id", INSTAGRAM_CLIENT_ID);
    instagramAuthUrl.searchParams.append("redirect_uri", INSTAGRAM_REDIRECT_URI);
    instagramAuthUrl.searchParams.append("scope", "user_profile,user_media");
    instagramAuthUrl.searchParams.append("response_type", "code");
    instagramAuthUrl.searchParams.append("state", state);
    
    console.log("Redirecting to Instagram auth URL:", instagramAuthUrl.toString());
    
    // Redirect ke halaman otentikasi Instagram
    return redirect(instagramAuthUrl.toString());
  } catch (error) {
    console.error("Error initiating Instagram auth:", error);
    throw error;
  }
}

/**
 * Handle callback dari Instagram OAuth
 * Menerima code dan state dari Instagram, mengambil access token, dan menyimpan data profil
 */
export async function handleInstagramCallback(code: string, state: string) {
  const session = await auth();

  if (!session?.user?.id) {
    console.error("Unauthorized access - no session");
    throw new Error("Unauthorized: You must be logged in");
  }

  console.log("✅ Session user:", session.user.id);
  console.log("📥 Received code:", code);
  console.log("📥 Received state:", state);

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
    const requestBody = {
      client_id: INSTAGRAM_CLIENT_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: INSTAGRAM_REDIRECT_URI,
      code
    };

    console.log("🚀 Sending token request with body:", requestBody);

    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams(requestBody)
    });

    const rawResponse = await tokenResponse.text();

    console.log("📦 Instagram token response status:", tokenResponse.status);
    console.log("📦 Instagram token response body:", rawResponse);

    if (!tokenResponse.ok) {
      throw new Error(`Failed to exchange code: ${tokenResponse.status} - ${rawResponse}`);
    }

    let tokenData: any = {};
    try {
      tokenData = JSON.parse(rawResponse);
    } catch (err) {
      console.error("❌ Error parsing token response JSON:", err);
      throw new Error("Invalid JSON response from Instagram");
    }

    const { access_token, user_id } = tokenData;
    if (!access_token || !user_id) {
      console.error("❌ Missing access_token or user_id in response");
      throw new Error("Incomplete access token data from Instagram");
    }

    console.log("✅ Received access token & user ID:", { access_token, user_id });

    // Simpan data ke influencerPlatform
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    });

    if (!influencer) {
      throw new Error("Influencer account not found");
    }

    const instagramPlatform = await db.platform.findFirst({
      where: { name: "Instagram" }
    });

    if (!instagramPlatform) {
      throw new Error("Instagram platform not found in database");
    }

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
        lastSynced: new Date()
      },
      create: {
        username: "", // Instagram username can be fetched later
        influencerId: influencer.id,
        platformId: instagramPlatform.id,
        accessToken: access_token,
        igUserId: user_id,
        lastSynced: new Date()
      }
    });

    console.log("✅ Instagram access saved to database");

    // Clean up state
    await db.oAuthState.delete({ where: { id: savedOAuthState.id } });

    return redirect(redirectAfter);
  } catch (error) {
    console.error("❌ Instagram callback error:", error);

    // Clean up state on error
    await db.oAuthState.delete({ where: { id: savedOAuthState.id } }).catch(() => {});

    throw error;
  }
}

/**
 * Memutuskan koneksi Instagram
 */
export async function disconnectInstagram() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to disconnect Instagram");
  }
  
  // Cari akun influencer pengguna
  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id }
  });
  
  if (!influencer) {
    throw new Error("Influencer account not found");
  }
  
  // Cari platform Instagram dari database
  const instagramPlatform = await db.platform.findFirst({
    where: { name: "Instagram" }
  });
  
  if (!instagramPlatform) {
    throw new Error("Instagram platform not found in database");
  }
  
  // Cari koneksi Instagram yang ada
  const instagramConnection = await db.influencerPlatform.findFirst({
    where: {
      influencerId: influencer.id,
      platformId: instagramPlatform.id
    }
  });
  
  if (!instagramConnection) {
    return { success: false, message: "No Instagram connection found" };
  }
  
  // Jika ada access token, revoke dari Instagram (opsional)
  if (instagramConnection.accessToken) {
    try {
      await fetch(`https://graph.instagram.com/v14.0/${instagramConnection.igUserId}/permissions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          access_token: instagramConnection.accessToken
        })
      });
    } catch (error) {
      console.error("Error revoking Instagram access:", error);
      // Lanjutkan meskipun revoke gagal
    }
  }
  
  // Hapus koneksi dari database
  await db.influencerPlatform.delete({
    where: { id: instagramConnection.id }
  });
  
  return { success: true, message: "Instagram disconnected successfully" };
}

/**
 * Sinkronisasi data Instagram
 * Mengambil data terbaru dari API Instagram dan memperbarui database
 */
export async function syncInstagramData() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to sync Instagram data");
  }
  
  // Cari akun influencer pengguna
  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id }
  });
  
  if (!influencer) {
    throw new Error("Influencer account not found");
  }
  
  // Cari platform Instagram dari database
  const instagramPlatform = await db.platform.findFirst({
    where: { name: "Instagram" }
  });
  
  if (!instagramPlatform) {
    throw new Error("Instagram platform not found in database");
  }
  
  // Cari koneksi Instagram yang ada
  const instagramConnection = await db.influencerPlatform.findFirst({
    where: {
      influencerId: influencer.id,
      platformId: instagramPlatform.id
    }
  });
  
  if (!instagramConnection || !instagramConnection.accessToken) {
    throw new Error("Instagram not connected or access token missing");
  }
  
  try {
    // Dapatkan data profil pengguna Instagram
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${instagramConnection.accessToken}`
    );
    
    const profileData = await profileResponse.json();
    
    // Dapatkan media terbaru untuk menghitung engagement
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,like_count,comments_count&access_token=${instagramConnection.accessToken}`
    );
    
    const mediaData = await mediaResponse.json();
    
    // Hitung engagement rate sederhana jika ada media
    let engagementRate = 0;
    if (mediaData.data && mediaData.data.length > 0) {
      let totalEngagement = 0;
      for (const media of mediaData.data) {
        totalEngagement += (media.like_count || 0) + (media.comments_count || 0);
      }
      engagementRate = (totalEngagement / mediaData.data.length) / (profileData.media_count || 1);
    }
    
    // Update koneksi Instagram dengan data terbaru
    await db.influencerPlatform.update({
      where: { id: instagramConnection.id },
      data: {
        username: profileData.username,
        lastSynced: new Date(),
        igMediaCount: profileData.media_count || 0,
        igAccountType: profileData.account_type,
        igEngagementRate: engagementRate,
        platformData: {
          ...profileData,
          recentMedia: mediaData.data || []
        }
      }
    });
    
    return { success: true, message: "Instagram data synced successfully" };
    
  } catch (error) {
    console.error("Instagram sync error:", error);
    throw new Error("Failed to sync Instagram data");
  }
}