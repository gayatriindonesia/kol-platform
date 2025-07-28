'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSync, FaTrash, FaTiktok } from "react-icons/fa";
import { toast } from "sonner";
import { disconnectTikTok, refreshTikTokData } from "@/lib/tiktok.actions";
import { InfluencerPlatform } from "@prisma/client";

interface TikTokDataProps {
  connections: (InfluencerPlatform & {
    platform: {
      id: string;
      name: string;
    };
  })[];
}

export default function TikTokData({ connections: initialConnections }: TikTokDataProps) {
  const [connections, setConnections] = useState(initialConnections);
  const [isRefreshing, setIsRefreshing] = useState<Record<string, boolean>>({});
  const [isDisconnecting, setIsDisconnecting] = useState<Record<string, boolean>>({});
  const [lastAutoRefresh, setLastAutoRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const autoRefreshInterval = setInterval(async () => {
      if (connections.length > 0) {
        console.log('Auto-refreshing TikTok data...');
        await handleAutoRefresh();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(autoRefreshInterval);
  }, [connections.length]);

  useEffect(() => {
    if (connections.length > 0) {
      const checkAndRefresh = async () => {
        const now = new Date();
        const shouldRefresh = connections.some(conn => {
          if (!conn.lastSynced) return true;
          const lastSynced = new Date(conn.lastSynced);
          const diffMinutes = (now.getTime() - lastSynced.getTime()) / (1000 * 60);
          return diffMinutes > 60;
        });

        if (shouldRefresh) {
          await handleAutoRefresh();
        }
      };
      checkAndRefresh();
    }
  }, []);

  const handleAutoRefresh = async () => {
    try {
      setLastAutoRefresh(new Date());

      const refreshPromises = connections.map(async (connection) => {
        try {
          const result = await refreshTikTokData(connection.id);
          if (result.success) {
            const response = await fetch('/api/tiktok-connections');
            if (response.ok) {
              const updatedConnections = await response.json();
              return updatedConnections.find((conn: any) => conn.id === connection.id);
            }
          }
          return connection;
        } catch (error) {
          console.error(`Failed to refresh connection ${connection.id}:`, error);
          return connection;
        }
      });

      const updatedConnections = await Promise.all(refreshPromises);
      setConnections(updatedConnections.filter(Boolean));
      console.log('Auto-refresh completed');
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    }
  };

  const handleManualRefresh = async (connectionId: string) => {
    setIsRefreshing(prev => ({ ...prev, [connectionId]: true }));
    try {
      const result = await refreshTikTokData(connectionId);
      if (result.success) {
        toast.success("TikTok data refreshed successfully");
        const response = await fetch('/api/tiktok-connections');
        if (response.ok) {
          const updatedConnections = await response.json();
          setConnections(updatedConnections);
        }
      } else {
        toast.error(result.error || "Failed to refresh data");
      }
    } catch (error) {
      console.error("An error occurred while refreshing data", error);
      toast.error("An error occurred while refreshing data");
    } finally {
      setIsRefreshing(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this TikTok account?")) return;

    setIsDisconnecting(prev => ({ ...prev, [connectionId]: true }));
    try {
      const result = await disconnectTikTok(connectionId);
      if (result.success) {
        toast.success("TikTok account disconnected");
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      } else {
        toast.error(result.error || "Failed to disconnect account");
      }
    } catch (error) {
      console.error("An error occurred while disconnecting account", error);
      toast.error("An error occurred while disconnecting account");
    } finally {
      setIsDisconnecting(prev => ({ ...prev, [connectionId]: false }));
    }
  };

  if (connections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaTiktok className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium">No TikTok accounts connected</h3>
        <p className="mt-1">Connect your TikTok account to display analytics and manage campaigns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
        <span>Auto-refresh: Active (every 5 minutes)</span>
        {lastAutoRefresh && (
          <span>Last auto-refresh: {lastAutoRefresh.toLocaleTimeString()}</span>
        )}
      </div>

      {connections.map((connection) => {
        const platformData = connection.platformData as any;

        return (
          <div key={connection.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {platformData?.avatarUrl ? (
                  <img
                    src={platformData.avatarUrl}
                    alt="Avatar"
                    className="h-12 w-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center">
                    <FaTiktok className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">@{connection.username}</h3>
                  <p className="text-sm text-gray-500">
                    Last synced: {connection.lastSynced ? new Date(connection.lastSynced).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing[connection.id]}
                  onClick={() => handleManualRefresh(connection.id)}
                >
                  {isRefreshing[connection.id] ? (
                    <FaSync className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <FaSync className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDisconnecting[connection.id]}
                  onClick={() => handleDisconnect(connection.id)}
                >
                  {isDisconnecting[connection.id] ? (
                    <FaTrash className="w-4 h-4 mr-2 animate-pulse" />
                  ) : (
                    <FaTrash className="w-4 h-4 mr-2" />
                  )}
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="border rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">Followers</p>
                <p className="text-xl font-semibold">{connection.followers.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">Posts</p>
                <p className="text-xl font-semibold">{connection.posts.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">Following</p>
                <p className="text-xl font-semibold">
                  {platformData?.followingCount?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>

            {platformData && (
              <div className="mt-6 border-t pt-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {platformData.likesCount !== undefined && (
                    <div className="border rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-500">Total Likes</p>
                      <p className="text-xl font-semibold">
                        {platformData.likesCount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {platformData.videoCount !== undefined && (
                    <div className="border rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-500">Video Count</p>
                      <p className="text-xl font-semibold">
                        {platformData.videoCount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {connection.engagementRate !== null && (
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Engagement Rate</p>
                    <p className="text-xl font-semibold">
                      {connection.engagementRate?.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
