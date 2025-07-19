'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Instagram, RefreshCw, Unlink } from 'lucide-react';
import {
  disconnectInstagram, 
  syncInstagramData 
} from '@/lib/instagram.actions';
// import { useToast } from '@/components/ui/use-toast';

interface InstagramConnectProps {
  isConnected?: boolean;
  username?: string;
  lastSynced?: Date | null;
}

export default function InstagramConnectButton({
  isConnected = false,
  username,
  lastSynced
}: InstagramConnectProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
//  const { toast } = useToast();

  // Handler untuk menautkan Instagram
  // Handler untuk menautkan Instagram
  const handleConnectInstagram = async () => {
    try {
      setLoading(true);
      // Alihkan ke server route yang menangani redirect ke Instagram
      window.location.href = '/api/instagram/authorize';
    } catch (error) {
      console.error("Error connecting Instagram:", error);
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
      const result = await disconnectInstagram();
      
      if (result.success) {
        // toast({
        //  title: "Success",
        //  description: "Instagram account disconnected successfully",
        // });
        window.location.reload();
      } else {
        // toast({
        //  title: "Disconnection Failed",
        //  description: result.message || "Failed to disconnect Instagram account",
        //  variant: "destructive"
        // });
      }
    } catch (error) {
      console.error("Error disconnecting Instagram:", error);
      //toast({
      //  title: "Disconnection Failed",
      //  description: error instanceof Error ? error.message : "An error occurred",
      //  variant: "destructive"
      // });
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk sinkronisasi data Instagram
  const handleSyncInstagram = async () => {
    try {
      setSyncing(true);
      const result = await syncInstagramData();
      
      if (result.success) {
        // toast({
        //  title: "Success",
        //  description: "Instagram data synced successfully",
        // });
        window.location.reload();
      } else {
        // toast({
        //  title: "Sync Failed",
        //  description: result.message || "Failed to sync Instagram data",
        //  variant: "destructive"
        // });
      }
    } catch (error) {
      console.error("Error syncing Instagram data:", error);
      // toast({
      //  title: "Sync Failed",
      //  description: error instanceof Error ? error.message : "An error occurred",
      //  variant: "destructive"
      // });
    } finally {
      setSyncing(false);
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

      <div className="flex space-x-2 mt-2">
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
              {syncing ? 'Syncing...' : 'Sync Data'}
            </Button>
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
    </div>
  );
}