"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { CampaignStatus, CampaignType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { getCampaignsByBrandForInfluencer, getInfluencerCampaignStatsByBrand, respondToCampaignInvitation } from '@/lib/campaign.actions';

// Updated Types to match actual data structure
interface CampaignData {
  id: string;
  name: string;
  goal: string | null;
  type: CampaignType;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  directData: Prisma.JsonValue;
  selfServiceData: Prisma.JsonValue;
}

interface BrandData {
  id: string;
  name: string;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

// This should match what your server action actually returns
export type InvitationWithCampaign = {
  invitationId: string;
  invitationStatus: CampaignStatus;
  invitedAt: Date;
  respondedAt: Date | null;
  responseMessage: string | null;
  campaign: CampaignData;
  brand: BrandData;
  isActive: boolean;
  isCompleted: boolean;
  daysRemaining: number | null;
  campaignDuration: number | null;
};

// Legacy Campaign interface for compatibility with existing CampaignCard component
interface Campaign {
  invitationId: string;
  invitationStatus: string;
  invitedAt: Date;
  respondedAt: Date | null;  
  responseMessage: string | null;
  campaign: {
    id: string;
    name: string;
    goal: string | null;
    type: string;
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
      email: string;
      image: string | null;
    };
  };
  isActive: boolean;
  isCompleted: boolean;
  daysRemaining: number | null;
  campaignDuration: number | null;
}

interface BrandStats {
  brand: {
    id: string;
    name: string;
    user: {
      name: string | null;
      image: string | null;
    } | undefined;
  };
  stats: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    rejected: number;
  };
}

// Helper function to convert InvitationWithCampaign to legacy Campaign format
const convertToLegacyCampaign = (invitation: InvitationWithCampaign): Campaign => ({
  invitationId: invitation.invitationId,
  invitationStatus: invitation.invitationStatus as string,
  invitedAt: invitation.invitedAt,
  respondedAt: invitation.respondedAt,
  responseMessage: invitation.responseMessage,
  campaign: {
    id: invitation.campaign.id,
    name: invitation.campaign.name,
    goal: invitation.campaign.goal,
    type: invitation.campaign.type as string,
    status: invitation.campaign.status as string,
    startDate: invitation.campaign.startDate,
    endDate: invitation.campaign.endDate,
    createdAt: invitation.campaign.createdAt,
    updatedAt: invitation.campaign.updatedAt,
  },
  brand: {
    id: invitation.brand.id,
    name: invitation.brand.name,
    user: {
      name: invitation.brand.user.name,
      email: invitation.brand.user.email || '', // Provide default if null
      image: invitation.brand.user.image,
    },
  },
  isActive: invitation.isActive,
  isCompleted: invitation.isCompleted,
  daysRemaining: invitation.daysRemaining,
  campaignDuration: invitation.campaignDuration,
});

// Components
const StatsCard: React.FC<{ 
  title: string; 
  value: string | number; 
  change?: string; 
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, change, icon, color = "text-muted-foreground" }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={color}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && <p className="text-xs text-muted-foreground">{change}</p>}
    </CardContent>
  </Card>
);

