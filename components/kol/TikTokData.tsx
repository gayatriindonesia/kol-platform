'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSync, FaTrash, FaTiktok, FaMoneyBillWave } from "react-icons/fa";
import { toast } from "sonner";
import { disconnectTikTok, refreshTikTokData } from "@/lib/tiktok.actions";
import { getRateCardsByInfluencerPlatform } from "@/lib/rateCard.actions";
import { formatCurrency } from "@/lib/utils";
import { InfluencerPlatform, RateCard, Service } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ConnectTikTokButton from "./ConnectTikTokButton";

interface TikTokDataProps {
  connections: (InfluencerPlatform & {
    platform: {
      id: string;
      name: string;
    };
  })[];
}

interface RateCardWithService extends RateCard {
  service: Service;
}

export default function TikTokData({ connections: initialConnections }: TikTokDataProps) {
  const [connections, setConnections] = useState(initialConnections);
  const [isRefreshing, setIsRefreshing] = useState<Record<string, boolean>>({});
  const [isDisconnecting, setIsDisconnecting] = useState<Record<string, boolean>>({});
  const [lastAutoRefresh, setLastAutoRefresh] = useState<Date | null>(null);
  const [rateCards, setRateCards] = useState<Record<string, RateCardWithService[]>>({});
  const [showRateCards, setShowRateCards] = useState<Record<string, boolean>>({});

  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;

    setIsDisconnecting(prev => ({ ...prev, [disconnectTarget]: true }));
    try {
      const result = await disconnectTikTok(disconnectTarget);
      if (result.success) {
        toast.success("TikTok account disconnected");
        setConnections(prev => prev.filter(conn => conn.id !== disconnectTarget));
      } else {
        toast.error(result.error || "Failed to disconnect account");
      }
    } catch (error) {
      console.error("An error occurred while disconnecting account", error);
      toast.error("An error occurred while disconnecting account");
    } finally {
      setIsDisconnecting(prev => ({ ...prev, [disconnectTarget!]: false }));
      setDisconnectTarget(null);
      setIsDialogOpen(false);
    }
  };

  const loadRateCards = async (connectionId: string) => {
    try {
      const result = await getRateCardsByInfluencerPlatform(connectionId);
      if (result.success && result.data) {
        setRateCards(prev => ({ ...prev, [connectionId]: result.data as RateCardWithService[] }));
      }
    } catch (error) {
      console.error("Failed to load rate cards:", error);
    }
  };

  const toggleRateCards = async (connectionId: string) => {
    const isCurrentlyShown = showRateCards[connectionId];
    setShowRateCards(prev => ({ ...prev, [connectionId]: !isCurrentlyShown }));

    if (!isCurrentlyShown && !rateCards[connectionId]) {
      await loadRateCards(connectionId);
    }
  };

  if (connections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaTiktok className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium">No TikTok accounts connected</h3>
        <p className="mt-1">Connect your TikTok account to display analytics and manage campaigns.</p>
        {/** Tiktok Button Connect */}
        <div className="flex justify-center mt-4">
          <ConnectTikTokButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Action Buttons - Moved to top */}
      <div className="flex flex-wrap gap-2">
        {connections.map((connection) => (
          <div key={connection.id} className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleRateCards(connection.id)}
            >
              <FaMoneyBillWave className="w-4 h-4 mr-2" />
              {showRateCards[connection.id] ? 'Hide' : 'Show'} Rate Cards
            </Button>
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
              onClick={() => {
                setDisconnectTarget(connection.id);
                setIsDialogOpen(true);
              }}
            >
              {isDisconnecting[connection.id] ? (
                <FaTrash className="w-4 h-4 mr-2 animate-pulse" />
              ) : (
                <FaTrash className="w-4 h-4 mr-2" />
              )}
              Disconnect
            </Button>
          </div>
        ))}
      </div>

      {/* Auto-refresh status bar */}
      <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
        {lastAutoRefresh && (
          <span>Last auto-refresh: {lastAutoRefresh.toLocaleTimeString()}</span>
        )}
      </div>

      {connections.map((connection) => {
        const platformData = connection.platformData as any;

        return (
          <div key={connection.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
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

            {/* Rate Cards Section */}
            {showRateCards[connection.id] && (
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <FaMoneyBillWave className="text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Rate Cards</h4>
                  <span className="text-sm text-gray-500">
                    (Harga dalam IDR)
                  </span>
                </div>

                {rateCards[connection.id] && rateCards[connection.id].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rateCards[connection.id].map((rateCard) => (
                      <div
                        key={rateCard.id}
                        className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">
                            {rateCard.service.name}
                          </h5>
                          {rateCard.autoGenerated && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                              Auto
                            </span>
                          )}
                        </div>

                        <p className="text-2xl font-bold text-green-600 mb-2">
                          {formatCurrency(rateCard.price)}
                        </p>

                        {rateCard.service.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {rateCard.service.description}
                          </p>
                        )}

                        {rateCard.description && (
                          <p className="text-xs text-gray-500 italic">
                            {rateCard.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span>Type: {rateCard.service.type}</span>
                          <span>
                            Updated: {new Date(rateCard.updatedAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaMoneyBillWave className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>Belum ada rate card tersedia</p>
                    <p className="text-sm mt-1">Rate card akan dibuat otomatis saat koneksi TikTok berhasil</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* AlertDialog untuk Disconnect */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Akun Tiktok</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda ingin disconnect akun Tiktok Anda?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisconnectTarget(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}