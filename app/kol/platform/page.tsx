import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getTikTokConnections } from '@/lib/tiktok.actions';
import { getAllCategories, getInfluencerWithCategories } from '@/lib/category.actions';
import { disconnectFacebook, syncFacebookData } from '@/lib/facebook.actions';
import { FaTiktok, FaYoutube, FaInstagram, FaFacebook } from 'react-icons/fa';

import InstagramConnectButton from '@/components/kol/InstagramConnectButton';
import FacebookConnectButton from '@/components/kol/FacebookConnectButton';
import TikTokData from '@/components/kol/TikTokData';
import CategoryManager from '@/components/kol/CategoryManager';
import { YouTubeConnectionButton } from '@/components/kol/YoutubeConnectionButton';
import YouTubeData from '@/components/kol/YouTubeData';
import { getCurrentInfluencer } from '@/lib/influencer.actions';

export const dynamic = 'force-dynamic';

const InfluencerPlatformPage = async () => {
  const session = await auth();
  if (!session?.user) redirect('/signin');

  const influencer = await getCurrentInfluencer();

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

  const getPlatformIcon = (platform: string) => {
    const iconProps = { className: "w-5 h-5 text-white" };
    const icons = {
      TikTok: <FaTiktok {...iconProps} />,
      Instagram: <FaInstagram {...iconProps} />,
      YouTube: <FaYoutube {...iconProps} />,
      Facebook: <FaFacebook {...iconProps} />
    };
    return icons[platform as keyof typeof icons] || <span className="text-white">🔗</span>;
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      TikTok: "from-pink-500 to-purple-600",
      Instagram: "from-purple-500 to-pink-500",
      YouTube: "from-red-500 to-red-600",
      Facebook: "from-blue-500 to-blue-600"
    };
    return colors[platform as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  const connectedPlatforms = [
    { name: "TikTok", connection: tiktokConnection, color: "pink" },
    { name: "Instagram", connection: instagramConnection, color: "purple" },
    { name: "YouTube", connection: youtubeConnection, color: "red" },
    { name: "Facebook", connection: facebookConnection, color: "blue" }
  ].filter(p => p.connection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Dashboard Platform
              </h1>
              <p className="mt-1 text-gray-600">Kelola koneksi dan kategori platform media sosial Anda</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{connectedPlatforms.length} Platform Terhubung</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Categories Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏷️</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Kategori Konten</h2>
                <p className="text-indigo-100 text-sm">Pilih kategori yang sesuai dengan konten Anda</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {categoriesResult.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <div className="w-5 h-5 text-red-500 mt-0.5">⚠️</div>
                <div>
                  <h4 className="font-medium text-red-800">Error memuat kategori</h4>
                  <p className="text-red-600 text-sm mt-1">{categoriesResult.error}</p>
                </div>
              </div>
            )}

            {categories.length > 0 ? (
              <CategoryManager
                categories={categories}
                influencerCategories={influencerWithCategories?.categories || []}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">📂</span>
                </div>
                <p className="text-gray-500 font-medium">Belum ada kategori tersedia</p>
                <p className="text-gray-400 text-sm mt-1">Kategori akan muncul setelah ditambahkan oleh admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TikTok */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className={`bg-gradient-to-r ${getPlatformColor("TikTok")} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {getPlatformIcon("TikTok")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Hubungkan Akun TikTok</h3>
                    <p className="text-pink-100 text-sm">Platform video pendek</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <TikTokData connections={tiktokConnections || []} />
            </div>
          </div>

          {/* YouTube */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className={`bg-gradient-to-r ${getPlatformColor("YouTube")} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {getPlatformIcon("YouTube")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Hubungkan Akun YouTube</h3>
                    <p className="text-red-100 text-sm">Platform video streaming</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {youtubeConnection && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <YouTubeConnectionButton
                  isConnected={!!youtubeConnection}
                  username={youtubeConnection?.username}
                  lastSynced={youtubeConnection?.lastSynced || null}
                />
              </div>
              {youtubeConnection && (
                <YouTubeData connection={youtubeConnection} />
              )}
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className={`bg-gradient-to-r ${getPlatformColor("Instagram")} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {getPlatformIcon("Instagram")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Hubungkan Akun Instagram</h3>
                    <p className="text-purple-100 text-sm">Platform foto dan story</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {instagramConnection && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <InstagramConnectButton
                isConnected={!!instagramConnection}
                username={instagramConnection?.username}
                lastSynced={instagramConnection?.lastSynced || null}
              />

              {instagramConnection && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">✅ Terhubung</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">@{instagramConnection.username}</span>
                  </div>
                  {instagramConnection.lastSynced && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="text-gray-500">{new Date(instagramConnection.lastSynced).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Facebook */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className={`bg-gradient-to-r ${getPlatformColor("Facebook")} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {getPlatformIcon("Facebook")}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Hubungkan Akun Facebook</h3>
                    <p className="text-blue-100 text-sm">Platform media sosial</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {facebookConnection && (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {facebookConnection ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-green-600 mt-0.5">✅</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">Terhubung sebagai</h4>
                        <p className="text-green-700 font-semibold">@{facebookConnection.username}</p>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-green-600">Followers:</span>
                            <p className="font-medium text-green-800">{facebookConnection.followers?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-green-600">Last Sync:</span>
                            <p className="font-medium text-green-800">
                              {facebookConnection.lastSynced
                                ? new Date(facebookConnection.lastSynced).toLocaleDateString()
                                : 'Belum pernah'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <form action={syncFacebookData} className="flex-1">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        🔄 Sinkronisasi Data
                      </button>
                    </form>
                    <form action={disconnectFacebook}>
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        🔌 Putuskan Koneksi
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <p className="text-gray-500 font-medium mb-4">Belum terhubung dengan Facebook</p>
                  <FacebookConnectButton />
                </div>
              )}
            </div>
          </div>
        </div>


        {/*         {connectedPlatforms.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📊</span>
              Ringkasan Platform
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {connectedPlatforms.map((platform) => (
                <div key={platform.name} className="text-center p-4 rounded-xl bg-gray-50">
                  <div className="flex justify-center mb-2 text-gray-600">
                    {getPlatformIcon(platform.name)}
                  </div>
                  <p className="font-medium text-gray-900">{platform.name}</p>
                  <p className="text-sm text-gray-500">
                    {platform.connection?.followers 
                      ? `${platform.connection.followers.toLocaleString()} followers`
                      : 'Terhubung'
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
          */}

      </div>
    </div>
  );
};

export default InfluencerPlatformPage;