const CampaignCard: React.FC<{ 
  campaign: Campaign; 
  onRespond?: (invitationId: string, response: 'ACCEPTED' | 'REJECTED') => Promise<void>;
}> = ({ campaign, onRespond }) => {
  const [isResponding, setIsResponding] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getInvitationStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REJECTED': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'COMPLETED': return <Target className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleResponse = async (response: 'ACCEPTED' | 'REJECTED') => {
    if (!onRespond) return;
    
    setIsResponding(true);
    try {
      await onRespond(campaign.invitationId, response);
    } finally {
      setIsResponding(false);
    }
  };

  function formatDate(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={campaign.brand.user.image || undefined} alt={campaign.brand.name} />
              <AvatarFallback>{campaign.brand.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{campaign.campaign.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <span>by {campaign.brand.name}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  {getInvitationStatusIcon(campaign.invitationStatus)}
                  <span className="capitalize">{campaign.invitationStatus.toLowerCase()}</span>
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(campaign.campaign.status)}>
            {campaign.campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Campaign Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Tipe Campaign</div>
              <div className="font-medium capitalize">{campaign.campaign.type.toLowerCase()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Durasi</div>
              <div className="font-medium">{campaign.campaignDuration || 'N/A'} days</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tanggal Mulai</div>
              <div className="font-medium">{formatDate(campaign.campaign.startDate)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tanggal Berakhir</div>
              <div className="font-medium">{formatDate(campaign.campaign.endDate)}</div>
            </div>
          </div>

          {/* Days Remaining */}
          {campaign.daysRemaining !== null && campaign.daysRemaining > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {campaign.daysRemaining} hari tersisa
              </span>
            </div>
          )}

          {/* Goal */}
          {campaign.campaign.goal && (
            <div>
              <div className="text-sm text-muted-foreground">Tujuan Campaign</div>
              <div className="text-sm">{campaign.campaign.goal}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            {campaign.invitationStatus === 'PENDING' && onRespond && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => handleResponse('ACCEPTED')}
                  disabled={isResponding}
                  className="flex-1"
                >
                  {isResponding ? 'Processing...' : 'Accept'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleResponse('REJECTED')}
                  disabled={isResponding}
                  className="flex-1"
                >
                  {isResponding ? 'Processing...' : 'Reject'}
                </Button>
              </>
            )}
            {campaign.invitationStatus !== 'PENDING' && (
              <Button variant="outline" className="w-full">
                Lihat Selengkapnya
              </Button>
            )}
          </div>

          {/* Invitation Date */}
          <div className="text-xs text-muted-foreground border-t pt-2">
            Invited: {formatDate(campaign.invitedAt)}
            {campaign.respondedAt && (
              <span> • Responded: {formatDate(campaign.respondedAt)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BrandStatsCard: React.FC<{ brandStat: BrandStats }> = ({ brandStat }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{brandStat.brand.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">{brandStat.brand.name}</CardTitle>
          <CardDescription>{brandStat.stats.total} campaigns</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Aktif</span>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {brandStat.stats.active}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Selesai</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {brandStat.stats.completed}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tertunda</span>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {brandStat.stats.pending}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Ditolak</span>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            {brandStat.stats.rejected}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Dashboard Component
const KOLDashboard: React.FC = () => {
  // State - Updated to use the correct type
  const [campaigns, setCampaigns] = useState<InvitationWithCampaign[]>([]);
  const [brandStats, setBrandStats] = useState<BrandStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalBrands: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    pendingInvitations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load campaigns and stats in parallel
      const [campaignResult, statsResult] = await Promise.all([
        getCampaignsByBrandForInfluencer(),
        getInfluencerCampaignStatsByBrand()
      ]);

      if (campaignResult.success && campaignResult.data) {
        setCampaigns(campaignResult.data.campaigns);
      } else {
        console.error('Failed to load campaigns:', campaignResult.message);
      }

      if (statsResult.success && statsResult.data) {
        setBrandStats(statsResult.data.statsByBrand);
        setOverallStats(statsResult.data.overallStats);
      } else {
        console.error('Failed to load stats:', statsResult.message);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle invitation response
  const handleInvitationResponse = async (invitationId: string, response: 'ACCEPTED' | 'REJECTED') => {
    try {
      // Find the campaign to get influencer info
      const campaign = campaigns.find(c => c.invitationId === invitationId);
      if (!campaign) return;

      const result = await respondToCampaignInvitation({
        invitationId,
        influencerId: campaign.brand.id, // This should be the actual influencer ID
        response,
        message: response === 'REJECTED' ? 'Thank you for the opportunity, but I cannot participate at this time.' : undefined
      });

      if (result.success) {
        // Refresh data
        await loadDashboardData();
      } else {
        setError(result.error || 'Failed to respond to invitation');
      }
    } catch (err) {
      setError('Failed to respond to invitation');
      console.error('Response error:', err);
    }
  };

  // Filter campaigns - Convert to legacy format for filtering
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.brand.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = selectedBrand === 'all' || campaign.brand.id === selectedBrand;
    const matchesStatus = selectedStatus === 'all' || campaign.invitationStatus === selectedStatus;
    
    return matchesSearch && matchesBrand && matchesStatus;
  });

  // Get unique brands for filter
  const uniqueBrands = Array.from(
    new Map(campaigns.map(c => [c.brand.id, c.brand])).values()
  );

  const statuses = ['all', 'PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Overview Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={loadDashboardData}>
                <Download size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Campaigns"
            value={overallStats.totalCampaigns}
            change={`From ${overallStats.totalBrands} brands`}
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <StatsCard
            title="Campaigns Aktif"
            value={overallStats.activeCampaigns}
            icon={<TrendingUp className="h-4 w-4" />}
            color="text-green-600"
          />
          <StatsCard
            title="Selesai"
            value={overallStats.completedCampaigns}
            icon={<CheckCircle className="h-4 w-4" />}
            color="text-blue-600"
          />
          <StatsCard
            title="Undangan Tertunda"
            value={overallStats.pendingInvitations}
            icon={<Clock className="h-4 w-4" />}
            color="text-yellow-600"
          />
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="campaigns">Kolaborasi Campaigns</TabsTrigger>
            <TabsTrigger value="brands">Daftar Brand</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Management</CardTitle>
                <CardDescription>Kelola undangan kampanye dan kolaborasi aktif Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pencarian campaigns dan brands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Semua Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Brands</SelectItem>
                        {uniqueBrands.map(brand => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status === 'all' ? 'Semua Status' : status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map(campaign => (
                <CampaignCard 
                  key={campaign.invitationId} 
                  campaign={convertToLegacyCampaign(campaign)}
                  onRespond={handleInvitationResponse}
                />
              ))}
            </div>

            {filteredCampaigns.length === 0 && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    {campaigns.length === 0 
                      ? "No campaigns found. You haven't been invited to any campaigns yet."
                      : "No campaigns match your search criteria"
                    }
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="brands" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Brand Analistik</h2>
                <p className="text-muted-foreground">Ringkasan Daftar Brand yang Berkolaborasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandStats.map(brandStat => (
                <BrandStatsCard key={brandStat.brand.id} brandStat={brandStat} />
              ))}
            </div>

            {brandStats.length === 0 && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">No brand collaborations found</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KOLDashboard;