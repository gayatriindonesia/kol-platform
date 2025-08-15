'use client';
import { useEffect, useState } from 'react';
import { getInfluencerById } from '@/lib/influencer.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft, Award, BarChart3, Calendar, Camera, DollarSign, Eye, Globe, Heart, Instagram, Loader2, Mail, MapPin, MessageCircle, Phone, Share2, Star, Target, ThumbsUp, TrendingUp, User, Users, Youtube, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaInstagram } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Update interface berdasarkan struktur data yang sebenarnya
interface Influencer {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: string | null;
}

// Definisikan tipe response dari API
interface ApiResponse {
  data?: {
    user: Influencer;
    categories: any[];
  };
  error?: string;
  status: number;
}

interface Props {
  id: string;
}

const influencerData = {
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

  // Social Media Stats
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

  // Performance Metrics
  metrics: {
    reachRate: 92,
    engagementRate: 8.5,
    responseRate: 95,
    completionRate: 98,
    onTimeDelivery: 96
  },

  // Recent Campaigns
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

  // Pricing
  pricing: {
    instagramPost: 15000000,
    instagramStory: 8000000,
    youtubeVideo: 25000000,
    tiktokVideo: 12000000,
    packageDeal: 45000000
  },

  // Contact Info
  contact: {
    email: "sarah.michelle@email.com",
    phone: "+62 812-3456-7890",
    manager: "Tidak ada",
    agency: "Tidak Ada"
  },

  // Specialties
  specialties: ["Fashion", "Beauty", "Lifestyle", "Travel", "Food & Beverage"],

  // Languages
  languages: ["Bahasa Indonesia", "English", "Mandarin"],

  // Audience Demographics
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

export default function InfluencerDetailClient({ id }: Props) {
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  // Fetch influencer data
  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse = await getInfluencerById(id);
        console.log("detail page:", response)

        // Handle response berdasarkan struktur yang benar
        if (response.error) {
          setError(response.error);
          return;
        }

        if (!response.data || !response.data.user) {
          setError('Influencer tidak ditemukan');
          return;
        }

        setInfluencer(response.data.user);
        setCategories(response.data.categories || [])

      } catch (err) {
        console.error('Error fetching influencer:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInfluencer();
    }
  }, [id]);

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </Card>
      </div>
    );
  }

  // variable influencer this is table user
  console.log("detail data influencer:", influencer)

  // Success state
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
              backgroundImage: `url(${influencer.image})`,
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
                <img
                  src={influencer.image || influencerData.avatar}
                  alt={influencer.name || influencerData.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                />
              </div>

              {/* Detail */}
              <div className="flex-1 pt-16 lg:pt-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                  {/* Left Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-white text-gray-900 text-2xl font-semibold px-4 py-1 rounded shadow-sm">
                        {influencer.name}
                      </span>

                      {influencerData.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{influencerData.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Bergabung {influencer.emailVerified ? formatDate(influencer.emailVerified.toString()) : 'Belum Bergabung'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{influencerData.rating}/5 ({influencerData.totalReviews} reviews)</span>
                      </div>
                    </div>

                    <Badge className={`${getTierColor(influencerData.tier)} mb-4`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {influencerData.tier}
                    </Badge>

                    <p className="text-gray-700 max-w-2xl">{influencerData.bio}</p>
                  </div>

                  {/* Right Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsFollowing(!isFollowing)}
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


        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Total Followers</p>
                  <p className="text-3xl font-bold">
                    {formatNumber(influencerData.socialMedia.instagram.followers +
                      influencerData.socialMedia.youtube.subscribers +
                      influencerData.socialMedia.tiktok.followers)}
                  </p>
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
                  <p className="text-3xl font-bold">{influencerData.metrics.engagementRate}%</p>
                </div>
                <Heart className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completion Rate</p>
                  <p className="text-3xl font-bold">{influencerData.metrics.completionRate}%</p>
                </div>
                <Target className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Response Rate</p>
                  <p className="text-3xl font-bold">{influencerData.metrics.responseRate}%</p>
                </div>
                <Zap className="w-12 h-12 text-orange-200" />
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
                { id: 'social', label: 'Social Media', icon: FaInstagram },
                { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
                { id: 'pricing', label: 'Pricing', icon: DollarSign },
                { id: 'audience', label: 'Audience', icon: Users }
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
                    {Object.entries(influencerData.metrics).map(([key, value]) => (
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

              {/* Specialties */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Categories
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
                    Contact Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{influencer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{influencerData.contact.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Manager</p>
                    <p className="font-medium">{influencerData.contact.manager}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Agency</p>
                    <p className="font-medium">{influencerData.contact.agency}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Languages */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {influencerData.languages.map((language, index) => (
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

        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-6 h-6" />
                  Instagram
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-pink-100">Followers</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.instagram.followers)}</p>
                  </div>
                  <div>
                    <p className="text-pink-100">Posts</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.instagram.posts)}</p>
                  </div>
                  <div>
                    <p className="text-pink-100">Avg Likes</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.instagram.avgLikes)}</p>
                  </div>
                  <div>
                    <p className="text-pink-100">Engagement</p>
                    <p className="text-2xl font-bold">{influencerData.socialMedia.instagram.engagement}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* YouTube */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="w-6 h-6" />
                  YouTube
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-red-100">Subscribers</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.youtube.subscribers)}</p>
                  </div>
                  <div>
                    <p className="text-red-100">Videos</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.youtube.videos)}</p>
                  </div>
                  <div>
                    <p className="text-red-100">Total Views</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.youtube.views)}</p>
                  </div>
                  <div>
                    <p className="text-red-100">Engagement</p>
                    <p className="text-2xl font-bold">{influencerData.socialMedia.youtube.engagement}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TikTok */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-800 to-black text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  TikTok
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300">Followers</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.tiktok.followers)}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Following</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.tiktok.following)}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Total Likes</p>
                    <p className="text-2xl font-bold">{formatNumber(influencerData.socialMedia.tiktok.likes)}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Engagement</p>
                    <p className="text-2xl font-bold">{influencerData.socialMedia.tiktok.engagement}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recent Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {influencerData.recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{campaign.campaign}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">Brand: {campaign.brand}</p>
                        <div className="flex gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Reach: {formatNumber(campaign.reach)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Engagement: {campaign.engagement}%</span>
                          </div>
                          {campaign.completedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Completed: {formatDate(campaign.completedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'pricing' && (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(influencerData.pricing).map(([key, value]) => (
                  <div key={key} className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-lg mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(value)}</p>
                  </div>
                ))}
              </div>
              <Alert className="mt-6 border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  Harga dapat berubah tergantung pada kompleksitas campaign dan deliverables yang diminta.
                  Hubungi langsung untuk mendapatkan penawaran khusus.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {activeTab === 'audience' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Demographics */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {influencerData.audienceDemographics.ageGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{group.range} years</span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-blue-600">{group.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gender Demographics */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Gender Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Female</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${influencerData.audienceDemographics.gender.female}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-pink-600">{influencerData.audienceDemographics.gender.female}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Male</span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${influencerData.audienceDemographics.gender.male}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-blue-600">{influencerData.audienceDemographics.gender.male}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Cities */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Top Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {influencerData.audienceDemographics.topCities.map((city, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <span className="font-medium">{city.city}</span>
                      </div>
                      <span className="font-bold text-blue-600">{city.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons - Fixed at bottom */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mt-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Add to Wishlist
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}