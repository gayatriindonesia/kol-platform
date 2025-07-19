// components/brand/Campaign/EnhancedCampaignDetail.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw, Info, User, Building } from 'lucide-react';

interface Campaign {
  id: string;
  name?: string;
  status?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  updatedAt?: string | Date;
  type?: string;
  directData?: any;
  description?: string;
  budget?: number;
  currency?: string;
  targetAudience?: string;
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    ctr?: number;
    cpm?: number;
    cpc?: number;
  };
  platform?: string;
  createdBy?: string;
  brandId?: string;
  tags?: string[];
}

interface EnhancedCampaignDetailProps {
  campaignId: string;
  onRefresh?: () => void;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaignId: string) => void;
}

const EnhancedCampaignDetail: React.FC<EnhancedCampaignDetailProps> = ({
  campaignId,
  onRefresh,
  onEdit,
  onDelete
}) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data untuk demonstrasi
  const mockCampaign: Campaign = {
    id: campaignId,
    name: 'Summer Fashion Campaign 2024',
    status: 'active',
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    updatedAt: '2024-07-15T10:30:00Z',
    type: 'display',
    description: 'Kampanye musim panas untuk koleksi fashion terbaru dengan target audience generasi milenial dan Gen Z.',
    budget: 50000000,
    currency: 'IDR',
    targetAudience: 'Women 18-35, Fashion Enthusiasts',
    platform: 'Google Ads',
    createdBy: 'Marketing Team',
    brandId: 'brand-123',
    tags: ['summer', 'fashion', 'youth', 'trendy'],
    metrics: {
      impressions: 2500000,
      clicks: 125000,
      conversions: 2500,
      ctr: 5.0,
      cpm: 20000,
      cpc: 400
    }
  };

  useEffect(() => {
    fetchCampaignDetail();
  }, [campaignId]);

  const fetchCampaignDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dalam implementasi nyata, ganti dengan API call
      const response = await fetch(`/api/${campaignId}/status`);
        const data = await response.json();
      
      setCampaign(mockCampaign);
    } catch (err) {
      setError('Failed to load campaign details');
      console.error('Error fetching campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCampaignDetail();
      onRefresh?.();
    } catch (err) {
      console.error('Error refreshing campaign:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'ended':
      case 'completed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ended':
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR'
    }).format(amount);
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatPercentage = (num?: number) => {
    if (!num) return '0%';
    return `${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading campaign details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchCampaignDetail}
            className="ml-2"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!campaign) {
    return (
      <Alert className="m-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Campaign not found
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {campaign.name || 'Unnamed Campaign'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {formatDate(campaign.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(campaign.status)} border`}>
            {getStatusIcon(campaign.status)}
            <span className="ml-1 capitalize">{campaign.status || 'Unknown'}</span>
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="ml-1">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Campaign Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Campaign Type</label>
              <p className="text-sm text-gray-900 capitalize">{campaign.type || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Platform</label>
              <p className="text-sm text-gray-900">{campaign.platform || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Budget</label>
              <p className="text-sm text-gray-900">{formatCurrency(campaign.budget, campaign.currency)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Start Date</label>
              <p className="text-sm text-gray-900">{formatDate(campaign.startDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">End Date</label>
              <p className="text-sm text-gray-900">{formatDate(campaign.endDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Created By</label>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-900">{campaign.createdBy || '-'}</p>
              </div>
            </div>
          </div>
          
          {campaign.description && (
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="text-sm text-gray-900 mt-1">{campaign.description}</p>
            </div>
          )}

          {campaign.targetAudience && (
            <div>
              <label className="text-sm font-medium text-gray-600">Target Audience</label>
              <p className="text-sm text-gray-900 mt-1">{campaign.targetAudience}</p>
            </div>
          )}

          {campaign.tags && campaign.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Tags</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {campaign.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {campaign.metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(campaign.metrics.impressions)}
                </div>
                <div className="text-sm text-gray-600">Impressions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(campaign.metrics.clicks)}
                </div>
                <div className="text-sm text-gray-600">Clicks</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(campaign.metrics.conversions)}
                </div>
                <div className="text-sm text-gray-600">Conversions</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatPercentage(campaign.metrics.ctr)}
                </div>
                <div className="text-sm text-gray-600">CTR</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(campaign.metrics.cpm, campaign.currency)}
                </div>
                <div className="text-sm text-gray-600">CPM</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(campaign.metrics.cpc, campaign.currency)}
                </div>
                <div className="text-sm text-gray-600">CPC</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onEdit?.(campaign)}
            >
              Edit Campaign
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete?.(campaign.id)}
            >
              Delete Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCampaignDetail;