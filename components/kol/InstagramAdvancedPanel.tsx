'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Instagram,
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  BarChart3,
  Calendar,
  Image as ImageIcon,
  Video,
  Grid3X3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import {
  getInstagramInsights,
  getInstagramMediaInsights,
  advancedInstagramSync
} from '@/lib/instagram-advanced.actions';

interface InstagramAdvancedPanelProps {
  connection: any; // Instagram connection data
  onUpdate?: () => void;
}

export default function InstagramAdvancedPanel({ 
  connection, 
  onUpdate 
}: InstagramAdvancedPanelProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [mediaInsights, setMediaInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Handle advanced sync
  const handleAdvancedSync = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await advancedInstagramSync();
      
      if (result.success) {
        setSuccess("Advanced Instagram data synced successfully");
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error in advanced sync:", error);
      setError(error instanceof Error ? error.message : "Failed to sync Instagram data");
    } finally {
      setLoading(false);
    }
  };

  // Handle insights fetch
  const handleFetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = {
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        until: new Date().toISOString().split('T')[0] // today
      };

      const result = await getInstagramInsights(dateRange);
      
      if (result.success) {
        setInsights(result.data);
        setSuccess("Instagram insights fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch Instagram insights");
    } finally {
      setLoading(false);
    }
  };

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Get analytics from platform data
  const analytics = connection?.platformData?.analytics || {};
  const profile = connection?.platformData?.profile || {};
  const recentMedia = connection?.platformData?.recentMedia || [];

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            <CardTitle className="text-lg">Instagram Analytics</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchInsights}
              disabled={loading || connection?.igAccountType === 'PERSONAL'}
              className="flex items-center space-x-1"
            >
              <BarChart3 className="h-4 w-4" />
              {connection?.igAccountType === 'PERSONAL' ? 'Business Required' : 'Fetch Insights'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdvancedSync}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Syncing...' : 'Advanced Sync'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(connection?.followers || 0)}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <Users className="h-3 w-3 mr-1" />
                Followers
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {connection?.posts || 0}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <Grid3X3 className="h-3 w-3 mr-1" />
                Posts
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.engagementRate || 0}%
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Engagement
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.postFrequency || 0}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center">
                <Calendar className="h-3 w-3 mr-1" />
                Posts/Week
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">@{connection?.username}</span>
                <Badge variant={
                  connection?.igAccountType === 'BUSINESS' ? 'default' :
                  connection?.igAccountType === 'CREATOR' ? 'secondary' : 'outline'
                }>
                  {connection?.igAccountType || 'Personal'}
                </Badge>
              </div>
              <a
                href={`https://instagram.com/${connection?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center text-sm"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Profile
              </a>
            </div>
            {connection?.lastSynced && (
              <div className="text-xs text-gray-500 mt-1">
                Last synced: {new Date(connection.lastSynced).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  Average Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Likes per post:</span>
                    <span className="font-medium">{formatNumber(analytics.avgLikes || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Comments per post:</span>
                    <span className="font-medium">{formatNumber(analytics.avgComments || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total engagement:</span>
                    <span className="font-medium">{formatNumber(analytics.totalEngagement || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  Top Performing Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topPerformingPost ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      {new Date(analytics.topPerformingPost.timestamp).toLocaleDateString()}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Likes:</span>
                      <span className="font-medium">{formatNumber(analytics.topPerformingPost.like_count || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Comments:</span>
                      <span className="font-medium">{formatNumber(analytics.topPerformingPost.comments_count || 0)}</span>
                    </div>
                    <a
                      href={analytics.topPerformingPost.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Post
                    </a>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Content Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">Images</span>
                    </div>
                    <span className="font-medium">{analytics.mediaTypeDistribution?.IMAGE || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm">Videos</span>
                    </div>
                    <span className="font-medium">{analytics.mediaTypeDistribution?.VIDEO || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Grid3X3 className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Carousels</span>
                    </div>
                    <span className="font-medium">{analytics.mediaTypeDistribution?.CAROUSEL_ALBUM || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                  Posting Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Posts per week:</span>
                    <span className="font-medium">{analytics.postFrequency || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total posts:</span>
                    <span className="font-medium">{connection?.posts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Recent posts (30d):</span>
                    <span className="font-medium">{recentMedia.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Audience Overview
              </CardTitle>
              <CardDescription>
                Basic audience information from your Instagram profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(connection?.followers || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(profile.follows_count || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.engagementRate || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Engagement Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-orange-500" />
                Instagram Insights
              </CardTitle>
              <CardDescription>
                {connection?.igAccountType === 'PERSONAL' 
                  ? 'Insights are only available for Business and Creator accounts' 
                  : 'Detailed performance metrics from Instagram Business API'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connection?.igAccountType === 'PERSONAL' ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Switch to a Business or Creator account to access detailed insights</p>
                </div>
              ) : insights ? (
                <div className="space-y-4">
                  {insights.map((insight: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {insight.values.map((value: any, valueIndex: number) => (
                          <div key={valueIndex} className="text-center">
                            <div className="text-lg font-bold">{formatNumber(value.value)}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(value.end_time).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">Click "Fetch Insights" to load your Instagram performance data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}