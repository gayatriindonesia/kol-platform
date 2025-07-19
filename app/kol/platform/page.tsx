import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getTikTokConnections } from '@/lib/tiktok.actions';
import { getAllCategories, getInfluencerWithCategories } from '@/lib/category.actions';
import { disconnectFacebook, syncFacebookData } from '@/lib/facebook.actions';

import ConnectTikTokButton from '@/components/kol/ConnectTikTokButton';
import InstagramConnectButton from '@/components/kol/InstagramConnectButton';
import FacebookConnectButton from '@/components/kol/FacebookConnectButton';
import TikTokData from '@/components/kol/TikTokData';
import CategoryManager from '@/components/kol/CategoryManager';
import { YouTubeConnectionButton } from '@/components/kol/YoutubeConnectionButton';

export const dynamic = 'force-dynamic';

const InfluencerPlatformPage = async () => {
  const session = await auth();
  if (!session?.user) redirect('/signin');

  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id },
    include: {
      platforms: {
        include: { platform: true }
      }
    }
  });

  if (!influencer) redirect("/kol");

  const [tiktokConnections, categoriesResult, influencerWithCategories] = await Promise.all([
    getTikTokConnections(),
    getAllCategories(),
    getInfluencerWithCategories()
  ]);

  const categories = categoriesResult.data || [];

  const [tiktokPlatform, instagramPlatform, youtubePlatform, facebookPlatform] = await Promise.all([
    db.platform.findFirst({ where: { name: "TikTok" } }),
    db.platform.findFirst({ where: { name: "Instagram" } }),
    db.platform.findFirst({ where: { name: "YouTube" } }),
    db.platform.findFirst({ where: { name: "Facebook" } }),
  ]);

  const platformConnection = (platformId?: string | null) =>
    influencer.platforms.find(p => p.platformId === platformId);

  const tiktokConnection = platformConnection(tiktokPlatform?.id);
  const instagramConnection = platformConnection(instagramPlatform?.id);
  const youtubeConnection = platformConnection(youtubePlatform?.id);
  const facebookConnection = platformConnection(facebookPlatform?.id);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-10">
      <h1 className="text-2xl font-bold">Kelola Platform</h1>

      {/* Categories */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Kelola Kategori</h2>
        <p className="text-sm text-gray-500 mb-4">Pilih kategori yang sesuai dengan konten Anda</p>
        {categoriesResult.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800 text-sm">Error memuat kategori: {categoriesResult.error}</p>
          </div>
        )}
        {categories.length > 0 ? (
          <CategoryManager
            categories={categories}
            influencerCategories={influencerWithCategories?.categories || []}
          />
        ) : (
          <p className="text-center text-gray-500">Belum ada kategori tersedia</p>
        )}
      </section>

      {/* TikTok */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Kelola Platform TikTok</h2>
          {!tiktokConnection && <ConnectTikTokButton />}
        </div>
        <TikTokData connections={tiktokConnections || []} />
      </section>

      {/* YouTube */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Kelola Platform YouTube</h2>
          <YouTubeConnectionButton
            isConnected={!!youtubeConnection}
            username={youtubeConnection?.username}
            lastSynced={youtubeConnection?.lastSynced || null}
          />
        </div>
        {youtubeConnection && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>Username: {youtubeConnection.username}</p>
            <p>Followers: {youtubeConnection.followers}</p>
            <p>Last Synced: {youtubeConnection.lastSynced?.toLocaleString()}</p>
          </div>
        )}
      </section>

      {/* Instagram */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Kelola Platform Instagram</h2>
          <InstagramConnectButton
            isConnected={!!instagramConnection}
            username={instagramConnection?.username}
            lastSynced={instagramConnection?.lastSynced || null}
          />
        </div>
      </section>

      {/* Facebook */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Kelola Platform Facebook</h2>

        {facebookConnection ? (
          <div className="text-sm text-gray-700 mb-4 space-y-1">
            <p>✅ Terhubung sebagai: <strong>{facebookConnection.username}</strong></p>
            <p>Followers: {facebookConnection.followers}</p>
            <p>Last Synced: {facebookConnection.lastSynced?.toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">Belum terhubung dengan Facebook</p>
        )}

        <div className="flex gap-3 flex-wrap">
          {!facebookConnection ? (
            <FacebookConnectButton />
          ) : (
            <div className="flex gap-3 flex-wrap">
              <form action={disconnectFacebook}>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Disconnect Facebook
                </button>
              </form>
              <form action={syncFacebookData}>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Sync Facebook Data
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InfluencerPlatformPage;
