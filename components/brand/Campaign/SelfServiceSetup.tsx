"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useCampaignAppStore, { SelectedInfluencer } from "@/storeCampaign";
import { getAllInfluencer } from "@/lib/influencer.actions";
import { BadgeCheck, User, Users, Tag } from "lucide-react";
import { FaInstagram, FaYoutube, FaTiktok, FaTwitter, FaFacebook } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


const SelfServiceSetup = () => {
  const { data: session } = useSession();
  const { setSelfServiceCampaignData } = useCampaignAppStore();
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);

  // State untuk fitur pencarian dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Daftar platform yang tersedia untuk filter
  const platformOptions = [
    { value: 'instagram', label: 'Instagram', icon: <FaInstagram /> },
    { value: 'facebook', label: 'Facebook', icon: <FaFacebook /> },
    { value: 'youtube', label: 'YouTube', icon: <FaYoutube /> },
    { value: 'tiktok', label: 'TikTok', icon: <FaTiktok /> },
    { value: 'twitter', label: 'Twitter/X', icon: <FaTwitter /> },
  ];

  // Mendapatkan unique categories dari semua influencer
  const availableCategories = Array.from(
    new Set(
      influencers.flatMap(influencer =>
        influencer.categories?.map((c: any) => c.name) || []
      )
    )
  ).sort();

  const getDisplayName = (influencer: any) => {
    // Prioritas nama dari session jika current user
    const currentUserEmail = session?.user?.email;
    const isCurrentUser = influencer.user?.email === currentUserEmail;

    if (isCurrentUser && session?.user?.name) {
      return session.user.name;
    }

    return influencer.user?.name || 'Nama tidak tersedia';
  };

  // Fungsi untuk memfilter influencer berdasarkan pencarian, platform, dan kategori
  const filteredInfluencers = influencers.filter(influencer => {
    // Filter berdasarkan pencarian nama
    const nameMatch = getDisplayName(influencer)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Filter berdasarkan platform
    let platformMatch = true;
    if (selectedPlatforms.length > 0) {
      const influencerPlatforms = influencer.platforms?.map((p: any) =>
        p.name.toLowerCase()
      ) || [];

      platformMatch = selectedPlatforms.some(platform =>
        influencerPlatforms.some((ip: string) => ip.includes(platform))
      );
    }

    // Filter berdasarkan kategori
    let categoryMatch = true;
    if (selectedCategories.length > 0) {
      const influencerCategories = influencer.categories?.map((c: any) => c.name) || [];
      categoryMatch = selectedCategories.some(category =>
        influencerCategories.includes(category)
      );
    }

    return nameMatch && platformMatch && categoryMatch;
  });

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const result = await getAllInfluencer();
        console.log(result, 'data semua influencer');

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setInfluencers(result.data);
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat data influencer");
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencers();
  }, []);

  // Update store dengan influencer yang dipilih
  useEffect(() => {
    const selectedData: SelectedInfluencer[] = influencers
      .filter(inf => selectedInfluencers.includes(inf.id))
      .map(inf => ({
        influencerId: inf.id,
        influencerName: inf.user?.name || 'Unknown',
        image: inf.user?.image || null,
        username: inf.platforms?.[0]?.username || '',
        followers: inf.platforms?.[0]?.followers || '0',
        categories: inf.categories?.map((c: any) => c.name) || [],
        platforms: inf.platforms?.map((p: any) => ({
          name: p.name,
          username: p.username,
          followers: p.followers,
        })) || [],
      }));


    setSelfServiceCampaignData({
      selectedInfluencers: selectedData, // ✅ Simpan langsung ke state
      formData: {
        selfService: {
          selectedInfluencers: selectedData, // ✅ Juga isi untuk formData jika diperlukan
        },
      },
    } as any);
  }, [selectedInfluencers, influencers, setSelfServiceCampaignData]);

  const handleSelectInfluencer = (influencerId: string) => {
    setSelectedInfluencers((prev) => {
      const newValue = prev.includes(influencerId)
        ? prev.filter((id) => id !== influencerId)
        : [...prev, influencerId];

      console.log("🟢 selectedInfluencer IDs:", newValue); // Log ID yang dipilih user
      return newValue;
    });
  };

  const getPlatformIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('instagram')) return <FaInstagram className="h-4 w-4" />;
    if (name.includes('facebook')) return <FaFacebook className="h-4 w-4" />;
    if (name.includes('youtube')) return <FaYoutube className="h-4 w-4" />;
    if (name.includes('tiktok')) return <FaTiktok className="h-4 w-4" />;
    if (name.includes('twitter') || name.includes('x')) return <FaTwitter className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getAvatarUrl = (influencer: any) => {
    // Prioritas 1: Cek session auth untuk current user
    const currentUserEmail = session?.user?.email;
    const isCurrentUser = influencer.user?.email === currentUserEmail;

    if (isCurrentUser && session?.user?.image) {
      return session.user.image;
    }

    // Prioritas 2: Avatar dari user data influencer
    if (influencer.user?.image) {
      return influencer.user.image;
    }

    // Prioritas 3: Avatar dari platform data
    const platformWithAvatar = influencer.platforms?.find((p: any) => p.avatarUrl);
    if (platformWithAvatar?.avatarUrl) {
      return platformWithAvatar.avatarUrl;
    }

    // Default placeholder
    return "https://ui-avatars.com/api/?name=User&background=e5e7eb&color=6b7280&size=100";
  };



  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://ui-avatars.com/api/?name=User&background=e5e7eb&color=6b7280&size=100";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        {selectedInfluencers.length > 0 && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <BadgeCheck className="h-4 w-4 mr-1" />
            {selectedInfluencers.length} Influencer Terpilih
          </span>
        )}
      </div>

      {/* Fitur Pencarian dan Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Influencer
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Platform
            </label>
            <div className="flex flex-wrap gap-3">
              {platformOptions.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => {
                    setSelectedPlatforms(prev =>
                      prev.includes(platform.value)
                        ? prev.filter(p => p !== platform.value)
                        : [...prev, platform.value]
                    );
                  }}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${selectedPlatforms.includes(platform.value)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span className="mr-1.5 text-base">{platform.icon}</span>
                  {platform.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="inline h-4 w-4 mr-1" />
            Filter Kategori
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategories(prev =>
                    prev.includes(category)
                      ? prev.filter(c => c !== category)
                      : [...prev, category]
                  );
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedCategories.includes(category)
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
            {availableCategories.length === 0 && (
              <span className="text-gray-500 text-sm">Tidak ada kategori tersedia</span>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
          <span>Menampilkan {filteredInfluencers.length} dari {influencers.length} influencer</span>
          {selectedPlatforms.length > 0 && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
              Platform: {selectedPlatforms.length} dipilih
            </span>
          )}
          {selectedCategories.length > 0 && (
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
              Kategori: {selectedCategories.length} dipilih
            </span>
          )}
        </div>

        {/* Reset Filters */}
        {(searchQuery || selectedPlatforms.length > 0 || selectedCategories.length > 0) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatforms([]);
                setSelectedCategories([]);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Reset semua filter
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Bagian Data Influencer */}
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && influencers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500">Tidak ada influencer yang tersedia</p>
          </div>
        )}

        {!loading && filteredInfluencers.length === 0 && influencers.length > 0 && (
          <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500">Tidak ada influencer yang sesuai dengan filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatforms([]);
                setSelectedCategories([]);
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Reset filter
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => {
            const isCurrentUser = session?.user?.email === influencer.user?.email;
            const isSelected = selectedInfluencers.includes(influencer.id);

            return (
              <div
                key={influencer.id}
                className={`relative rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${isSelected
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'border border-gray-200 shadow-sm'
                  } ${isCurrentUser ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}`}
                onClick={() => handleSelectInfluencer(influencer.id)}
              >
                {/* Background Cover */}
                <div className={`h-24 ${isCurrentUser
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                  {isCurrentUser && (
                    <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full">
                      <span className="text-xs font-medium text-blue-600">You</span>
                    </div>
                  )}

                  {/* Badge centang untuk yang terpilih */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white p-1 rounded-full">
                      <BadgeCheck className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative -mt-12 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                    <Image
                      src={getAvatarUrl(influencer)}
                      alt={getDisplayName(influencer)}
                      className="h-full w-full object-cover"
                      onError={handleImageError}
                      loading="lazy"
                      width={500}
                      height={500}
                    />
                    {isCurrentUser && (
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">
                      {getDisplayName(influencer)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {influencer.user?.email}
                    </p>
                  </div>

                  {/* Kategori */}
                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {influencer.categories?.map((c: any) => (
                      <span
                        key={c.id}
                        className={`text-xs px-2 py-1 rounded-full ${selectedCategories.includes(c.name)
                          ? 'bg-purple-100 text-purple-700 border border-purple-300'
                          : 'bg-blue-50 text-blue-700'
                          }`}
                      >
                        {c.name}
                      </span>
                    ))}
                    {(!influencer.categories || influencer.categories.length === 0) && (
                      <span className="text-gray-400 text-xs">Tidak ada kategori</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Platform</p>
                      <p className="font-semibold">{influencer.platforms?.length || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Total Followers</p>
                      <p className="font-semibold">
                        {influencer.platforms
                          ?.reduce((sum: number, p: any) => sum + (parseInt(p.followers) || 0), 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-semibold border-b pb-1">Social Media:</h4>
                    <div className="space-y-2">
                      {influencer.platforms?.map((p: any) => (
                        <div
                          key={p.id}
                          className="flex flex-col md:flex-row md:items-center gap-2 text-sm bg-gray-50 p-2 rounded-md"
                        >
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getPlatformIcon(p.name)}
                            <span className="font-medium text-nowrap md:hidden">{p.name}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-gray-600 text-xs truncate block" title={`@${p.username}`}>
                              @{p.username}
                            </span>
                          </div>

                          <div className="md:ml-auto">
                            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                              {parseInt(p.followers).toLocaleString()} followers
                            </span>
                          </div>
                        </div>
                      ))}
                      {(!influencer.platforms || influencer.platforms.length === 0) && (
                        <p className="text-gray-400 text-xs text-center py-2">Tidak ada platform</p>
                      )}
                    </div>
                  </div>

                  {/* Selection button */}
                  <button
                    className={`mt-4 w-full py-2 px-4 rounded-md transition-colors ${isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    {isSelected ? 'Terpilih' : 'Pilih Influencer'}
                  </button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="block mt-2 text-center text-sm text-blue-600 hover:underline w-full">
                        Lihat selengkapnya
                      </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detail Influencer</DialogTitle>
                      </DialogHeader>

                      {/* Konten detail influencer di sini */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Image
                            src={getAvatarUrl(influencer)}
                            alt={getDisplayName(influencer)}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-lg">{getDisplayName(influencer)}</p>
                            <p className="text-sm text-gray-500">{influencer.user?.email}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Kategori:</h4>
                          <div className="flex flex-wrap gap-2">
                            {influencer.categories?.map((c: any) => (
                              <span
                                key={c.id}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Platform:</h4>
                          <ul className="space-y-2">
                            {influencer.platforms?.map((p: any) => (
                              <li
                                key={p.id}
                                className="bg-gray-50 p-3 rounded-md text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center"
                              >
                                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                  {getPlatformIcon(p.name)}
                                  <span className="font-medium">{p.name}</span>
                                  <span className="text-xs text-gray-500">@{p.username}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                  <span className="bg-white border px-2 py-0.5 rounded-full">
                                    {parseInt(p.followers).toLocaleString()} followers
                                  </span>
                                  <span className="bg-white border px-2 py-0.5 rounded-full">
                                    {p.posts ?? 0} posts
                                  </span>
                                  <span className="bg-white border px-2 py-0.5 rounded-full">
                                    ER: {(p.engagementRate ?? 0).toFixed(2)}%
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>

                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelfServiceSetup;