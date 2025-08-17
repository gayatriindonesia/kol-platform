import React from 'react';
import { getCampaignInfluencersById, getCampaignMetrics } from '@/lib/campaign.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  MessageSquare, 
  Heart,
  AlertCircle,
  Activity,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';

// Corrected Types that match the database response
interface Platform {
  id: string;
  platform: {
    id: string;
    name: string;
  };
  username: string;
  followers: number;
  posts: number;
  engagementRate: number | null;
  views?: number;
  likesCount?: number | null;
  commentsCount?: number | null;
  sharesCount?: number | null;
  savesCount?: number | null;
  averageLikes?: number;
  averageComments?: number;
  isVerified?: boolean;
  metrics?: PlatformMetric[];
}

interface PlatformMetric {
  id: string;
  followers: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views?: number;
  engagementRate: number;
  avgLikesPerPost?: number | null;
  avgCommentsPerPost?: number | null;
  metricType: 'CAMPAIGN_START' | 'CAMPAIGN_END' | 'PERIODIC' | 'MANUAL';
  recordedAt: string;
  dataSource?: string | null;
}

interface InfluencerData {
  invitationId: string;
  influencerId: string;
  influencer: {
    id: string;
    name?: string | null;
    image?: string | null;
    platforms: Platform[];
  };
  invitationStatus: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  invitedAt: string;
  respondedAt?: string;
}

interface CampaignInfo {
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  endDate: string;
}

interface CampaignInfluencersResponse {
  success: boolean;
  data?: InfluencerData[];
  campaign?: CampaignInfo;
  message?: string;
}

interface CampaignMetricsResponse {
  success: boolean;
  data?: any[];
  dataType?: 'live' | 'snapshot';
  message?: string;
}

interface CampaignListInfluencerProps {
  campaignId: string;
}

// Utility Components
const PlatformIcon = ({ platformName }: { platformName: string }) => {
  const iconSize = 16;
  
  switch (platformName.toLowerCase()) {
    case 'instagram':
      return <FaInstagram size={iconSize} className="text-pink-600" />;
    case 'youtube':
      return <FaYoutube size={iconSize} className="text-red-600" />;
    case 'twitter':
    case 'x':
      return <FaTwitter size={iconSize} className="text-blue-500" />;
    case 'facebook':
      return <FaFacebook size={iconSize} className="text-blue-700" />;
    case 'tiktok':
      return <FaTiktok size={iconSize} className="text-black" />;
    default:
      return <MessageSquare size={iconSize} className="text-gray-500" />;
  }
};

