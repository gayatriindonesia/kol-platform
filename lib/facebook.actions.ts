'use server'

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import axios from 'axios';

const GRAPH_API = "https://graph.facebook.com/v19.0";

export interface FacebookPageData {
  pageId: string;
  pageName: string;
  pagePicture: string;
  pageFollowers: number;
  posts?: { message?: string; created_time: string }[];
  instagramBusinessAccount?: {
    id: string;
    username: string;
  };
}

/**
 * Ambil data halaman Facebook dan akun IG bisnis yang terhubung
 */
export async function getFacebookPageData(userAccessToken: string): Promise<FacebookPageData[]> {
  try {
    // 1. Ambil list halaman yang dikelola user
    const accountsRes = await axios.get(`${GRAPH_API}/me/accounts`, {
      params: {
        access_token: userAccessToken,
      },
    });

    const pages = accountsRes.data.data;

    if (!pages || pages.length === 0) {
      console.warn("[getFacebookPageData] Tidak ada halaman yang ditemukan.");
      return [];
    }

    const result: FacebookPageData[] = [];

    for (const page of pages) {
      const pageId = page.id;
      const pageAccessToken = page.access_token;

      // 2. Ambil data halaman: followers, foto, post, dan IG
      const pageFields = [
        "name",
        "fan_count",
        "picture.type(large)",
        "posts.limit(3){message,created_time}",
        "connected_instagram_account{id,username}"
      ].join(",");

      const pageRes = await axios.get(`${GRAPH_API}/${pageId}`, {
        params: {
          fields: pageFields,
          access_token: pageAccessToken,
        },
      });

      const pageData = pageRes.data;

      result.push({
        pageId,
        pageName: pageData.name,
        pagePicture: pageData.picture?.data?.url,
        pageFollowers: pageData.fan_count || 0,
        posts: pageData.posts?.data || [],
        instagramBusinessAccount: pageData.connected_instagram_account || undefined,
      });
    }

    return result;
  } catch (err: any) {
    console.error("[getFacebookPageData] Error:", err?.response?.data || err.message);
    return [];
  }
}

// Validasi environment
function validateEnvironmentVars() {
  const requiredVars = ['FACEBOOK_CLIENT_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_REDIRECT_URI'];
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// ========== FACEBOOK AUTH START ==========
export async function initiateFacebookAuth(): Promise<void> {
  try {
    console.log('[initiateFacebookAuth] Starting Facebook authentication...');
    validateEnvironmentVars();

    const session = await auth();
    console.log('[initiateFacebookAuth] Session:', session?.user?.id || 'No session');

    if (!session?.user) redirect('/signin');

    const influencer = await db.influencer.findUnique({ where: { userId: session.user.id } });
    console.log('[initiateFacebookAuth] Influencer found:', !!influencer);
    if (!influencer) redirect('/kol');

    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_read_user_content',
      'instagram_basic',
      'instagram_manage_insights',
      'public_profile',
      'email'
    ].join(',');

    const state = `user_${session.user.id}_${Date.now()}`;
    const facebookAuthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    facebookAuthUrl.searchParams.set('client_id', process.env.FACEBOOK_CLIENT_ID!);
    facebookAuthUrl.searchParams.set('redirect_uri', process.env.FACEBOOK_REDIRECT_URI!);
    facebookAuthUrl.searchParams.set('scope', scopes);
    facebookAuthUrl.searchParams.set('state', state);
    facebookAuthUrl.searchParams.set('response_type', 'code');
    facebookAuthUrl.searchParams.set('display', 'popup');

    console.log('[initiateFacebookAuth] Redirecting to Facebook:', facebookAuthUrl.toString());
    redirect(facebookAuthUrl.toString());

  } catch (error) {
  if (typeof error === 'object' && error !== null && 'digest' in error && (error as any).digest === 'NEXT_REDIRECT') return;


    const params = new URLSearchParams({
      success: 'false',
      message: error instanceof Error && error.message.includes('Missing environment variables')
        ? `Konfigurasi tidak lengkap: ${error.message}`
        : 'Gagal menghubungkan dengan Facebook',
      debug: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : ''
    });
    redirect(`/kol/platform?${params.toString()}`);
  }
}

