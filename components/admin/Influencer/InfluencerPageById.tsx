'use client';
import { useEffect, useState } from 'react';
import {
  getInfluencerPlatformData,
  getInfluencerActiveCampaigns,
  getInfluencerCampaignMetrics
} from "@/lib/influencer.actions"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity, ArrowLeft, Award, BarChart3, Calendar,
  Globe, Heart, Loader2, Mail,
  MapPin, Phone, Share2, Star,
  TrendingUp, User, Users, Clock, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';
import Image from 'next/image';

// Enhanced interfaces
interface Platform {
  id: string;
  username: string;
  followers: number | null;
  posts: number | null;
  engagementRate: number | null;
  likesCount: number | null;
  commentsCount: number | null;
  sharesCount: number | null;
  savesCount: number | null;
  views: number | null;
  platform: {
    id: string;
    name: string;
  };
}

interface ActiveCampaign {
  id: string;
  status: string;
  invitedAt: Date;
  respondedAt: Date | null;
  responseMessage: string | null;
  campaign: {
    id: string;
    name: string;
    goal: string | null;
    status: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  brand: {
    id: string;
    name: string;
    user: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
}

interface CampaignMetric {
  id: string;
  followers: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number | null;
  engagementRate: number;
  metricType: string;
  recordedAt: Date;
  influencerPlatform: {
    username: string;
    platform: {
      name: string;
    };
  };
}

interface Props {
  id: string;
}

// Mock data - consider moving to a separate file or API
const MOCK_INFLUENCER_DATA = {
  id: "inf_001",
  name: "Sarah Michelle",
  username: "@sarahmichelle",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b739?w=400&h=400&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop",
  category: "Lifestyle & Fashion",
  tier: "Mega Influencer",
  location: "Jakarta, Indonesia",
  bio: "Fashion enthusiast, lifestyle blogger, and content creator. Sharing daily inspiration and authentic moments. Collaboration inquiries welcome! ✨",
  joinDate: "2020-03-15",
  isVerified: true,
  rating: 4.8,
  totalReviews: 127,
  socialMedia: {
    instagram: {
      followers: 2500000,
      following: 850,
      posts: 1247,
      engagement: 8.5,
      avgLikes: 125000,
      avgComments: 3200
    },
    youtube: {
      subscribers: 850000,
      videos: 245,
      views: 15600000,
      engagement: 6.8
    },
    tiktok: {
      followers: 1800000,
      following: 425,
      likes: 25600000,
      engagement: 12.3
    }
  },
  metrics: {
    reachRate: 92,
    engagementRate: 8.5,
    responseRate: 95,
    completionRate: 98,
    onTimeDelivery: 96
  },
  recentCampaigns: [
    {
      id: "camp_001",
      brand: "Nike Indonesia",
      campaign: "Summer Collection 2024",
      status: "Completed",
      reach: 850000,
      engagement: 9.2,
      completedAt: "2024-06-15"
    },
    {
      id: "camp_002",
      brand: "Sephora",
      campaign: "Beauty Week Special",
      status: "Completed",
      reach: 720000,
      engagement: 7.8,
      completedAt: "2024-05-28"
    },
    {
      id: "camp_003",
      brand: "Starbucks",
      campaign: "New Menu Launch",
      status: "Active",
      reach: 650000,
      engagement: 8.9,
      completedAt: null
    }
  ],
  pricing: {
    instagramPost: 15000000,
    instagramStory: 8000000,
    youtubeVideo: 25000000,
    tiktokVideo: 12000000,
    packageDeal: 45000000
  },
  contact: {
    email: "sarah.michelle@email.com",
    phone: "+62 812-3456-7890",
    manager: "Tidak ada",
    agency: "Tidak Ada"
  },
  specialties: ["Fashion", "Beauty", "Lifestyle", "Travel", "Food & Beverage"],
  languages: ["Bahasa Indonesia", "English", "Mandarin"],
  audienceDemographics: {
    ageGroups: [
      { range: "18-24", percentage: 35 },
      { range: "25-34", percentage: 42 },
      { range: "35-44", percentage: 18 },
      { range: "45+", percentage: 5 }
    ],
    gender: {
      female: 78,
      male: 22
    },
    topCities: [
      { city: "Jakarta", percentage: 28 },
      { city: "Surabaya", percentage: 15 },
      { city: "Bandung", percentage: 12 },
      { city: "Medan", percentage: 8 },
      { city: "Others", percentage: 37 }
    ]
  }
};

const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'Mega Influencer':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Macro Influencer':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Micro Influencer':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function InfluencerPageById({ id }: Props) {
  const [influencer, setInfluencer] = useState<any>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  const [selectedCampaignMetrics, setSelectedCampaignMetrics] = useState<CampaignMetric[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [isFollowing, ] = useState(false);

  const router = useRouter();

  const formatNumber = (num: number | null): string => {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'instagram':
        return <FaInstagram className="w-5 h-5" />;
      case 'youtube':
        return <FaYoutube className="w-5 h-5" />;
      case 'tiktok':
        return <FaTiktok className="w-5 h-5" />;
      case 'facebook':
        return <FaFacebook className="w-5 h-5" />;
      case 'twitter':
        return <FaTwitter className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  // Fetch influencer data and platforms
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [platformResponse, campaignsResponse] = await Promise.all([
          getInfluencerPlatformData(id),
          getInfluencerActiveCampaigns(id)
        ]);

        if (platformResponse.error) {
          setError(platformResponse.message);
          return;
        }

        if (!platformResponse.data) {
          setError('Data influencer tidak ditemukan');
          return;
        }

        setInfluencer(platformResponse.data.user);
        setPlatforms(platformResponse.data.platforms || []);
        setCategories(platformResponse.data.categories || []);

        if (campaignsResponse.success && campaignsResponse.data) {
          setActiveCampaigns(campaignsResponse.data);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Fetch campaign metrics when campaign is selected
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedCampaign || !id) return;

      try {
        setMetricsLoading(true);
        const response = await getInfluencerCampaignMetrics(id, selectedCampaign);

        if (response.success && response.data) {
          setSelectedCampaignMetrics(response.data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedCampaign, id]);

  // Calculate total followers across platforms
  const totalFollowers = platforms.reduce((total, platform) => {
    return total + (platform.followers || 0);
  }, 0);

  // Calculate average engagement rate
  const averageEngagement = platforms.length > 0
    ? platforms.reduce((total, platform) => total + (platform.engagementRate || 0), 0) / platforms.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat data influencer...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Data influencer tidak tersedia</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" size="sm" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Influencer
          </Button>
        </div>

        {/* Header Profile */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-8 overflow-hidden">
          {/* Hero Background */}
          <div
            className="h-48 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 relative"
            style={{
              backgroundImage: influencer.image ? `url(${influencer.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <CardContent className="relative">
            <div className="flex flex-col lg:flex-row gap-6 -mt-16 relative z-10">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Image
                  src={influencer.image || MOCK_INFLUENCER_DATA.avatar}
                  alt={influencer.name || MOCK_INFLUENCER_DATA.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  width={1000}
                  height={1000}
                />
              </div>

              {/* Details */}
              <div className="flex-1 pt-16 lg:pt-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="bg-white text-gray-900 text-2xl font-semibold px-4 py-1 rounded shadow-sm">
                        {influencer.name}
                      </span>

                      {MOCK_INFLUENCER_DATA.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{MOCK_INFLUENCER_DATA.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Bergabung {influencer.emailVerified ? formatDate(influencer.emailVerified.toString()) : 'Belum Bergabung'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{MOCK_INFLUENCER_DATA.rating}/5 ({MOCK_INFLUENCER_DATA.totalReviews} reviews)</span>
                      </div>
                    </div>

                    <Badge className={`${getTierColor(MOCK_INFLUENCER_DATA.tier)} mb-4`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {MOCK_INFLUENCER_DATA.tier}
                    </Badge>

                    <p className="text-gray-700 max-w-2xl">{MOCK_INFLUENCER_DATA.bio}</p>
                  </div>

                  {/* Right Actions */}
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={() =>
                        (!isFollowing)}
                      className={isFollowing ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-blue-600 hover:bg-blue-700"}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>

                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>

                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

{/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Total Followers</p>
                  <p className="text-3xl font-bold">{formatNumber(totalFollowers)}</p>
                </div>
                <Users className="w-12 h-12 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Avg Engagement</p>
                  <p className="text-3xl font-bold">{averageEngagement.toFixed(1)}%</p>
                </div>
                <Heart className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Campaigns Aktif</p>
                  <p className="text-3xl font-bold">
                    {activeCampaigns.filter(c => c.campaign.status === 'ACTIVE').length}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Campaign Selesai</p>
                  <p className="text-3xl font-bold">{activeCampaigns.filter(c => c.campaign.status === 'COMPLETED').length}</p>
                </div>
                <Globe className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'platforms', label: 'Platforms', icon: Globe },
                { id: 'campaigns', label: 'Active Campaigns', icon: BarChart3 },
                { id: 'metrics', label: 'Campaign Metrics', icon: TrendingUp }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'platforms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Card key={platform.id} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {getPlatformIcon(platform.platform.name)}
                    <span>{platform.platform.name}</span>
                    {/**
                                        {platform.isVerified && (
                                            <Badge className="bg-blue-100 text-blue-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                             */}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>@{platform.username}</span>
                    {/**
                                        {platform.profileUrl && (
                                            <a
                                                href={platform.profileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                             */}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(platform.followers)}
                      </p>
                      <p className="text-sm text-gray-600">Followers</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {platform.engagementRate?.toFixed(1) || '0'}%
                      </p>
                      <p className="text-sm text-gray-600">Engagement</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(platform.posts)}
                      </p>
                      <p className="text-sm text-gray-600">Posts</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(platform.views)}
                      </p>
                      <p className="text-sm text-gray-600">Views</p>
                    </div>
                  </div>

                  {/* Additional metrics */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Likes:</span>
                        <span className="font-medium">{formatNumber(platform.likesCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comments:</span>
                        <span className="font-medium">{formatNumber(platform.commentsCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shares:</span>
                        <span className="font-medium">{formatNumber(platform.sharesCount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saves:</span>
                        <span className="font-medium">{formatNumber(platform.savesCount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Active & Recent Campaigns ({activeCampaigns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Belum ada campaign yang diikuti</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCampaigns.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="border rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedCampaign(invitation.campaign.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg">{invitation.campaign.name}</h3>
                            <Badge className={getStatusColor(invitation.campaign.status)}>
                              {invitation.campaign.status}
                            </Badge>
                            {/**
                            <Badge className={getStatusColor(invitation.status)}>
                              {invitation.status}
                            </Badge>
                             */}
                          </div>

                          <p className="text-gray-600 mb-2">
                            Brand: {invitation.brand.name}
                          </p>

                          {invitation.campaign.goal && (
                            <p className="text-gray-600 mb-3">
                              Tujuan Campaign: {invitation.campaign.goal}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(invitation.campaign.startDate)} - {formatDate(invitation.campaign.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                Invited: {formatDate(invitation.invitedAt)}
                              </span>
                            </div>
                            {invitation.respondedAt && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>
                                  Responded: {formatDate(invitation.respondedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                            {/** non-active message 
                          {invitation.responseMessage && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Response:</strong> {invitation.responseMessage}
                              </p>
                            </div>
                          )}
                            */}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCampaign(invitation.campaign.id);
                              setActiveTab('metrics');
                            }}
                          >
                            View Metrics
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Campaign Selection */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Pilih Campaign untuk Lihat Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCampaigns.map((invitation) => (
                    <Button
                      key={invitation.campaign.id}
                      variant={selectedCampaign === invitation.campaign.id ? "default" : "outline"}
                      onClick={() => setSelectedCampaign(invitation.campaign.id)}
                      className="h-auto p-4 text-left justify-start"
                    >
                      <div>
                        <div className="font-medium">{invitation.campaign.name}</div>
                        <div className="text-sm opacity-70">{invitation.brand.name}</div>
                        <Badge className={`${getStatusColor(invitation.campaign.status)} mt-1`}>
                          {invitation.campaign.status}
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metrics Result */}
            {metricsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Memuat metrics campaign...</p>
              </div>
            ) : selectedCampaign && selectedCampaignMetrics.length > 0 ? (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Metrics Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Tanggal</th>
                          <th className="px-4 py-2 text-right">Followers</th>
                          <th className="px-4 py-2 text-right">Likes</th>
                          <th className="px-4 py-2 text-right">Comments</th>
                          <th className="px-4 py-2 text-right">Shares</th>
                          <th className="px-4 py-2 text-right">Saves</th>
                          <th className="px-4 py-2 text-right">Views</th>
                          <th className="px-4 py-2 text-right">Engagement</th>
                          <th className="px-4 py-2 text-left">Platform</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCampaignMetrics.map((metric) => (
                          <tr key={metric.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{formatDate(metric.recordedAt)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(metric.followers)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(metric.likes)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(metric.comments)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(metric.shares)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(metric.saves)}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(metric.views)}</td>
                            <td className="px-4 py-2 text-right">{metric.engagementRate.toFixed(1)}%</td>
                            <td className="px-4 py-2 flex items-center gap-2">
                              {getPlatformIcon(metric.influencerPlatform.platform.name)}
                              <span>@{metric.influencerPlatform.username}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : selectedCampaign ? (
              <Alert>
                <AlertDescription>
                  Belum ada data metrics untuk campaign ini.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  Silakan pilih campaign untuk melihat metrics.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Metrics */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(MOCK_INFLUENCER_DATA.metrics).map(([key, value]) => (
                      <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{value}%</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Kategori
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {cat.category.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Informasi Kontak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{influencer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">No. Handphone</p>
                    <p className="font-medium">{MOCK_INFLUENCER_DATA.contact.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Manager</p>
                    <p className="font-medium">{MOCK_INFLUENCER_DATA.contact.manager}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Agency</p>
                    <p className="font-medium">{MOCK_INFLUENCER_DATA.contact.agency}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Bahasa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {MOCK_INFLUENCER_DATA.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="w-full justify-center py-2">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}
