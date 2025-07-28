'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Instagram, RefreshCw, Unlink, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  disconnectInstagram, 
  syncInstagramData 
} from '@/lib/instagram.actions';
import { advancedInstagramSync } from '@/lib/instagram-advanced.actions';
import InstagramAdvancedPanel from './InstagramAdvancedPanel';

interface InstagramConnectProps {
  isConnected?: boolean;
  username?: string;
  lastSynced?: Date | null;
  connection?: any; // Full connection data for advanced features
  showAdvanced?: boolean;
}

export default function InstagramConnectButton({
  isConnected = false,
  username,
  lastSynced,
  connection,
  showAdvanced = false
}: InstagramConnectProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [advancedSyncing, setAdvancedSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(showAdvanced);

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

  // Handler untuk menautkan Instagram
  const handleConnectInstagram = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Redirect to server route that handles Instagram OAuth
      window.location.href = '/api/instagram/authorize';
    } catch (error) {
      console.error("Error connecting Instagram:", error);
      setError(error instanceof Error ? error.message : "Failed to connect Instagram");
      setLoading(false);
    }
  };

  // Handler untuk memutuskan koneksi Instagram
  const handleDisconnectInstagram = async () => {
    if (!confirm("Are you sure you want to disconnect your Instagram account?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await disconnectInstagram();
      
      if (result.success) {
        setSuccess("Instagram account disconnected successfully");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(result.message || "Failed to disconnect Instagram account");
      }
    } catch (error) {
      console.error("Error disconnecting Instagram:", error);
      setError(error instanceof Error ? error.message : "Failed to disconnect Instagram");
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk sinkronisasi data Instagram
  const handleSyncInstagram = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccess(null);
      
      const result = await syncInstagramData();
      
      if (result.success) {
        setSuccess("Instagram data synced successfully");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(result.message || "Failed to sync Instagram data");
      }
    } catch (error) {
      console.error("Error syncing Instagram data:", error);
      setError(error instanceof Error ? error.message : "Failed to sync Instagram data");
    } finally {
      setSyncing(false);
    }
  };

  // Handler untuk advanced sync
  const handleAdvancedSync = async () => {
    try {
      setAdvancedSyncing(true);
      setError(null);
      setSuccess(null);
      
      const result = await advancedInstagramSync();
      
      if (result.success) {
        setSuccess("Advanced Instagram data synced successfully");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(result.message || "Failed to sync advanced Instagram data");
      }
    } catch (error) {
      console.error("Error syncing advanced Instagram data:", error);
      setError(error instanceof Error ? error.message : "Failed to sync advanced Instagram data");
    } finally {
      setAdvancedSyncing(false);
    }
  };

  // Format last synced date
  const formatLastSynced = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('default', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  };

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Instagram className="w-5 h-5 text-pink-500" />
          <h3 className="font-medium">Instagram Account</h3>
        </div>
        
        {isConnected ? (
          <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Connected
          </div>
        ) : (
          <div className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
            Not Connected
          </div>
        )}
      </div>

      {isConnected && username && (
        <div className="flex flex-col text-sm space-y-1">
          <div className="flex items-center text-gray-500">
            <span className="font-medium mr-2">Username:</span>
            <a 
              href={`https://instagram.com/${username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              @{username}
            </a>
          </div>
          {lastSynced && (
            <div className="text-xs text-gray-500">
              Last synced: {formatLastSynced(lastSynced)}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {isConnected ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnectInstagram}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <Unlink className="w-4 h-4 mr-1" />
              {loading ? 'Processing...' : 'Disconnect'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncInstagram}
              disabled={syncing}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Basic Sync'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdvancedSync}
              disabled={advancedSyncing}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${advancedSyncing ? 'animate-spin' : ''}`} />
              {advancedSyncing ? 'Advanced Syncing...' : 'Advanced Sync'}
            </Button>
            {connection && (
              <Button
                variant={showAdvancedPanel ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                className="flex items-center space-x-1"
              >
                <Instagram className="w-4 h-4 mr-1" />
                {showAdvancedPanel ? 'Hide Analytics' : 'Show Analytics'}
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={handleConnectInstagram}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center"
          >
            <Instagram className="w-4 h-4 mr-2" />
            {loading ? 'Processing...' : 'Connect Instagram'}
          </Button>
        )}
      </div>

      {/* Advanced Analytics Panel */}
      {isConnected && connection && showAdvancedPanel && (
        <div className="mt-6">
          <InstagramAdvancedPanel 
            connection={connection} 
            onUpdate={() => window.location.reload()}
          />
        </div>
      )}
    </div>
  );
}