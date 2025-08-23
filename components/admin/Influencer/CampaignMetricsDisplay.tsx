'use client';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity, AlertTriangle, BarChart3, CheckCircle, Clock, Eye, Heart,
  Lightbulb,
  Loader2, MessageCircle, Target, TrendingDown, TrendingUp
} from 'lucide-react';
import {
  getMetricInsights, generateRecommendations
} from '@/lib/utils';

// Interfaces
interface MetricCard {
  value: number;
  label: string;
  description: string;
}

interface CampaignMetrics {
  reachRate: MetricCard;
  engagementRate: MetricCard;
  responseRate: MetricCard;
  completionRate: MetricCard;
  onTimeDeliveryRate: MetricCard;
}

interface MetricsResponse {
  success: boolean;
  data: {
    campaignId: string;
    metrics: CampaignMetrics;
    rawData: {
      totalReach: number;
      totalImpressions: number;
      totalEngagements: number;
      totalInvitations: number;
      totalResponses: number;
      totalDeliverables: number;
      completedDeliverables: number;
      onTimeDeliveries: number;
      lateDeliveries: number;
    };
  };
}

interface CampaignMetricsDisplayProps {
  campaignId: string;
  campaignName?: string;
}

export function CampaignMetricsDisplay({ campaignId, campaignName }: CampaignMetricsDisplayProps) {
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Array<{ type: string, message: string, priority: 'high' | 'medium' | 'low' }>>([]);

  // Use useCallback to memoize fetchMetrics and fix the useEffect dependency warning
  const fetchMetrics = useCallback(async (refresh = false) => {
    if (!campaignId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/campaigns/${campaignId}${refresh ? '?refresh=true' : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MetricsResponse = await response.json();

      if (data.success) {
        setMetrics(data.data.metrics);
        setRawData(data.data.rawData);

        // Generate insights dan recommendations
        const metricsData = Object.fromEntries(
          Object.entries(data.data.metrics).map(([key, metric]) => [key, { value: metric.value }])
        );
        setInsights(getMetricInsights(metricsData));
        setRecommendations(
          generateRecommendations(metricsData).map((rec) => ({
            type: rec.type,
            message: rec.description,
            priority: rec.type === "warning" ? "high" : "medium",
          }))
        );

      } else {
        setError('Failed to fetch metrics data');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Terjadi kesalahan saat mengambil data metrics');
    } finally {
      setLoading(false);
    }
  }, [campaignId]); // Add campaignId as dependency

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]); // Now fetchMetrics is included as dependency

  const getMetricColor = (value: number, type: string) => {
    if (type === 'reachRate' || type === 'engagementRate') {
      if (value >= 80) return 'text-green-600';
      if (value >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }

    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'reachRate':
        return <Eye className="w-5 h-5" />;
      case 'engagementRate':
        return <Heart className="w-5 h-5" />;
      case 'responseRate':
        return <MessageCircle className="w-5 h-5" />;
      case 'completionRate':
        return <CheckCircle className="w-5 h-5" />;
      case 'onTimeDeliveryRate':
        return <Clock className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingDown className="w-4 h-4" />;
      case 'low': return <TrendingUp className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat campaign metrics...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => fetchMetrics(true)}
          >
            Coba Lagi
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertDescription>
          Data metrics tidak tersedia untuk campaign ini.
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => fetchMetrics(true)}
          >
            Refresh Data
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Metrics</h2>
          {campaignName && (
            <p className="text-gray-600 mt-1">{campaignName}</p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => fetchMetrics(true)}
          disabled={loading}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(metrics).map(([key, metric]) => (
          <Card key={key} className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-100 ${getMetricColor(metric.value, key)}`}>
                  {getMetricIcon(key)}
                </div>
                <Badge
                  variant="outline"
                  className={`${getMetricColor(metric.value, key)} border-current`}
                >
                  {metric.value >= 90 ? 'Excellent' :
                    metric.value >= 70 ? 'Good' :
                      metric.value >= 50 ? 'Fair' : 'Poor'}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 text-sm">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h3>
                <p className={`text-3xl font-bold ${getMetricColor(metric.value, key)}`}>
                  {metric.label}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {metric.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Campaign Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-blue-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                  <div className="flex-shrink-0">
                    {getPriorityIcon(rec.priority)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {rec.priority} Priority
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {rec.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{rec.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Data Summary */}
      {rawData && (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(rawData.totalReach)}
                </p>
                <p className="text-sm text-blue-700">Total Reach</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(rawData.totalImpressions)}
                </p>
                <p className="text-sm text-purple-700">Impressions</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(rawData.totalEngagements)}
                </p>
                <p className="text-sm text-green-700">Engagements</p>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {rawData.totalResponses} / {rawData.totalInvitations}
                </p>
                <p className="text-sm text-orange-700">Responses</p>
              </div>

              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {rawData.completedDeliverables} / {rawData.totalDeliverables}
                </p>
                <p className="text-sm text-indigo-700">Deliverables</p>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {rawData.onTimeDeliveries} / {rawData.onTimeDeliveries + rawData.lateDeliveries}
                </p>
                <p className="text-sm text-red-700">On Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}