const CampaignStatusBadge = ({ status, dataType }: { status: string; dataType?: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          variant: 'default' as const,
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <PlayCircle className="w-3 h-3" />,
          label: 'Active Campaign'
        };
      case 'COMPLETED':
        return {
          variant: 'secondary' as const,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <CheckCircle className="w-3 h-3" />,
          label: dataType === 'snapshot' ? 'Data Akhir' : 'Completed'
        };
      case 'PENDING':
        return {
          variant: 'outline' as const,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <PauseCircle className="w-3 h-3" />,
          label: 'Paused'
        };
      default:
        return {
          variant: 'outline' as const,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="w-3 h-3" />,
          label: 'Draft'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge className={`${config.color} flex items-center gap-1 font-medium`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const MetricsGrowthIndicator = ({ 
  current, 
  previous, 
  label, 
  format = 'number' 
}: { 
  current: number; 
  previous?: number; 
  label: string;
  format?: 'number' | 'percentage';
}) => {
  if (!previous) {
    return (
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">
          {format === 'percentage' ? `${current.toFixed(1)}%` : current.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    );
  }

  const growth = current - previous;
  const growthPercent = previous > 0 ? (growth / previous) * 100 : 0;
  const isPositive = growth > 0;

  return (
    <div className="text-center">
      <p className="text-lg font-bold text-gray-900">
        {format === 'percentage' ? `${current.toFixed(1)}%` : current.toLocaleString()}
      </p>
      <div className={`flex items-center justify-center gap-1 text-xs ${
        isPositive ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-500'
      }`}>
        <TrendingUp className={`w-3 h-3 ${!isPositive && growth < 0 ? 'rotate-180' : ''}`} />
        <span>
          {isPositive ? '+' : ''}{growthPercent.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

const InfluencerCard = ({ 
  influencer, 
  campaignStatus, 
  dataType 
}: { 
  influencer: InfluencerData; 
  campaignStatus: string;
  dataType?: string;
}) => {
  const primaryPlatform = influencer.influencer.platforms?.[0];
  console.log(primaryPlatform, "primary Platform")
  // const totalFollowers = influencer.influencer.platforms?.reduce((sum, platform) => sum + platform.followers, 0) || 0;
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const generateAvatarUrl = (name: string | null | undefined, image?: string | null) => {
    if (image) return image;
    if (!name) return 'https://ui-avatars.com/api/?name=User&background=random&size=128';
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=128`;
  };

  const getLatestMetrics = (platform: Platform) => {
    if (!platform.metrics || platform.metrics.length === 0) return null;
    
    const sorted = [...platform.metrics].sort((a, b) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
    return sorted[0];
  };

  const getStartMetrics = (platform: Platform) => {
    if (!platform.metrics || platform.metrics.length === 0) return null;
    
    const startMetric = platform.metrics.find(m => m.metricType === 'CAMPAIGN_START');
    if (startMetric) return startMetric;
    
    const sorted = [...platform.metrics].sort((a, b) => 
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
    return sorted[0];
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Image
              src={generateAvatarUrl(influencer.influencer.name, influencer.influencer.image)}
              alt={`${influencer.influencer.name || 'User'} avatar`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors duration-200"
              width={64}
              height={64}
            />
            {primaryPlatform?.isVerified && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {influencer.influencer.name || 'Unknown User'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={influencer.invitationStatus === 'ACTIVE' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {influencer.invitationStatus}
                  </Badge>
                  {dataType && (
                    <Badge variant="outline" className="text-xs">
                      {dataType === 'live' ? 'Live Data' : 'Data Terakhir'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Platform Info */}
            {primaryPlatform && (
              <div className="flex items-center gap-2 mt-2">
                <PlatformIcon platformName={primaryPlatform.platform.name} />
                <span className="text-sm font-medium text-gray-700">
                  @{primaryPlatform.username || 'N/A'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Overview - Show current vs start if available */}
        {primaryPlatform && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performa Kinerja
            </h4>
            
            {(() => {
              const latestMetrics = getLatestMetrics(primaryPlatform);
              const startMetrics = getStartMetrics(primaryPlatform);
              
              if (!latestMetrics) {
                return (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Activity className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No metrics data available</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <MetricsGrowthIndicator
                      current={latestMetrics.followers}
                      previous={startMetrics?.followers}
                      label="Followers"
                      format="number"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                    <MetricsGrowthIndicator
                      current={latestMetrics.engagementRate}
                      previous={startMetrics?.engagementRate}
                      label="Engagement"
                      format="percentage"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-3 border border-pink-100">
                    <MetricsGrowthIndicator
                      current={latestMetrics.likes}
                      previous={startMetrics?.likes}
                      label="Total Likes"
                      format="number"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-100">
                    <MetricsGrowthIndicator
                      current={latestMetrics.comments}
                      previous={startMetrics?.comments}
                      label="Total Comments"
                      format="number"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Platform Details */}
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            Platform Details ({influencer.influencer.platforms?.length || 0})
            {campaignStatus === 'COMPLETED' && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                Data Akhir
              </Badge>
            )}
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {influencer.influencer.platforms?.map((platform, index) => {
              const latestMetrics = getLatestMetrics(platform);
              const startMetrics = getStartMetrics(platform);
              
              return (
                <div 
                  key={platform.id || index}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platformName={platform.platform.name} />
                      <span className="font-medium text-gray-900 text-sm">
                        {platform.platform.name}
                      </span>
                      {platform.isVerified && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      @{platform.username || 'N/A'}
                    </span>
                  </div>

                  {/* Current Platform Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-500 block">Followers</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(platform.followers)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Posts</span>
                      <span className="font-medium text-gray-900">
                        {platform.posts.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Engagement</span>
                      <span className="font-medium text-gray-900">
                        {platform.engagementRate?.toFixed(1) || '0'}%
                      </span>
                    </div>
                  </div>

                  {/* Growth Indicators */}
                  {latestMetrics && startMetrics && (
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Peningkatan Campaign:</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span className={`font-medium ${
                              latestMetrics.followers - startMetrics.followers > 0 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {latestMetrics.followers - startMetrics.followers > 0 ? '+' : ''}
                              {(latestMetrics.followers - startMetrics.followers).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            <span className={`font-medium ${
                              latestMetrics.likes - startMetrics.likes > 0 
                                ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {latestMetrics.likes - startMetrics.likes > 0 ? '+' : ''}
                              {formatNumber(latestMetrics.likes - startMetrics.likes)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) || (
              <div className="text-center py-4">
                <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No platform data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            href={`/brand/influencer/${influencer.influencerId}`} 
            className="flex-1"
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full group hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-2 group-hover:text-blue-600" />
              Lihat Detail Influencer
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default async function CampaignListInfluencer({ campaignId }: CampaignListInfluencerProps) {
  try {
    // Fetch influencers with metrics
    const influencersResult: CampaignInfluencersResponse = await getCampaignInfluencersById(
      campaignId, 
      true // include metrics
    );
    console.log("Influencer RES: ", influencersResult)
    
    // Fetch campaign metrics info
    const metricsResult: CampaignMetricsResponse = await getCampaignMetrics(campaignId);
    console.log("Data metric last: ", metricsResult)

    if (!influencersResult.success) {
      return (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {influencersResult.message || 'Failed to load influencers for this campaign.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    if (!influencersResult.data || influencersResult.data.length === 0) {
      return (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Campaign Influencers</h2>
                <p className="text-sm text-gray-500 font-normal">Manage influencers for this campaign</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Influencers Selected</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              This campaign doesn&apos;t have any influencers assigned yet. Start by adding influencers to your campaign.
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Users className="w-4 h-4 mr-2" />
              Browse Influencers
            </Button>
          </CardContent>
        </Card>
      );
    }

    const influencers = influencersResult.data;
    const campaign = influencersResult.campaign;
    const totalInfluencers = influencers.length;
    const acceptedInfluencers = influencers.filter(inf => inf.invitationStatus === 'ACTIVE').length;

    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Campaign Influencers</h2>
                <p className="text-sm text-gray-500 font-normal">
                  {acceptedInfluencers} of {totalInfluencers} influencers aktif
                </p>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {campaign && (
                <CampaignStatusBadge 
                  status={campaign.status} 
                  dataType={metricsResult?.dataType}
                />
              )}
              {metricsResult?.message && (
                <Alert className="p-3 max-w-xs">
                  <AlertDescription className="text-xs">
                    {metricsResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Campaign metrics summary */}
          {campaign && (
            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Ends: {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {metricsResult?.dataType === 'snapshot' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-600 font-medium">
                        Data Terakhir
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {influencers.map((influencer) => (
              <InfluencerCard 
                key={influencer.invitationId} 
                influencer={influencer}
                campaignStatus={campaign?.status || 'PENDING'}
                dataType={metricsResult?.dataType}
              />
            ))}
          </div>

          {/* Additional metrics summary */}
          {metricsResult?.success && metricsResult.data && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tinjauan Campaign</h3>
                <Link href={`/brand/campaign/${campaignId}/analytics`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Lihat Semua Analytics
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Influencers Aktif</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{acceptedInfluencers}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Data Points</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{metricsResult.data.length}</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Data Status</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {metricsResult.dataType || 'Unknown'}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600">Update Terakhir</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );

  } catch (error) {
    console.error('Error fetching campaign influencers:', error);
    
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              An unexpected error occurred while loading influencer data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
}