export async function handleFacebookCallback(code: string, state?: string): Promise<void> {
  try {
    console.log('[handleFacebookCallback] Starting callback handling...');
    if (!code) throw new Error('No authorization code received from Facebook');
    validateEnvironmentVars();

    const session = await auth();
    if (!session?.user) redirect('/signin');
    if (state && !state.startsWith(`user_${session.user.id}`)) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    console.log('[handleFacebookCallback] Exchanging code for access token...');
    const tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
    const tokenParams = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
      code: code
    });

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams.toString()}`);
    const responseText = await tokenResponse.text();
    if (!tokenResponse.ok) throw new Error(`Facebook token exchange failed: ${tokenResponse.status} - ${responseText}`);

    const tokenData = JSON.parse(responseText);
    if (!tokenData.access_token) throw new Error('No access token received from Facebook');

    console.log('[handleFacebookCallback] Fetching user information...');
    const userResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${tokenData.access_token}&fields=id,name,email,picture`
    );
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Failed to fetch Facebook user info: ${userResponse.status} - ${errorText}`);
    }

    const userData = await userResponse.json();
    const influencer = await db.influencer.findUnique({ where: { userId: session.user.id } });
    if (!influencer) redirect('/kol');

    let facebookPlatform = await db.platform.findFirst({ where: { name: "Facebook" } });
    if (!facebookPlatform) {
      facebookPlatform = await db.platform.create({ data: { name: "Facebook" } });
    }

    const tokenExpiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    await db.influencerPlatform.upsert({
      where: {
        influencerId_platformId: {
          influencerId: influencer.id,
          platformId: facebookPlatform.id
        }
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        username: userData.name,
        lastSynced: new Date(),
        tokenExpiresAt: tokenExpiresAt
      },
      create: {
        influencerId: influencer.id,
        platformId: facebookPlatform.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        username: userData.name,
        lastSynced: new Date(),
        tokenExpiresAt: tokenExpiresAt
      }
    });

    await syncFacebookDataInternal(influencer.id, tokenData.access_token);
    revalidatePath('/kol/platform');

    const params = new URLSearchParams({
      success: 'true',
      message: 'Facebook berhasil dihubungkan'
    });
    redirect(`/kol/platform?${params.toString()}`);

  } catch (error) {
  if (typeof error === 'object' && error !== null && 'digest' in error && (error as any).digest === 'NEXT_REDIRECT') return;


    let errorMessage = 'Gagal menyelesaikan koneksi Facebook';
    if (error instanceof Error) {
      if (error.message.includes('authorization code')) errorMessage = 'Kode otorisasi dari Facebook tidak valid';
      else if (error.message.includes('token exchange')) errorMessage = 'Gagal menukar kode dengan token akses';
      else if (error.message.includes('user info')) errorMessage = 'Gagal mengambil informasi pengguna dari Facebook';
      else if (error.message.includes('CSRF')) errorMessage = 'Permintaan tidak valid - kemungkinan serangan keamanan';
      else if (error.message.includes('Missing environment variables')) errorMessage = 'Konfigurasi server tidak lengkap';
    }

    const params = new URLSearchParams({
      success: 'false',
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : ''
    });
    redirect(`/kol/platform?${params.toString()}`);
  }
}

// ========== FACEBOOK SYNC ==========
async function syncFacebookDataInternal(influencerId: string, accessToken: string): Promise<number> {
  try {
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}&fields=id,name,fan_count,followers_count,access_token`
    );

    let followers = 0;
    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      followers = pagesData?.data?.[0]?.fan_count || pagesData?.data?.[0]?.followers_count || 0;
    }

    const facebookPlatform = await db.platform.findFirst({ where: { name: "Facebook" } });
    if (facebookPlatform) {
      await db.influencerPlatform.updateMany({
        where: { influencerId, platformId: facebookPlatform.id },
        data: {
          followers,
          lastSynced: new Date()
        }
      });
    }

    return followers;
  } catch (error) {
    console.error('[syncFacebookDataInternal] Error:', error);
    return 0;
  }
}

export async function syncFacebookData(): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user) {
      return redirect("/signin");
    }

    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id },
      include: {
        platforms: {
          include: { platform: true },
        },
      },
    });

    if (!influencer) {
      return redirect("/kol");
    }

    const facebookConnection = influencer.platforms.find(
      (p) => p.platform.name === "Facebook"
    );

    if (!facebookConnection || !facebookConnection.accessToken) {
      return redirect(
        `/kol/platform?${new URLSearchParams({
          success: "false",
          message: "Tidak ada koneksi Facebook yang ditemukan",
        })}`
      );
    }

    if (
      facebookConnection.tokenExpiresAt &&
      facebookConnection.tokenExpiresAt < new Date()
    ) {
      return redirect(
        `/kol/platform?${new URLSearchParams({
          success: "false",
          message:
            "Token Facebook telah kadaluarsa, silakan hubungkan kembali",
        })}`
      );
    }

    // Sinkronisasi ke database
    const followers = await syncFacebookDataInternal(
      influencer.id,
      facebookConnection.accessToken
    );

    // Optional: panggil revalidatePath jika memang kamu pakai caching App Router.
    // revalidatePath("/kol/platform");

    return redirect(
      `/kol/platform?${new URLSearchParams({
        success: "true",
        message: `Data Facebook berhasil disinkronkan (${followers} followers)`,
      })}`
    );
  } catch (error: any) {
    // NEXT_REDIRECT adalah expected dari redirect()
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as any).digest === "NEXT_REDIRECT"
    ) {
      return;
    }

    const debug =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "";

    return redirect(
      `/kol/platform?${new URLSearchParams({
        success: "false",
        message: "Gagal menyinkronkan data Facebook",
        debug,
      })}`
    );
  }
}


// ========== DISCONNECT ==========
export async function disconnectFacebook(): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user) redirect('/signin');

    const influencer = await db.influencer.findUnique({ where: { userId: session.user.id } });
    if (!influencer) redirect('/kol');

    const facebookPlatform = await db.platform.findFirst({ where: { name: "Facebook" } });
    if (facebookPlatform) {
      await db.influencerPlatform.deleteMany({
        where: {
          influencerId: influencer.id,
          platformId: facebookPlatform.id
        }
      });
    }

    revalidatePath('/kol/platform');
    redirect(`/kol/platform?${new URLSearchParams({ success: 'true', message: 'Facebook berhasil diputuskan' })}`);
  } catch (error) {
  if (typeof error === 'object' && error !== null && 'digest' in error && (error as any).digest === 'NEXT_REDIRECT') return;
    console.error('[disconnectFacebook] Error:', error);
    redirect(`/kol/platform?${new URLSearchParams({ success: 'false', message: 'Gagal memutuskan koneksi Facebook', debug: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : '' })}`);
  }
}
