"use client"

import { Button } from '@/components/ui/button'
import { connectYouTubeAccount, disconnectYouTubeAccount } from '@/lib/youtube.actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react'
import { toast } from 'sonner';

interface YouTubeConnectionButtonProps {
  isConnected?: boolean;
  username?: string | null;
  lastSynced?: Date | null;
}

export function YouTubeConnectionButton(props: YouTubeConnectionButtonProps) {
  const { isConnected, username, lastSynced } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectYouTubeAccount();
    } catch (error) {
      console.error('YouTube connection error:', error);
      toast.error('Gagal menghubungkan akun YouTube. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Apakah Anda yakin ingin melepas koneksi YouTube? Semua data yang tersinkronisasi akan dihapus.')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      await disconnectYouTubeAccount();
      router.refresh(); // Refresh page untuk update UI
    } catch (error) {
      console.error('YouTube disconnect error:', error);
      // Optionally show error toast or message
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium">Terhubung sebagai {username}</p>
          <p className="text-xs text-gray-500">
            Terakhir disinkronkan: {lastSynced?.toLocaleString() || 'Belum pernah'}
          </p>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className='flex items-center gap-2'
        >
          {isDisconnecting && (
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
          )}
          {isDisconnecting ? 'Disconnection' : 'Disconnect'}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isLoading}
    >
      {isLoading ? 'Menghubungkan...' : 'Hubungkan YouTube'}
    </Button>
  );
}